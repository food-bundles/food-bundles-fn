"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MENU_TEMPLATES, getTemplate, startFromTemplate } from "@/lib/menu-designer/templates";
import type { SavedMenuSummary } from "@/lib/menu-designer/types";
import { apiError, menuService } from "@/app/services/menuService";
import { MenuFrame } from "./_components/MenuFrame";

/** Menu designer: the customer's menus, and designs to start a new one from */
export default function MenusPage() {
  const [menus, setMenus] = useState<SavedMenuSummary[] | null>(null);

  const load = () =>
    menuService
      .list()
      .then(setMenus)
      .catch(() => setMenus([]));

  useEffect(() => {
    load();
  }, []);

  const remove = async (menu: SavedMenuSummary) => {
    if (!window.confirm(`Delete the menu "${menu.name}"?`)) return;
    try {
      await menuService.remove(menu.id);
      toast.success("Menu deleted");
      load();
    } catch (err) {
      toast.error(apiError(err, "Could not delete the menu"));
    }
  };

  return (
    <div className="space-y-8 p-3 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Menus</h1>
        <p className="mt-1 text-sm text-gray-500">
          Design a menu for your customers, set your prices and see what each plate costs at your Food Bundles prices.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your menus</h2>
        {menus === null ? (
          <Loader2 className="h-6 w-6 animate-spin text-green-700" />
        ) : menus.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-white p-6 text-sm text-gray-500">
            No menu yet. Choose a design below to start: everything can be changed.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {menus.map((m) => {
              const t = getTemplate(m.templateId);
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm">
                  <span className="h-12 w-12 shrink-0 rounded-lg border" style={{ background: `linear-gradient(135deg, ${t.theme.background} 55%, ${t.theme.accent} 55%)` }} />
                  <Link href={`/restaurant/menus/${m.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {t.name} · {m.dishCount} dishes · {format(new Date(m.updatedAt), "PP")}
                    </p>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(m)} aria-label={`Delete ${m.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-lg font-semibold">Start from a design</h2>
        <p className="mb-4 text-sm text-gray-500">Each design comes with sample dishes, photos and prices you can change.</p>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {MENU_TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={`/restaurant/menus/new?template=${t.id}`}
              className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="pointer-events-none relative h-72 overflow-hidden border-b">
                <MenuFrame content={startFromTemplate(t.id)} template={t} title={`${t.name} design`} />
              </div>
              <div className="flex items-start gap-3 p-4">
                <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
                <div>
                  <p className="font-semibold group-hover:text-green-700">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
