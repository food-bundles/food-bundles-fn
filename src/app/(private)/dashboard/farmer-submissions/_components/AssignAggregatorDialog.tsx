"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Search, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FarmerSubmission, farmerDisplayName } from "@/app/contexts/submission-context";
import { AssignableAggregator, submissionService } from "@/app/services/submissionServices";

// The automatic rule: the aggregator at the farmer's site, else the nearest one
const NEAREST = "__nearest__";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);

interface AssignAggregatorDialogProps {
  /** One submission (from its row) or many (the selected rows); null when closed */
  submissions: FarmerSubmission[] | null;
  onClose: () => void;
  /** Runs after a successful assignment so the list reloads */
  onDone: () => void;
}

/** Chooses the aggregator who handles one farmer's submission, or many farmers' submissions at once. */
export function AssignAggregatorDialog({ submissions, onClose, onDone }: AssignAggregatorDialogProps) {
  const open = !!submissions && submissions.length > 0;
  const [aggregators, setAggregators] = useState<AssignableAggregator[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [choice, setChoice] = useState<string>(NEAREST);
  const [saving, setSaving] = useState(false);

  const single = submissions?.length === 1 ? submissions[0] : null;

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setChoice(single?.assignedAggregatorId ?? NEAREST);
    setLoading(true);
    submissionService
      .listAggregators(single?.id)
      .then(setAggregators)
      .catch((error) => toast.error(errorMessage(error, "Failed to load the aggregators")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return aggregators;
    return aggregators.filter((a) =>
      [a.username, a.phone, a.aggregationSite?.name, a.aggregationSite?.district].some((v) => v?.toLowerCase().includes(needle))
    );
  }, [aggregators, search]);

  const farmerCount = new Set((submissions ?? []).map((s) => s.farmerId)).size;
  // Who the automatic rule picks for this farmer (one submission only), so it can be kept or changed
  const nearest = aggregators.find((a) => a.automatic);

  const save = async () => {
    if (!submissions) return;
    const aggregatorId = choice === NEAREST ? null : choice;
    setSaving(true);
    try {
      const result =
        submissions.length === 1
          ? await submissionService.assignAggregator(submissions[0].id, aggregatorId)
          : await submissionService.assignAggregatorBulk(
              submissions.map((s) => s.id),
              aggregatorId
            );
      const parts: string[] = [];
      if (result.assigned) parts.push(`${plural(result.assigned, "submission")} assigned`);
      if (result.unchanged) parts.push(`${result.unchanged} already with this aggregator`);
      if (result.skipped) parts.push(`${result.skipped} paid or rejected, left as they were`);
      if (result.unassigned) parts.push(`${result.unassigned} without a nearby aggregator, flagged for review`);
      toast.success(parts.join(". ") || "Nothing to change");
      onDone();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to assign the aggregator"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <DialogContent className="max-w-lg gap-4">
        <DialogHeader>
          <DialogTitle>Assign aggregator</DialogTitle>
          <DialogDescription>
            {single ? (
              <>
                {farmerDisplayName(single.farmer)} · {single.productName}
                {single.submittedQty ? ` · ${single.submittedQty.toLocaleString()} kg` : ""}
                <span className="mt-1 block">
                  Now: {single.assignedAggregator ? single.assignedAggregator.username : "no aggregator yet"}
                </span>
              </>
            ) : (
              `${plural(submissions?.length ?? 0, "submission")} from ${plural(farmerCount, "farmer")} will go to the aggregator you choose.`
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search aggregators by name, phone or site"
            className="h-10 pl-9 text-sm"
          />
        </div>

        <div className="max-h-80 overflow-y-auto rounded-lg border" role="radiogroup">
          {/* Back to the automatic choice */}
          <button
            type="button"
            role="radio"
            aria-checked={choice === NEAREST}
            onClick={() => setChoice(NEAREST)}
            className={cn(
              "flex w-full items-center gap-3 border-b px-3 py-2.5 text-left transition-colors hover:bg-gray-50",
              choice === NEAREST && "bg-green-50 hover:bg-green-50"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800">
              <Wand2 className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-900">
                {nearest ? `Nearest: ${nearest.username}` : "Nearest aggregator (automatic)"}
              </span>
              <span className="block text-xs text-gray-500">
                {nearest
                  ? [nearest.aggregationSite?.name, nearest.distanceKm != null ? formatKm(nearest.distanceKm) : null, "picked automatically"]
                      .filter(Boolean)
                      .join(" · ")
                  : "Someone at the farmer's site, else the nearest one"}
              </span>
            </span>
          </button>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : visible.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-500">No aggregator found.</p>
          ) : (
            visible.map((a) => {
              const selected = choice === a.id;
              const siteOff = a.aggregationSite && !a.aggregationSite.isActive;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChoice(a.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-gray-50",
                    selected && "bg-green-50 hover:bg-green-50"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-700">
                    {a.username.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 truncate text-sm font-medium text-gray-900">
                      {a.username}
                      {a.automatic && (
                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800">
                          Nearest
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 truncate text-xs text-gray-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {a.aggregationSite ? a.aggregationSite.name : "No site"}
                      {siteOff ? " (switched off)" : ""}
                      {a.phone ? ` · ${a.phone}` : ""}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    {a.distanceKm != null && <span className="text-xs font-medium text-gray-900">{formatKm(a.distanceKm)}</span>}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      {a.openSubmissions} open
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="green" onClick={save} disabled={saving || loading}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {choice === NEAREST ? "Use the nearest" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
