"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { TrashedUser, TrashUserType, userTrashService } from "@/app/services/userTrashService";

const FILTERS: Array<{ value: TrashUserType | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "farmer", label: "Farmers" },
  { value: "restaurant", label: "Restaurants" },
  { value: "admin", label: "Team accounts" },
];

const TYPE_LABELS: Record<TrashUserType, string> = {
  farmer: "Farmer",
  restaurant: "Restaurant",
  admin: "Team account",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// Deleted users (soft delete). They can't sign in; restore brings them back.
export default function TrashPage() {
  const { isSuperAdmin, loading: accessLoading } = useAdminAccess();
  const [filter, setFilter] = useState<TrashUserType | "all">("all");
  const [items, setItems] = useState<TrashedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [purging, setPurging] = useState<TrashedUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await userTrashService.list(filter === "all" ? undefined : filter));
    } catch {
      toast.error("Failed to load the trash");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  const restore = async (item: TrashedUser) => {
    setBusyId(item.id);
    try {
      await userTrashService.restore(item.type, item.id);
      toast.success(`${item.name || item.email || "User"} restored`);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteForever = async () => {
    if (!purging) return;
    const item = purging;
    setPurging(null);
    setBusyId(item.id);
    try {
      await userTrashService.deleteForever(item.type, item.id);
      toast.success("User deleted permanently");
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  if (accessLoading) {
    return <div className="p-6"><Skeleton className="h-40 w-full" /></div>;
  }
  if (!isSuperAdmin) {
    return <div className="p-6 text-sm text-gray-600">Only super admins can open the trash.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-[16px] font-medium flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-red-600" />
          Trash
        </h1>
        <p className="text-xs text-gray-600">
          Deleted users can&apos;t sign in and are hidden from every list. Restore brings them back
          exactly as they were.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`h-8 px-3 rounded-full border text-xs transition-colors cursor-pointer ${
              filter === f.value
                ? "border-green-600 bg-green-50 text-green-700 font-medium"
                : "border-gray-300 text-gray-700 hover:border-green-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">User</th>
              <th className="px-4 py-2 text-left font-semibold">Type</th>
              <th className="px-4 py-2 text-left font-semibold">Contact</th>
              <th className="px-4 py-2 text-left font-semibold">Deleted</th>
              <th className="px-4 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4"><Skeleton className="h-20 w-full" /></td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                  The trash is empty
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={`${item.type}-${item.id}`} className="border-t">
                  <td className="px-4 py-2 font-medium text-gray-900">{item.name || "No name"}</td>
                  <td className="px-4 py-2 text-gray-700">{TYPE_LABELS[item.type]}</td>
                  <td className="px-4 py-2 text-gray-600">
                    <div>{item.email || "No email"}</div>
                    <div className="text-xs">{item.phone || "No phone"}</div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    <div>{formatDate(item.deletedAt)}</div>
                    {item.deletedByName && <div className="text-xs">by {item.deletedByName}</div>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => restore(item)}
                        className="h-8 text-xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === item.id}
                        onClick={() => setPurging(item)}
                        className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete forever
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!purging} onOpenChange={(open) => !open && setPurging(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{purging?.name || purging?.email}</strong> will be removed for good and can&apos;t
              be restored. Users with orders, payments or other records can only stay in the trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteForever} className="bg-red-600 hover:bg-red-700">
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
