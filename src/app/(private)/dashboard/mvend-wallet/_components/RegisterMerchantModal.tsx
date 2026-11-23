"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mvendMerchantService } from "@/app/services/mvendService";

type Level = "provinces" | "districts" | "sectors" | "cells" | "villages";
const LEVELS: { key: Level; label: string }[] = [
  { key: "provinces", label: "Province" },
  { key: "districts", label: "District" },
  { key: "sectors", label: "Sector" },
  { key: "cells", label: "Cell" },
  { key: "villages", label: "Village" },
];
type Option = { id: string; name: string };

/** MVend location rows look like { province_id, province_name }: read whichever *_id / *_name pair it has */
const toOption = (row: Record<string, unknown>): Option => {
  const idKey = Object.keys(row).find((k) => k.endsWith("_id")) ?? "id";
  const nameKey = Object.keys(row).find((k) => k.endsWith("_name")) ?? "name";
  return { id: String(row[idKey] ?? ""), name: String(row[nameKey] ?? row[idKey] ?? "") };
};

const FILES = [
  { key: "business_doc_file", label: "RDB certificate (PDF, JPG or PNG)", accept: "application/pdf,image/jpeg,image/png" },
  { key: "nid_front_image", label: "Representative's ID: front (photo)", accept: "image/jpeg,image/png" },
  { key: "nid_back_image", label: "Representative's ID: back (photo)", accept: "image/jpeg,image/png" },
  { key: "selfie_image", label: "Representative's selfie (photo)", accept: "image/jpeg,image/png" },
] as const;

const apiMessage = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;

const inputCls = "h-10";

/**
 * Register Food Bundles as an MVend merchant: the business and the person who
 * represents it. MVend creates the wallet afterwards and notifies us.
 */
export default function RegisterMerchantModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState<Record<string, string>>({
    business_name: "Food Bundles Ltd",
    tin_number: "",
    business_doc_type: "rdb_certificate",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    national_id_number: "",
    linked_msisdn: "",
    email_address: "",
    language: "en",
  });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [options, setOptions] = useState<Record<Level, Option[]>>({ provinces: [], districts: [], sectors: [], cells: [], villages: [] });
  const [place, setPlace] = useState<Record<Level, string>>({ provinces: "", districts: "", sectors: "", cells: "", villages: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((v) => ({ ...v, [k]: e.target.value }));

  // Provinces first; each pick loads the next level
  useEffect(() => {
    if (!open) return;
    mvendMerchantService
      .locations("provinces")
      .then((rows) => setOptions((o) => ({ ...o, provinces: rows.map(toOption) })))
      .catch((e) => toast.error(apiMessage(e, "Couldn't load MVend's locations")));
  }, [open]);

  const choose = async (level: Level, id: string) => {
    const i = LEVELS.findIndex((l) => l.key === level);
    const below = LEVELS.slice(i + 1).map((l) => l.key);
    setPlace((p) => ({ ...p, [level]: id, ...Object.fromEntries(below.map((k) => [k, ""])) }));
    setOptions((o) => ({ ...o, ...Object.fromEntries(below.map((k) => [k, []])) }));
    const next = LEVELS[i + 1]?.key;
    if (!id || !next) return;
    try {
      const rows = await mvendMerchantService.locations(next, id);
      setOptions((o) => ({ ...o, [next]: rows.map(toOption) }));
    } catch (e) {
      toast.error(apiMessage(e, "Couldn't load MVend's locations"));
    }
  };

  const submit = async () => {
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    form.append("village_id", place.villages);
    Object.entries(files).forEach(([k, file]) => file && form.append(k, file));
    setSaving(true);
    try {
      const res = await mvendMerchantService.register(form);
      toast.success(res.message);
      onDone();
      onClose();
    } catch (e) {
      toast.error(apiMessage(e, "Registration failed"));
    } finally {
      setSaving(false);
    }
  };

  const ready =
    !!f.business_name && !!f.tin_number && !!f.first_name && !!f.last_name && !!f.date_of_birth && !!f.gender &&
    !!f.national_id_number && !!f.linked_msisdn && !!f.email_address && !!place.villages && FILES.every((x) => files[x.key]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Register the MVend merchant wallet</DialogTitle>
          <DialogDescription>
            Food Bundles&apos; business details and the person who represents it. MVend checks them and creates the wallet. The ID photos
            and selfie are sent to MVend only; Food Bundles doesn&apos;t keep them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <section className="space-y-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-500">Business</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">Business name</span>
                <Input className={inputCls} value={f.business_name} onChange={set("business_name")} />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">TIN</span>
                <Input className={inputCls} inputMode="numeric" value={f.tin_number} onChange={set("tin_number")} placeholder="9 digits" />
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-500">Representative</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">First name</span>
                <Input className={inputCls} value={f.first_name} onChange={set("first_name")} />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">Last name</span>
                <Input className={inputCls} value={f.last_name} onChange={set("last_name")} />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">Date of birth</span>
                <Input className={inputCls} type="date" value={f.date_of_birth} onChange={set("date_of_birth")} />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">Gender</span>
                <select className="h-10 w-full rounded-md border border-gray-300 bg-white px-3" value={f.gender} onChange={set("gender")}>
                  <option value="">Choose…</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">National ID</span>
                <Input className={inputCls} inputMode="numeric" value={f.national_id_number} onChange={set("national_id_number")} placeholder="16 digits" />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">Phone (the wallet&apos;s number)</span>
                <Input className={inputCls} inputMode="tel" value={f.linked_msisdn} onChange={set("linked_msisdn")} placeholder="078XXXXXXX" />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">Email</span>
                <Input className={inputCls} type="email" value={f.email_address} onChange={set("email_address")} />
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block font-medium">Language</span>
                <select className="h-10 w-full rounded-md border border-gray-300 bg-white px-3" value={f.language} onChange={set("language")}>
                  <option value="en">English</option>
                  <option value="kin">Kinyarwanda</option>
                  <option value="fr">French</option>
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-500">Business location</p>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
              {LEVELS.map((l, i) => (
                <label key={l.key} className="block min-w-0">
                  <span className="mb-1 block font-medium">{l.label}</span>
                  <select
                    className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 disabled:bg-gray-50"
                    value={place[l.key]}
                    disabled={i > 0 && !place[LEVELS[i - 1].key]}
                    onChange={(e) => choose(l.key, e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {options[l.key].map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-500">Documents</p>
            {FILES.map((x) => (
              <label key={x.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 p-3 hover:border-green-400">
                {files[x.key] ? <Check className="h-4 w-4 shrink-0 text-green-700" /> : <Upload className="h-4 w-4 shrink-0 text-green-700" />}
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{x.label}</span>
                  {files[x.key] && <span className="block break-all text-xs text-gray-500">{files[x.key]!.name}</span>}
                </span>
                <input type="file" accept={x.accept} className="sr-only" onChange={(e) => setFiles((v) => ({ ...v, [x.key]: e.target.files?.[0] ?? null }))} />
              </label>
            ))}
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving || !ready} className="bg-[#007A35] hover:bg-[#0F5C36]">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register at MVend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
