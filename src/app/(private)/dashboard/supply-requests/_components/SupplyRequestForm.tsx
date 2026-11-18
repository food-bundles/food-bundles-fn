"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Check,
  Clock,
  CopyCheck,
  Loader2,
  MapPinned,
  Package,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { productService } from "@/app/services/productService";
import {
  Audience,
  errorMessage,
  RequestCustomer,
  ScheduleType,
  SupplyRequest,
  SupplyRequestItemInput,
  supplyRequestService,
  WEEKDAYS,
} from "@/app/services/supplyRequestService";
import { ChooseFarmers } from "./ChooseFarmers";

type ProductOption = { id: string; productName: string; unit: string; purchasePrice: number };

/** One day a product is needed on. An empty quantity means the product's usual quantity. */
type Day = { key: string; id?: string; weekday: number; date: string; quantity: string };

/** A product of the request, its usual quantity and price, and the days it is needed on */
type Line = { key: string; productId: string; quantity: string; price: string; days: Day[] };

const uid = () => Math.random().toString(36).slice(2);
const newLine = (): Line => ({ key: uid(), productId: "", quantity: "", price: "", days: [] });

/** YYYY-MM-DD in the user's time zone, `plus` days from today */
const dayFromToday = (plus = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + plus);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const today = () => dayFromToday(0);

const addDays = (day: string, plus: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + plus);
  return d.toISOString().slice(0, 10);
};

/** 1 = Monday … 7 = Sunday */
const weekdayOf = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay() || 7;

/** How many times a weekday falls in [from, to] */
const countWeekday = (weekday: number, from: string, to: string) => {
  if (!from || !to || to < from) return 0;
  const first = addDays(from, (weekday - weekdayOf(from) + 7) % 7);
  if (first > to) return 0;
  const span = (new Date(`${to}T00:00:00Z`).getTime() - new Date(`${first}T00:00:00Z`).getTime()) / 86_400_000;
  return Math.floor(span / 7) + 1;
};

/** The next given weekday after today */
const nextWeekday = (weekday: number) => {
  const now = today();
  return addDays(now, ((weekday - weekdayOf(now) + 7) % 7) || 7);
};

const formatDay = (day: string, long = false) =>
  day
    ? new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
        weekday: long ? "long" : "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      })
    : "";

const rwf = (value: number) => `RWF ${Math.round(value).toLocaleString()}`;

const SCHEDULES: { key: ScheduleType; label: string; hint: string; icon: typeof CalendarDays }[] = [
  { key: "ONCE", label: "Once", hint: "Everything on one day", icon: CalendarDays },
  { key: "WEEKLY", label: "Every week", hint: "On the same weekdays, between two dates", icon: Repeat },
  { key: "DATES", label: "Specific dates", hint: "Pick each delivery day", icon: CalendarRange },
];

const TIME_PRESETS = ["06:00", "07:00", "08:00", "10:00", "12:00"];
const WEEK_PRESETS = [
  { label: "2 weeks", days: 13 },
  { label: "1 month", days: 29 },
  { label: "3 months", days: 90 },
];

const STEPS = ["What", "When", "Who", "Review"] as const;
type StepName = (typeof STEPS)[number];
const STEP_HINT: Record<StepName, string> = {
  What: "The customer and the products they need",
  When: "The delivery days and the time products are needed by",
  Who: "Which farmers may see and supply the request",
  Review: "Check everything before sending",
};

/** A choice shown as a card (how often, who) */
function ChoiceCard({
  on,
  label,
  hint,
  icon: Icon,
  disabled,
  onClick,
}: {
  on: boolean;
  label: string;
  hint: string;
  icon: typeof CalendarDays;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed",
        on ? "border-green-600 bg-green-50 ring-1 ring-green-600" : "hover:border-gray-300 hover:bg-gray-50",
        disabled && !on && "opacity-50"
      )}
    >
      <span className={cn("rounded-lg p-1.5", on ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500")}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        <span className="block text-xs text-gray-500">{hint}</span>
      </span>
      {on && <Check className="absolute right-2.5 top-2.5 h-4 w-4 text-green-600" />}
    </button>
  );
}

