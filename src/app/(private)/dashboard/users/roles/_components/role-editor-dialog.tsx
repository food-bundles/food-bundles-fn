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

  // Manage implies View: ticking Manage adds View; unticking View removes Manage
  const toggle = (moduleKey: string, action: "view" | "manage", checked: boolean) => {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(`${moduleKey}.${action}`);
        if (action === "manage") next.add(`${moduleKey}.view`);
      } else {
        next.delete(`${moduleKey}.${action}`);
        if (action === "view") next.delete(`${moduleKey}.manage`);
      }
      return next;
    });
  };

  const setGroup = (modules: PermissionModuleInfo[], action: "view" | "manage", checked: boolean) =>
    modules.forEach((m) => toggle(m.key, action, checked));

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
              : "Choose what people with this role can see (View) and change (Manage)."}
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

          <div className="rounded-lg border">
            <div className="grid grid-cols-[1fr_70px_70px] items-center border-b bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
              <span>Feature</span>
              <span className="text-center">View</span>
              <span className="text-center">Manage</span>
            </div>
            {groups.map(([group, modules]) => {
              const allView = modules.every((m) => permissions.has(`${m.key}.view`));
              const allManage = modules.every((m) => permissions.has(`${m.key}.manage`));
              return (
                <div key={group} className="border-b last:border-b-0">
                  <div className="grid grid-cols-[1fr_70px_70px] items-center bg-green-50/60 px-3 py-1.5">
                    <span className="text-xs font-semibold text-green-800">{group}</span>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={allView}
                        disabled={readOnly}
                        onCheckedChange={(v) => setGroup(modules, "view", !!v)}
                        aria-label={`View all ${group}`}
                      />
                    </div>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={allManage}
                        disabled={readOnly}
                        onCheckedChange={(v) => setGroup(modules, "manage", !!v)}
                        aria-label={`Manage all ${group}`}
                      />
                    </div>
                  </div>
                  {modules.map((m) => (
                    <div
                      key={m.key}
                      className="grid grid-cols-[1fr_70px_70px] items-center px-3 py-1.5 hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-800">{m.label}</span>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permissions.has(`${m.key}.view`)}
                          disabled={readOnly}
                          onCheckedChange={(v) => toggle(m.key, "view", !!v)}
                          aria-label={`View ${m.label}`}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={permissions.has(`${m.key}.manage`)}
                          disabled={readOnly}
                          onCheckedChange={(v) => toggle(m.key, "manage", !!v)}
                          aria-label={`Manage ${m.label}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
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
