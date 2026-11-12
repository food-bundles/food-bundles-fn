"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AggregationSite, SiteAssignment, aggregationSiteService } from "@/app/services/aggregationSiteService";

// Select items cannot have an empty value, so the automatic choice gets its own
const AUTOMATIC = "automatic";

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

interface AssignSiteDialogProps {
  /** Who gets the site; null keeps the dialog closed */
  target: { kind: "farmer" | "aggregator"; id: string; name: string } | null;
  onClose: () => void;
  /** Runs after a site was saved, so the list behind can reload */
  onSaved?: () => void;
}

/**
 * Pick the aggregation site of a farmer or an aggregator. By default each one is given the nearest active
 * site automatically; choosing one here overrides that until "Nearest site" is chosen again.
 */
export function AssignSiteDialog({ target, onClose, onSaved }: AssignSiteDialogProps) {
  const [sites, setSites] = useState<AggregationSite[]>([]);
  const [assignment, setAssignment] = useState<SiteAssignment | null>(null);
  const [choice, setChoice] = useState(AUTOMATIC);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!target) return;
    let active = true;
    setLoading(true);
    setAssignment(null);
    Promise.all([
      aggregationSiteService.list({ active: true }),
      aggregationSiteService.getAssignment(target.kind, target.id),
    ])
      .then(([list, current]) => {
        if (!active) return;
        setSites(list);
        setAssignment(current);
        setChoice(current.assignedByAdmin && current.site ? current.site.id : AUTOMATIC);
      })
      .catch((error) => {
        if (!active) return;
        toast.error(errorMessage(error, "Failed to load the aggregation sites"));
        onClose();
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.kind, target?.id]);

  const save = async () => {
    if (!target) return;
    setSaving(true);
    try {
      await aggregationSiteService.assign(target.kind, target.id, choice === AUTOMATIC ? null : choice);
      toast.success(
        choice === AUTOMATIC
          ? `${target.name} now uses the nearest site`
          : `${target.name} was assigned to ${sites.find((s) => s.id === choice)?.name ?? "the site"}`
      );
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save the aggregation site"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aggregation site</DialogTitle>
          <DialogDescription>
            {target?.name} is given the nearest active site automatically. Choose a site here only when another one
            suits them better.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-xs text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading sites...
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              Now:{" "}
              <span className="font-medium">
                {assignment?.site
                  ? `${assignment.site.name}${assignment.site.district ? `, ${assignment.site.district}` : ""} (${
                      assignment.assignedByAdmin ? "chosen by an admin" : "nearest, automatic"
                    })`
                  : "no site yet"}
              </span>
            </p>
            <Label htmlFor="assign-site">Site</Label>
            <Select value={choice} onValueChange={setChoice}>
              <SelectTrigger id="assign-site" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={AUTOMATIC}>Nearest site (automatic)</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                    {site.district ? `, ${site.district}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="green" onClick={save} disabled={loading || saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
