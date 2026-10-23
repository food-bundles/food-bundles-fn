"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AdminRole,
  adminRoleService,
  PermissionModuleInfo,
} from "@/app/services/adminRoleService";

interface RoleEditorDialogProps {
  open: boolean;
  role: AdminRole | null; // null = create
  catalog: PermissionModuleInfo[];
  onClose: () => void;
  onSaved: () => void;
}

export function RoleEditorDialog({ open, role, catalog, onClose, onSaved }: RoleEditorDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const readOnly = !!role?.locked;

  useEffect(() => {
    if (!open) return;
    setName(role?.name || "");
    setDescription(role?.description || "");
    setPermissions(new Set(role?.permissions || []));
  }, [open, role]);

  const groups = useMemo(() => {
    const map = new Map<string, PermissionModuleInfo[]>();
    catalog.forEach((m) => map.set(m.group, [...(map.get(m.group) || []), m]));
    return Array.from(map.entries());
  }, [catalog]);

  const keysOf = (m: PermissionModuleInfo) => m.actions.map((a) => `${m.key}.${a.key}`);

  // Any action implies View: ticking an action adds View; unticking View
  // removes every action of that feature
  const toggle = (moduleKey: string, action: string, checked: boolean) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(`${moduleKey}.${action}`);
        next.add(`${moduleKey}.view`);
      } else if (action === "view") {
        [...next].filter((p) => p.startsWith(`${moduleKey}.`)).forEach((p) => next.delete(p));
      } else {
        next.delete(`${moduleKey}.${action}`);
      }
      return next;
    });
  };

  // Tick or clear every action of the given features
  const setAll = (modules: PermissionModuleInfo[], checked: boolean) =>
    setPermissions((prev) => {
      const next = new Set(prev);
      modules.flatMap(keysOf).forEach((p) => (checked ? next.add(p) : next.delete(p)));
      return next;
    });

  const hasAll = (modules: PermissionModuleInfo[]) =>
    modules.flatMap(keysOf).every((p) => permissions.has(p));

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a role name");
      return;
    }
    setSaving(true);
    const payload = { name: name.trim(), description: description.trim(), permissions: [...permissions] };
    const result = role
      ? await adminRoleService.updateRole(role.id, payload)
      : await adminRoleService.createRole(payload);
    setSaving(false);

    if (result.success) {
      toast.success(role ? "Role updated" : "Role created");
      onSaved();
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            {readOnly && <Lock className="h-4 w-4 text-gray-500" />}
            {role ? (readOnly ? role.name : `Edit role: ${role.name}`) : "New role"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {readOnly
              ? "The Administrator role always has access to everything and can't be changed."
              : "Choose what people with this role can see (View) and each action they may take."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs mb-1">Role name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Operations Manager"
                disabled={readOnly || !!role?.isSystem}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs mb-1">Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this role is for"
                disabled={readOnly}
                className="text-sm min-h-9"
                rows={1}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {permissions.size} of {catalog.reduce((n, m) => n + m.actions.length, 0)} permissions
            </span>
            {!readOnly && (
              <div className="flex gap-3">
                <button type="button" className="text-green-700 hover:underline" onClick={() => setAll(catalog, true)}>
                  Select all
                </button>
                <button type="button" className="text-gray-600 hover:underline" onClick={() => setAll(catalog, false)}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div className="rounded-lg border">
            {groups.map(([group, modules]) => (
              <div key={group} className="border-b last:border-b-0">
                <label className="flex items-center gap-2 bg-green-50/60 px-3 py-1.5">
                  <Checkbox
                    checked={hasAll(modules)}
                    disabled={readOnly}
                    onCheckedChange={(v) => setAll(modules, !!v)}
                    aria-label={`All of ${group}`}
                  />
                  <span className="text-xs font-semibold text-green-800">{group}</span>
                </label>
                {modules.map((m) => (
                  <div key={m.key} className="px-3 py-2 border-t border-gray-100 hover:bg-gray-50/60">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={hasAll([m])}
                        disabled={readOnly}
                        onCheckedChange={(v) => setAll([m], !!v)}
                        aria-label={`Everything in ${m.label}`}
                      />
                      <span className="text-sm font-medium text-gray-900">{m.label}</span>
                    </label>
                    <div className="mt-1.5 ml-6 flex flex-wrap gap-x-4 gap-y-1.5">
                      {m.actions.map((action) => (
                        <label key={action.key} className="flex items-center gap-1.5 text-xs text-gray-700">
                          <Checkbox
                            checked={permissions.has(`${m.key}.${action.key}`)}
                            disabled={readOnly}
                            onCheckedChange={(v) => toggle(m.key, action.key, !!v)}
                            className="h-3.5 w-3.5"
                          />
                          {action.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
              {role ? "Save changes" : "Create role"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
