/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Lock, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AdminRole,
  adminRoleService,
  PermissionModuleInfo,
} from "@/app/services/adminRoleService";
import { adminsService } from "@/app/services/adminsService";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { RoleEditorDialog } from "./_components/role-editor-dialog";

// Dashboard users whose access comes from a role (others use their own apps)
const ASSIGNABLE = ["ADMIN", "STAFF", "MARKET_PRICES"];

export default function RolesPage() {
  const { user, loading: userLoading, isSuperAdmin } = useAdminAccess();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [catalog, setCatalog] = useState<PermissionModuleInfo[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<AdminRole | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [rolesRes, catalogRes, adminsRes] = await Promise.all([
      adminRoleService.getRoles(),
      adminRoleService.getPermissionCatalog(),
      adminsService.getAllAdmins({ limit: 100 }),
    ]);
    if (rolesRes.success) setRoles(rolesRes.data);
    else toast.error(rolesRes.message);
    if (catalogRes.success) setCatalog(catalogRes.data);
    const list = adminsRes?.data?.admins || adminsRes?.data || [];
    setAdmins(Array.isArray(list) ? list : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  const openEditor = (role: AdminRole | null) => {
    setEditingRole(role);
    setEditorOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRole) return;
    const result = await adminRoleService.deleteRole(deletingRole.id);
    setDeletingRole(null);
    if (result.success) {
      toast.success("Role deleted");
      load();
    } else {
      toast.error(result.message);
    }
  };

  const assignRole = async (adminId: string, adminRoleId: string) => {
    setAssigning(adminId);
    const result = await adminRoleService.assignRole(adminId, adminRoleId);
    setAssigning(null);
    if (result.success) {
      toast.success("Role updated — takes effect on their next page load");
      load();
    } else {
      toast.error(result.message);
    }
  };

  if (userLoading) {
    return <div className="p-6"><Skeleton className="h-40 w-full" /></div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Only super admins can manage roles and permissions.
      </div>
    );
  }

  const teamMembers = admins.filter((a) => ASSIGNABLE.includes(a.role) || a.role === "SUPERUSER");
  const permissionCount = catalog.length * 2;

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[16px] font-medium flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-green-600" />
            Roles & Permissions
          </h1>
          <p className="text-xs text-gray-600">
            Create roles, choose what each role can see and change, and assign them to your team.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => openEditor(null)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          New role
        </Button>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Roles ({roles.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({teamMembers.length})</TabsTrigger>
        </TabsList>

        {/* Roles */}
        <TabsContent value="roles" className="mt-4">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36" />)}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex flex-col rounded-xl border bg-gradient-to-br from-white to-emerald-50/60 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        {role.locked && <Lock className="h-3.5 w-3.5 text-gray-500" />}
                        <span className="truncate">{role.name}</span>
                      </p>
                      {role.isSystem && (
                        <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">
                          System role
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEditor(role)}
                        aria-label={role.locked ? "View role" : "Edit role"}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          onClick={() => setDeletingRole(role)}
                          aria-label="Delete role"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {role.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-gray-600">{role.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {role.adminCount} user{role.adminCount === 1 ? "" : "s"}
                    </span>
                    <span>
                      {role.locked ? "Full access" : `${role.permissions.length} of ${permissionCount} permissions`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="mt-4">
          <div className="rounded-xl border bg-white">
            <div className="grid grid-cols-[1fr_1fr_220px] gap-3 border-b bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
            </div>
            {loading ? (
              <div className="p-4"><Skeleton className="h-24 w-full" /></div>
            ) : teamMembers.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No dashboard users found</p>
            ) : (
              teamMembers.map((admin) => {
                const isSelf = admin.id === user?.id;
                const isSuper = admin.role === "SUPERUSER";
                return (
                  <div
                    key={admin.id}
                    className="grid grid-cols-[1fr_1fr_220px] items-center gap-3 border-b px-4 py-2 last:border-b-0 text-sm"
                  >
                    <span className="truncate font-medium text-gray-900">
                      {admin.username}
                      {isSelf && <span className="ml-1 text-xs text-gray-500">(you)</span>}
                    </span>
                    <span className="truncate text-gray-600">{admin.email}</span>
                    {isSuper ? (
                      <span className="text-xs font-semibold text-green-700">Super Admin</span>
                    ) : (
                      <Select
                        value={admin.adminRole?.id || ""}
                        onValueChange={(value) => assignRole(admin.id, value)}
                        disabled={isSelf || assigning === admin.id}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="No role assigned" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id} className="text-xs">
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Traders, logistics and aggregators use their own apps and are not listed here.
          </p>
        </TabsContent>
      </Tabs>

      <RoleEditorDialog
        open={editorOpen}
        role={editingRole}
        catalog={catalog}
        onClose={() => setEditorOpen(false)}
        onSaved={load}
      />

      <AlertDialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role</AlertDialogTitle>
            <AlertDialogDescription>
              Delete the role <strong>{deletingRole?.name}</strong>? This can&apos;t be undone.
              {!!deletingRole?.adminCount &&
                ` ${deletingRole.adminCount} user(s) still have this role — move them to another role first.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