/** A small rounded button for quick picks (dates, times, durations) */
function Chip({ on, children, onClick, disabled }: { on?: boolean; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50",
        on ? "border-green-600 bg-green-600 text-white" : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50"
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, hint, children, action }: { title: string; hint?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

interface SupplyRequestFormProps {
  open: boolean;
  request?: SupplyRequest | null; // edit when given
  onClose: () => void;
  onSaved: (request: SupplyRequest) => void;
}

/**
 * Create or edit a supply request in four steps:
 * 1. What: the customer and the products, with their usual quantity and price;
 * 2. When: once, every week, or on chosen dates; the days of each product (each can be removed or
 *    given its own quantity), and the time it is needed by;
 * 3. Who: farmers near it (automatic) or only the farmers chosen by place and crop;
 * 4. Review.
 * Editing skips "Who": farmers of a request are managed on its page.
 */
export function SupplyRequestForm({ open, request, onClose, onSaved }: SupplyRequestFormProps) {
  const editing = !!request;
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState<RequestCustomer[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [restaurantId, setRestaurantId] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [schedule, setSchedule] = useState<ScheduleType>("ONCE");
  const [onceDate, setOnceDate] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [neededTime, setNeededTime] = useState("08:00");
  const [audience, setAudience] = useState<Audience>("NEARBY");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [shownProblem, setShownProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const steps = editing ? STEPS.filter((s) => s !== "Who") : [...STEPS];
  const current = steps[step];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setShownProblem(null);
    supplyRequestService
      .customers()
      .then((list) => setCustomers(list || []))
      .catch(() => setCustomers([]));
    setLoadingProducts(true);
    productService
      .getAllProducts({ limit: 500 })
      .then((res: { data?: unknown }) => {
        const raw = res?.data as { products?: ProductOption[] } | ProductOption[] | undefined;
        const list = Array.isArray(raw) ? raw : raw?.products || [];
        setProducts(
          list
            .map((p) => ({ id: p.id, productName: p.productName, unit: p.unit, purchasePrice: p.purchasePrice }))
            .sort((a, b) => a.productName.localeCompare(b.productName))
        );
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));

    if (request) {
      const type = request.scheduleType ?? "WEEKLY";
      const items = request.items || [];
      const lineDates = [...new Set(items.map((i) => i.date?.slice(0, 10)).filter(Boolean) as string[])].sort();
      // One line per product and price; each item is one of its days
      const groups = new Map<string, typeof items>();
      for (const item of items) {
        const key = `${item.productId}|${item.price}`;
        groups.set(key, [...(groups.get(key) || []), item]);
      }
      setLines(
        [...groups.values()].map((group) => {
          const usual = group[0].quantity;
          return {
            key: uid(),
            productId: group[0].productId,
            quantity: String(usual),
            price: String(group[0].price),
            days: group.map((item) => ({
              key: item.id,
              id: item.id,
              weekday: item.weekday ?? 1,
              date: item.date?.slice(0, 10) ?? "",
              quantity: item.quantity === usual ? "" : String(item.quantity),
            })),
          };
        })
      );
      setRestaurantId(request.restaurant.id);
      setTitle(request.title || "");
      setNotes(request.notes || "");
      setSchedule(type);
      setOnceDate(type === "ONCE" ? lineDates[0] ?? "" : "");
      setDates(type === "DATES" ? lineDates : []);
      setNewDate("");
      setStartDate(request.startDate.slice(0, 10));
      setEndDate(request.endDate.slice(0, 10));
      setNeededTime(request.neededTime || "");
      setAudience(request.audience ?? "NEARBY");
    } else {
      setRestaurantId("");
      setTitle("");
      setNotes("");
      setSchedule("ONCE");
      setOnceDate("");
      setDates([]);
      setNewDate("");
      setStartDate(today());
      setEndDate("");
      setNeededTime("08:00");
      setAudience("NEARBY");
      setChosen(new Set());
      setLines([newLine()]);
    }
  }, [open, request]);

  const productOf = (id: string) => products.find((p) => p.id === id);
  const filled = lines.filter((l) => l.productId);
  const productIds = useMemo(() => [...new Set(lines.map((l) => l.productId).filter(Boolean))], [lines]);

  // ── Products ──────────────────────────────────────────────────────────────
  const updateLine = (key: string, changes: Partial<Line>) => {
    setShownProblem(null);
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...changes } : line)));
  };
  // Picking a product fills in its Food Bundles purchase price (editable)
  const pickProduct = (key: string, productId: string) =>
    updateLine(key, { productId, price: String(productOf(productId)?.purchasePrice || "") });
  const removeLine = (key: string) => setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : [newLine()]));

  // ── Days ──────────────────────────────────────────────────────────────────
  const changeSchedule = (next: ScheduleType) => {
    if (next === schedule) return;
    setShownProblem(null);
    setSchedule(next);
    // Days of one schedule mean nothing in another
    setLines((prev) => prev.map((l) => ({ ...l, days: [] })));
  };

  const sortDays = (days: Day[]) =>
    [...days].sort((a, b) => (schedule === "WEEKLY" ? a.weekday - b.weekday : a.date.localeCompare(b.date)));

  const hasDay = (line: Line, value: number | string) =>
    line.days.some((d) => (schedule === "WEEKLY" ? d.weekday === value : d.date === value));

  const toggleDay = (lineKey: string, value: number | string) => {
    setShownProblem(null);
    setLines((prev) =>
      prev.map((line) => {
        if (line.key !== lineKey) return line;
        if (hasDay(line, value)) {
          return { ...line, days: line.days.filter((d) => (schedule === "WEEKLY" ? d.weekday !== value : d.date !== value)) };
        }
        const day: Day =
          schedule === "WEEKLY"
            ? { key: uid(), weekday: value as number, date: "", quantity: "" }
            : { key: uid(), weekday: 1, date: value as string, quantity: "" };
        return { ...line, days: sortDays([...line.days, day]) };
      })
    );
  };

  const removeDay = (lineKey: string, dayKey: string) => {
    setShownProblem(null);
    setLines((prev) => prev.map((l) => (l.key === lineKey ? { ...l, days: l.days.filter((d) => d.key !== dayKey) } : l)));
  };

  const setDayQuantity = (lineKey: string, dayKey: string, quantity: string) =>
    setLines((prev) =>
      prev.map((l) => (l.key === lineKey ? { ...l, days: l.days.map((d) => (d.key === dayKey ? { ...d, quantity } : d)) } : l))
    );

  /** Every other product gets the same days as this one (days it already had keep their quantity) */
  const copyDaysToAll = (source: Line) => {
    setShownProblem(null);
    setLines((prev) =>
      prev.map((line) => {
        if (line.key === source.key || !line.productId) return line;
        const days = source.days.map((sd) => {
          const same = line.days.find((d) => (schedule === "WEEKLY" ? d.weekday === sd.weekday : d.date === sd.date));
          return same ?? { key: uid(), weekday: sd.weekday, date: sd.date, quantity: "" };
        });
        return { ...line, days };
      })
    );
    toast.success("Same days set for every product");
  };

  const addDate = (day = newDate) => {
    if (!day) return;
    if (day < today()) return toast.error("Pick today or a later date");
    if (dates.includes(day)) return toast.error(`${formatDay(day)} is already added`);
    setShownProblem(null);
    setDates((prev) => [...prev, day].sort());
    // A new date is for every product; untick it on the products that are not needed that day
    setLines((prev) =>
      prev.map((l) => (l.productId ? { ...l, days: [...l.days, { key: uid(), weekday: 1, date: day, quantity: "" }].sort((a, b) => a.date.localeCompare(b.date)) } : l))
    );
    setNewDate("");
  };

  const removeDate = (day: string) => {
    setDates((prev) => prev.filter((d) => d !== day));
    setLines((prev) => prev.map((l) => ({ ...l, days: l.days.filter((d) => d.date !== day) })));
  };

  const clearDates = () => {
    setDates([]);
    setLines((prev) => prev.map((l) => ({ ...l, days: [] })));
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  /** How many deliveries one day of a product stands for */
  const timesOf = (day: Day) => (schedule === "WEEKLY" ? countWeekday(day.weekday, startDate, endDate) : 1);
  const dayQuantity = (line: Line, day: Day) => Number(day.quantity || line.quantity) || 0;

  const lineTotals = (line: Line) => {
    if (schedule === "ONCE") {
      const quantity = Number(line.quantity) || 0;
      return { deliveries: 1, quantity, value: quantity * (Number(line.price) || 0) };
    }
    const deliveries = line.days.reduce((sum, d) => sum + timesOf(d), 0);
    const quantity = line.days.reduce((sum, d) => sum + dayQuantity(line, d) * timesOf(d), 0);
    return { deliveries, quantity, value: quantity * (Number(line.price) || 0) };
  };

  const deliveryDays =
    schedule === "ONCE"
      ? onceDate
        ? 1
        : 0
      : schedule === "DATES"
        ? new Set(filled.flatMap((l) => l.days.map((d) => d.date))).size
        : [...new Set(filled.flatMap((l) => l.days.map((d) => d.weekday)))].reduce(
            (sum, wd) => sum + countWeekday(wd, startDate, endDate),
            0
          );

  const grandTotal = filled.reduce((sum, l) => sum + lineTotals(l).value, 0);
  /** Weeks the request runs: how many times its first weekday comes round */
  const weeks = schedule === "WEEKLY" && startDate ? countWeekday(weekdayOf(startDate), startDate, endDate) : 0;

  // ── Checks ────────────────────────────────────────────────────────────────
  /** The problem with a step, or null when it is complete */
  const problem = (name: StepName): string | null => {
    if (name === "What") {
      if (!restaurantId) return "Choose the customer this request is for";
      if (filled.length === 0) return "Add at least one product";
      const noQty = filled.find((l) => !(Number(l.quantity) > 0));
      if (noQty) return `Give a quantity for ${productOf(noQty.productId)?.productName ?? "every product"}`;
      const noPrice = filled.find((l) => !(Number(l.price) > 0));
      if (noPrice) return `Give a price for ${productOf(noPrice.productId)?.productName ?? "every product"}`;
    }
    if (name === "When") {
      if (schedule === "ONCE") {
        if (!onceDate) return "Choose the delivery day";
        if (!editing && onceDate < today()) return "Pick today or a later date";
      }
      if (schedule === "WEEKLY") {
        if (!startDate || !endDate) return "Choose from when until when";
        if (endDate < startDate) return "The end date must be after the start date";
      }
      if (schedule === "DATES" && dates.length === 0) return "Add at least one delivery date";
      if (schedule !== "ONCE") {
        for (const line of filled) {
          const name = productOf(line.productId)?.productName ?? "a product";
          if (line.days.length === 0) return `Choose at least one day for ${name}`;
          if (line.days.some((d) => d.quantity !== "" && !(Number(d.quantity) > 0))) return `Fix the quantity of ${name}`;
          const never = schedule === "WEEKLY" && line.days.find((d) => timesOf(d) === 0);
          if (never) return `No ${WEEKDAYS[never.weekday]} falls between the dates (${name})`;
        }
      }
    }
    if (name === "Who" && audience === "SELECTED" && chosen.size === 0) return "Choose at least one farmer";
    return null;
  };

  const goTo = (target: number) => {
    // Going back is always allowed; going forward needs the steps before to be complete
    for (let i = step; i < target; i++) {
      const issue = problem(steps[i]);
      if (issue) {
        setStep(i);
        setShownProblem(issue);
        return;
      }
    }
    setShownProblem(null);
    setStep(target);
  };

  const save = async () => {
    const index = steps.findIndex((s) => problem(s));
    if (index >= 0) {
      setStep(index);
      setShownProblem(problem(steps[index]));
      return;
    }
    const items: SupplyRequestItemInput[] =
      schedule === "ONCE"
        ? filled.map((line) => ({
            id: line.days[0]?.id,
            productId: line.productId,
            weekday: null,
            date: onceDate,
            quantity: Number(line.quantity),
            price: Number(line.price),
          }))
        : filled.flatMap((line) =>
            line.days.map((day) => ({
              id: day.id,
              productId: line.productId,
              weekday: schedule === "WEEKLY" ? day.weekday : null,
              date: schedule === "DATES" ? day.date : null,
              quantity: dayQuantity(line, day),
              price: Number(line.price),
            }))
          );

    setSaving(true);
    try {
      const saved = editing
        ? await supplyRequestService.update(request!.id, {
            title,
            notes,
            neededTime: neededTime || null,
            ...(schedule === "WEEKLY" ? { endDate } : {}),
            items,
          })
        : await supplyRequestService.create({
            restaurantId,
            title,
            notes,
            scheduleType: schedule,
            ...(schedule === "WEEKLY" ? { startDate, endDate } : {}),
            neededTime: neededTime || null,
            audience,
            ...(audience === "SELECTED" ? { farmerIds: [...chosen] } : {}),
            items,
          });
      toast.success(
        editing
          ? "Request updated"
          : audience === "SELECTED"
            ? `Request sent to ${chosen.size} chosen farmer${chosen.size === 1 ? "" : "s"}.`
            : "Request created. Farmers near it can now submit."
      );
      onSaved(saved);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save the request"));
    } finally {
      setSaving(false);
    }
  };

  const customer = customers.find((c) => c.id === restaurantId);
  const whenText =
    schedule === "ONCE"
      ? onceDate && formatDay(onceDate, true)
      : schedule === "WEEKLY"
        ? startDate && endDate && `Every week, ${formatDay(startDate)} – ${formatDay(endDate)}`
        : `${dates.length} date${dates.length === 1 ? "" : "s"}: ${dates.map((d) => formatDay(d)).join(", ")}`;
  const dayLabel = (day: Day) => (schedule === "WEEKLY" ? WEEKDAYS[day.weekday] : formatDay(day.date));

  return (
    <Dialog open={open} onOpenChange={(value) => !value && !saving && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="space-y-4 border-b px-6 pb-4 pt-6">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit supply request" : "New supply request"}</DialogTitle>
            <DialogDescription>{STEP_HINT[current]}</DialogDescription>
          </DialogHeader>

          {/* Steps */}
          <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Steps">
            {steps.map((name, i) => {
              const done = i < step;
              return (
                <li key={name} className="flex flex-1 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    disabled={saving || i === step}
                    className={cn(
                      "flex items-center gap-2 rounded-full text-sm font-medium",
                      i === step ? "text-green-700" : done ? "text-gray-700 hover:text-green-700" : "text-gray-400 hover:text-gray-600"
                    )}
                    aria-current={i === step ? "step" : undefined}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        i === step ? "bg-green-600 text-white ring-4 ring-green-100" : done ? "bg-green-100 text-green-700" : "bg-gray-100"
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{name}</span>
                  </button>
                  {i < steps.length - 1 && <span className={cn("h-0.5 flex-1 rounded", done ? "bg-green-300" : "bg-gray-200")} />}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* ── 1. What ─────────────────────────────────────────────── */}
          {current === "What" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sr-customer">Customer</Label>
                  <select
                    id="sr-customer"
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm disabled:bg-gray-100"
                    value={restaurantId}
                    onChange={(e) => {
                      setRestaurantId(e.target.value);
                      setShownProblem(null);
                    }}
                    disabled={editing || saving}
                  >
                    <option value="">Choose a customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.customerType?.name ? ` (${c.customerType.name.toLowerCase()})` : ""}
                      </option>
                    ))}
                  </select>
                  {!editing && customers.length === 0 && (
                    <p className="text-xs text-amber-700">No customers are assigned to you yet. Ask an admin to assign schools.</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sr-title">
                    Title <span className="font-normal text-gray-400">(optional)</span>
                  </Label>
                  <Input id="sr-title" className="h-10" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Term 1 menu" disabled={saving} />
                </div>
              </div>

              <Section
                title="Products"
                hint={schedule === "ONCE" ? "Quantity and price for the delivery" : "Usual quantity per delivery day; you can change it per day in the next step"}
              >
                <div className="space-y-2">
                  {lines.map((line, index) => {
                    const product = productOf(line.productId);
                    const taken = new Set(lines.filter((l) => l.key !== line.key).map((l) => l.productId));
                    const value = (Number(line.quantity) || 0) * (Number(line.price) || 0);
                    return (
                      <div key={line.key} className="rounded-xl border bg-white p-3">
                        <div className="grid gap-2 sm:grid-cols-[1fr_130px_150px_36px] sm:items-start">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500 sm:sr-only">Product {index + 1}</Label>
                            <select
                              className="h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm"
                              value={line.productId}
                              onChange={(e) => pickProduct(line.key, e.target.value)}
                              disabled={saving || loadingProducts}
                              aria-label={`Product ${index + 1}`}
                            >
                              <option value="">{loadingProducts ? "Loading products…" : "Choose a product"}</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id} disabled={taken.has(p.id)}>
                                  {p.productName}
                                  {taken.has(p.id) ? " (already added)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500 sm:sr-only">Quantity</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                inputMode="decimal"
                                className="h-10 pr-10"
                                placeholder="Qty"
                                value={line.quantity}
                                onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                                disabled={saving}
                                aria-label="Quantity"
                              />
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                {product?.unit || "unit"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500 sm:sr-only">Price per unit</Label>
                            <div className="relative">
                              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">RWF</span>
                              <Input
                                type="number"
                                min={0}
                                inputMode="decimal"
                                className="h-10 pl-11"
                                placeholder="Price"
                                value={line.price}
                                onChange={(e) => updateLine(line.key, { price: e.target.value })}
                                disabled={saving}
                                aria-label="Price per unit"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.key)}
                            className="hidden h-10 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 sm:flex"
                            aria-label="Remove product"
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {product && (
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                            <span>
                              FB price {rwf(product.purchasePrice)}/{product.unit}
                              {Number(line.price) !== product.purchasePrice && (
                                <button
                                  type="button"
                                  className="ml-2 font-medium text-green-700 hover:underline"
                                  onClick={() => updateLine(line.key, { price: String(product.purchasePrice) })}
                                >
                                  Use it
                                </button>
                              )}
                            </span>
                            <span className="flex items-center gap-3">
                              {value > 0 && <span className="font-medium text-gray-700">{rwf(value)} per delivery</span>}
                              <button
                                type="button"
                                onClick={() => removeLine(line.key)}
                                className="text-red-600 hover:underline sm:hidden"
                                disabled={saving}
                              >
                                Remove
                              </button>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => setLines((prev) => [...prev, newLine()])}
                  disabled={saving}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add another product
                </Button>
              </Section>
            </>
          )}

          {/* ── 2. When ─────────────────────────────────────────────── */}
          {current === "When" && (
            <>
              <Section title="How often?" hint={editing ? "The schedule type can't change once a request exists." : undefined}>
                <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="How often">
                  {SCHEDULES.map(({ key, label, hint, icon }) => (
                    <ChoiceCard
                      key={key}
                      on={schedule === key}
                      label={label}
                      hint={hint}
                      icon={icon}
                      disabled={editing || saving}
                      onClick={() => changeSchedule(key)}
                    />
                  ))}
                </div>
              </Section>

              {schedule === "ONCE" && (
                <Section title="Delivery day">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="date"
                      min={today()}
                      className="h-10 w-auto"
                      value={onceDate}
                      onChange={(e) => {
                        setOnceDate(e.target.value);
                        setShownProblem(null);
                      }}
                      disabled={saving}
                    />
                    <Chip on={onceDate === dayFromToday(1)} onClick={() => setOnceDate(dayFromToday(1))} disabled={saving}>
                      Tomorrow
                    </Chip>
                    <Chip on={onceDate === dayFromToday(2)} onClick={() => setOnceDate(dayFromToday(2))} disabled={saving}>
                      In 2 days
                    </Chip>
                    <Chip on={onceDate === nextWeekday(1)} onClick={() => setOnceDate(nextWeekday(1))} disabled={saving}>
                      Next Monday
                    </Chip>
                  </div>
                  {onceDate && <p className="text-sm text-gray-600">All products are needed on {formatDay(onceDate, true)}.</p>}
                </Section>
              )}

              {schedule === "WEEKLY" && (
                <Section title="From when until when?">
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">From</Label>
                      <Input
                        type="date"
                        className="h-10 w-auto"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={editing || saving}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Until</Label>
                      <Input
                        type="date"
                        className="h-10 w-auto"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setShownProblem(null);
                        }}
                        disabled={saving}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pb-1.5">
                      {WEEK_PRESETS.map((p) => {
                        const end = startDate ? addDays(startDate, p.days) : "";
                        return (
                          <Chip key={p.label} on={!!end && endDate === end} onClick={() => setEndDate(end)} disabled={saving || !startDate}>
                            {p.label}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                  {weeks > 0 && (
                    <p className="text-sm text-gray-600">
                      About {weeks} week{weeks === 1 ? "" : "s"}, {formatDay(startDate)} – {formatDay(endDate)}.
                    </p>
                  )}
                </Section>
              )}

              {schedule === "DATES" && (
                <Section
                  title="Delivery dates"
                  hint="A new date is added for every product. Untick it below on the products not needed that day."
                  action={
                    dates.length > 1 && (
                      <button type="button" onClick={clearDates} className="text-xs font-medium text-red-600 hover:underline" disabled={saving}>
                        Remove all
                      </button>
                    )
                  }
                >
                  <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addDate();
                    }}
                  >
                    <Input
                      type="date"
                      min={today()}
                      className="h-10 w-auto"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      disabled={saving}
                    />
                    <Button type="submit" variant="outline" className="h-10" disabled={!newDate || saving}>
                      <Plus className="mr-1 h-4 w-4" /> Add date
                    </Button>
                  </form>
                  {dates.length === 0 ? (
                    <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-gray-500">No date yet. Add the first delivery date above.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {dates.map((d) => (
                        <span
                          key={d}
                          className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 py-1 pl-3 pr-1 text-sm font-medium text-green-800"
                        >
                          {formatDay(d)}
                          <button
                            type="button"
                            onClick={() => removeDate(d)}
                            aria-label={`Remove ${formatDay(d)}`}
                            title="Remove this date"
                            disabled={saving}
                            className="rounded-full p-1 text-green-700 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              <Section title="Needed by" hint="The time products must reach the site on each delivery day">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input type="time" className="h-10 w-auto pl-9" value={neededTime} onChange={(e) => setNeededTime(e.target.value)} disabled={saving} />
                  </div>
                  {TIME_PRESETS.map((t) => (
                    <Chip key={t} on={neededTime === t} onClick={() => setNeededTime(t)} disabled={saving}>
                      {t}
                    </Chip>
                  ))}
                  {neededTime && (
                    <button type="button" className="text-xs text-gray-500 hover:underline" onClick={() => setNeededTime("")} disabled={saving}>
                      Any time
                    </button>
                  )}
                </div>
              </Section>

              {/* The days of each product: tick to add, untick or ✕ to remove, own quantity per day */}
              {schedule !== "ONCE" && (
                <Section
                  title="Days for each product"
                  hint={
                    schedule === "WEEKLY"
                      ? "Tick the weekdays each product is needed. Remove a day with ✕, or give it its own quantity."
                      : "Tick the dates each product is needed. Remove a day with ✕, or give it its own quantity."
                  }
                >
                  {schedule === "DATES" && dates.length === 0 ? (
                    <p className="text-sm text-gray-500">Add delivery dates first.</p>
                  ) : (
                    <div className="space-y-3">
                      {filled.map((line) => {
                        const product = productOf(line.productId);
                        const totals = lineTotals(line);
                        const options: (number | string)[] = schedule === "WEEKLY" ? [1, 2, 3, 4, 5, 6, 7] : dates;
                        return (
                          <div key={line.key} className={cn("rounded-xl border p-3", line.days.length === 0 && "border-amber-300 bg-amber-50/40")}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                <Package className="h-4 w-4 text-green-600" />
                                {product?.productName}
                                <span className="font-normal text-gray-500">
                                  · usually {line.quantity} {product?.unit}
                                </span>
                              </p>
                              {filled.length > 1 && line.days.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => copyDaysToAll(line)}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                                  disabled={saving}
                                >
                                  <CopyCheck className="h-3.5 w-3.5" /> Same days for all products
                                </button>
                              )}
                            </div>

                            <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label={`Days for ${product?.productName}`}>
                              {options.map((value) => (
                                <Chip key={value} on={hasDay(line, value)} onClick={() => toggleDay(line.key, value)} disabled={saving}>
                                  {schedule === "WEEKLY" ? WEEKDAYS[value as number].slice(0, 3) : formatDay(value as string)}
                                </Chip>
                              ))}
                            </div>

                            {line.days.length === 0 ? (
                              <p className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-700">
                                <AlertCircle className="h-3.5 w-3.5" /> No day chosen for this product yet
                              </p>
                            ) : (
                              <ul className="mt-3 divide-y rounded-lg border bg-white">
                                {line.days.map((day) => {
                                  const times = timesOf(day);
                                  return (
                                    <li key={day.key} className="flex items-center gap-2 px-3 py-2">
                                      <span className="min-w-0 flex-1 text-sm">
                                        <span className="font-medium text-gray-800">{dayLabel(day)}</span>
                                        {schedule === "WEEKLY" && (
                                          <span className={cn("ml-1.5 text-xs", times ? "text-gray-500" : "text-red-600")}>
                                            {times ? `× ${times} week${times === 1 ? "" : "s"}` : "not in the dates"}
                                          </span>
                                        )}
                                      </span>
                                      <div className="relative w-32">
                                        <Input
                                          type="number"
                                          min={0}
                                          inputMode="decimal"
                                          className="h-8 pr-10 text-sm"
                                          placeholder={line.quantity}
                                          value={day.quantity}
                                          onChange={(e) => setDayQuantity(line.key, day.key, e.target.value)}
                                          disabled={saving}
                                          aria-label={`Quantity on ${dayLabel(day)}`}
                                        />
                                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">
                                          {product?.unit}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeDay(line.key, day.key)}
                                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        aria-label={`Remove ${dayLabel(day)} for ${product?.productName}`}
                                        title="Remove this day"
                                        disabled={saving}
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                            {totals.deliveries > 0 && (
                              <p className="mt-2 text-right text-xs text-gray-500">
                                {totals.deliveries} deliver{totals.deliveries === 1 ? "y" : "ies"} · {totals.quantity.toLocaleString()} {product?.unit} in total
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Section>
              )}
            </>
          )}

          {/* ── 3. Who ──────────────────────────────────────────────── */}
          {current === "Who" && (
            <>
              <Section title="Who may supply it?">
                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Who may supply it">
                  <ChoiceCard
                    on={audience === "NEARBY"}
                    label="Nearby farmers"
                    hint="Farmers near the site who grow these crops are told automatically"
                    icon={MapPinned}
                    disabled={saving}
                    onClick={() => {
                      setAudience("NEARBY");
                      setShownProblem(null);
                    }}
                  />
                  <ChoiceCard
                    on={audience === "SELECTED"}
                    label="Chosen farmers"
                    hint="Only the farmers you pick see the request"
                    icon={Users}
                    disabled={saving}
                    onClick={() => {
                      setAudience("SELECTED");
                      setShownProblem(null);
                    }}
                  />
                </div>
              </Section>
              {audience === "SELECTED" ? (
                <ChooseFarmers
                  productIds={productIds}
                  selected={chosen}
                  onChange={(next) => {
                    setChosen(next);
                    setShownProblem(null);
                  }}
                  disabled={saving}
                />
              ) : (
                <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
                  Farmers who grow {filled.map((l) => productOf(l.productId)?.productName).filter(Boolean).join(", ") || "these crops"} near the
                  customer&apos;s aggregation site get a message and can submit.
                </p>
              )}
            </>
          )}

          {/* ── 4. Review ───────────────────────────────────────────── */}
          {current === "Review" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-green-50 p-3">
                  <p className="text-xs text-green-800">Estimated value</p>
                  <p className="text-xl font-bold text-green-900">{rwf(grandTotal)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Delivery days</p>
                  <p className="text-xl font-bold text-gray-900">{deliveryDays}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="text-xl font-bold text-gray-900">{filled.length}</p>
                </div>
              </div>

              <dl className="divide-y rounded-xl border text-sm">
                {(
                  [
                    { label: "Customer", value: customer?.name ?? request?.restaurant.name, step: "What" },
                    { label: "Title", value: title || "—", step: "What" },
                    { label: "When", value: `${whenText}${neededTime ? `, needed by ${neededTime}` : ""}`, step: "When" },
                    {
                      label: "Who can supply it",
                      value: editing
                        ? request?.audience === "SELECTED"
                          ? `${request.chosenFarmers?.length ?? 0} chosen farmers (manage them on the request page)`
                          : "Nearby farmers"
                        : audience === "SELECTED"
                          ? `Only ${chosen.size} chosen farmer${chosen.size === 1 ? "" : "s"}`
                          : "Nearby farmers, automatically",
                      step: "Who",
                    },
                  ] as { label: string; value: string | undefined; step: StepName }[]
                ).map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <dt className="text-xs text-gray-500">{row.label}</dt>
                      <dd className="font-medium text-gray-900">{row.value}</dd>
                    </div>
                    {steps.includes(row.step) && (
                      <button
                        type="button"
                        onClick={() => goTo(steps.indexOf(row.step))}
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                        disabled={saving}
                      >
                        <Pencil className="h-3 w-3" /> Change
                      </button>
                    )}
                  </div>
                ))}
              </dl>

              <ul className="divide-y rounded-xl border text-sm">
                {filled.map((line) => {
                  const product = productOf(line.productId);
                  const totals = lineTotals(line);
                  return (
                    <li key={line.key} className="space-y-1.5 px-4 py-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-gray-900">{product?.productName}</span>
                        <span className="text-gray-700">
                          {totals.quantity.toLocaleString()} {product?.unit} × RWF {Number(line.price).toLocaleString()} ={" "}
                          <span className="font-semibold text-gray-900">{rwf(totals.value)}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {schedule === "ONCE" ? (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                            {formatDay(onceDate)} · {line.quantity} {product?.unit}
                          </span>
                        ) : (
                          line.days.map((day) => (
                            <span key={day.key} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                              {schedule === "WEEKLY" ? `${WEEKDAYS[day.weekday]}s` : formatDay(day.date)} · {dayQuantity(line, day)} {product?.unit}
                            </span>
                          ))
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-1.5">
                <Label htmlFor="sr-notes">
                  Notes for the team <span className="font-normal text-gray-400">(optional)</span>
                </Label>
                <Textarea id="sr-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} disabled={saving} />
              </div>
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50/80 px-6 py-3">
          {shownProblem && (
            <p role="alert" className="mb-2 flex items-center gap-1.5 text-sm font-medium text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" /> {shownProblem}
            </p>
          )}
          <DialogFooter className="flex-row items-center gap-2 sm:justify-between">
            <Button variant="outline" onClick={step === 0 ? onClose : () => goTo(step - 1)} disabled={saving}>
              {step === 0 ? (
                "Cancel"
              ) : (
                <>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </>
              )}
            </Button>
            <span className="hidden text-xs text-gray-500 sm:block">
              Step {step + 1} of {steps.length}
            </span>
            {current === "Review" ? (
              <Button onClick={save} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Save changes" : audience === "SELECTED" ? `Send to ${chosen.size} farmer${chosen.size === 1 ? "" : "s"}` : "Create request"}
              </Button>
            ) : (
              <Button onClick={() => goTo(step + 1)} className="bg-green-600 hover:bg-green-700" disabled={saving}>
                Next: {steps[step + 1]} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
