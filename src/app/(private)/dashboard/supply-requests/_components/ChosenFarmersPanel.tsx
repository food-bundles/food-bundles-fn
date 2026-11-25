"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorMessage, SupplyRequest, supplyRequestService } from "@/app/services/supplyRequestService";
import { ChooseFarmers } from "./ChooseFarmers";

interface ChosenFarmersPanelProps {
  request: SupplyRequest;
  canEdit: boolean;
  onChanged: (request: SupplyRequest) => void;
}

/** The farmers a "chosen farmers" request was sent to: who submitted, and adding or removing farmers */
export function ChosenFarmersPanel({ request, canEdit, onChanged }: ChosenFarmersPanelProps) {
  const [adding, setAdding] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const farmers = request.chosenFarmers ?? [];
  const open = request.status === "OPEN";
  const productIds = [...new Set((request.items ?? []).map((i) => i.productId))];
  const submitted = farmers.filter((f) => f.submitted).length;

  const add = async () => {
    const ids = [...picked].filter((id) => !farmers.some((f) => f.id === id));
    if (ids.length === 0) return toast.error("Choose farmers who are not on the request yet");
    setBusy("add");
    try {
      onChanged(await supplyRequestService.addFarmers(request.id, ids));
      toast.success(`${ids.length} farmer${ids.length === 1 ? "" : "s"} added and told about the request`);
      setAdding(false);
      setPicked(new Set());
    } catch (error) {
      toast.error(errorMessage(error, "Failed to add farmers"));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (farmerId: string) => {
    setBusy(farmerId);
    try {
      onChanged(await supplyRequestService.removeFarmer(request.id, farmerId));
      toast.success("Farmer removed from the request");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to remove the farmer"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Users className="h-4 w-4 text-green-600" /> Chosen farmers
          </p>
          <p className="text-xs text-gray-500">
            Only these {farmers.length} farmer{farmers.length === 1 ? "" : "s"} see this request · {submitted} submitted
          </p>
        </div>
        {open && canEdit && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <UserPlus className="mr-1 h-4 w-4" /> Add farmers
          </Button>
        )}
      </div>
      {farmers.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-gray-500">No farmer is on this request.</p>
      ) : (
        <ul className="max-h-72 divide-y overflow-y-auto">
          {farmers.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="font-medium text-gray-900">{f.name || "Unnamed farmer"}</span>
                <span className="block text-xs text-gray-500">{[f.phone, f.place].filter(Boolean).join(" · ")}</span>
              </span>
              {f.submitted ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                </span>
              ) : (
                open &&
                canEdit && (
                  <button
                    type="button"
                    onClick={() => remove(f.id)}
                    disabled={busy !== null}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${f.name || "farmer"}`}
                  >
                    {busy === f.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={adding} onOpenChange={(v) => !v && busy === null && setAdding(false)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add farmers</DialogTitle>
            <DialogDescription>New farmers are told about the request. Farmers already on it are not told again.</DialogDescription>
          </DialogHeader>
          <ChooseFarmers
            productIds={productIds}
            customerId={request.restaurant.id}
            selected={picked}
            onChange={setPicked}
            disabled={busy !== null}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(false)} disabled={busy !== null}>
              Cancel
            </Button>
            <Button onClick={add} disabled={busy !== null || picked.size === 0} className="bg-green-600 hover:bg-green-700">
              {busy === "add" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {picked.size || ""} farmer{picked.size === 1 ? "" : "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
