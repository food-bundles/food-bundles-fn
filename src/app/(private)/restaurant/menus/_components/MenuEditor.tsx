"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, Plus, Printer, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MENU_TEMPLATES, getTemplate } from "@/lib/menu-designer/templates";
import { dishCost, linkIngredients, margin, marginLevel, newId, sellingPrice } from "@/lib/menu-designer/costing";
import type { MenuContent, MenuDish, MenuSection } from "@/lib/menu-designer/types";
import { apiError, menuService } from "@/app/services/menuService";
import { DishDialog } from "./DishDialog";
import { MenuFrame, type MenuFrameHandle } from "./MenuFrame";
import { SectionCard } from "./SectionCard";
import { useMenuProducts } from "./useMenuProducts";
import { exportMenuPdf } from "./exportPdf";

export interface EditorStart {
  menuId?: string;
  name: string;
  templateId: string;
  content: MenuContent;
}

/** Edit a menu: content on the left, the finished menu on the right, costs from Food Bundles prices */
export function MenuEditor({ start }: { start: EditorStart }) {
  const router = useRouter();
  const { products, loading: productsLoading } = useMenuProducts();
  const [menuId, setMenuId] = useState(start.menuId);
  const [name, setName] = useState(start.name);
  const [templateId, setTemplateId] = useState(start.templateId);
  const [content, setContent] = useState<MenuContent>(start.content);
  const [editing, setEditing] = useState<{ sectionId: string; dish: MenuDish } | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dirty, setDirty] = useState(!start.menuId);
  const linked = useRef(false);
  const frame = useRef<MenuFrameHandle>(null);
  const template = getTemplate(templateId);

  // Once the products arrive, link each ingredient to its Food Bundles product
  useEffect(() => {
    if (linked.current || productsLoading) return;
    linked.current = true;
    setContent((c) => linkIngredients(c, products));
  }, [products, productsLoading]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (next: MenuContent) => {
    setContent(next);
    setDirty(true);
  };
  const setSection = (id: string, section: MenuSection) => update({ ...content, sections: content.sections.map((s) => (s.id === id ? section : s)) });
  const moveSection = (i: number, step: -1 | 1) => {
    const j = i + step;
    if (j < 0 || j >= content.sections.length) return;
    const sections = [...content.sections];
    [sections[i], sections[j]] = [sections[j], sections[i]];
    update({ ...content, sections });
  };

  const summary = useMemo(() => {
    let dishes = 0, low = 0, missing = 0, total = 0, counted = 0;
    for (const s of content.sections)
      for (const d of s.dishes) {
        dishes += 1;
        const { cost, missing: m } = dishCost(d, products);
        missing += m.length;
        const mg = margin(sellingPrice(d, s), cost);
        if (cost > 0 && mg !== null) {
          total += mg;
          counted += 1;
          if (marginLevel(mg) === "low") low += 1;
        }
      }
    return { dishes, low, missing, average: counted ? total / counted : null };
  }, [content, products]);

  const save = async () => {
    if (!name.trim()) return toast.error("Give the menu a name");
    setSaving(true);
    try {
      if (menuId) await menuService.update(menuId, { name: name.trim(), templateId, content });
      else {
        const created = await menuService.create({ name: name.trim(), templateId, content });
        setMenuId(created.id);
        router.replace(`/restaurant/menus/${created.id}`);
      }
      setDirty(false);
      toast.success("Menu saved");
    } catch (err) {
      toast.error(apiError(err, "Could not save the menu"));
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    const page = frame.current?.page();
    if (!page) return;
    setExporting(true);
    try {
      await exportMenuPdf(page, name || content.title, template.theme.background);
    } catch {
      toast.error("Could not make the PDF. Try Print → Save as PDF.");
    } finally {
      setExporting(false);
    }
  };

  const editingSection = content.sections.find((s) => s.id === editing?.sectionId);

  return (
    <div className="space-y-4 p-3 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/restaurant/menus">
            <ArrowLeft className="mr-1 h-4 w-4" /> Menus
          </Link>
        </Button>
        <Input value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} className="h-9 max-w-xs font-semibold" aria-label="Menu name" placeholder="Menu name" />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => frame.current?.print()}>
            <Printer className="mr-1 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPdf} disabled={exporting}>
            {exporting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />} PDF
          </Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-green-700 hover:bg-green-600">
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />} {dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {MENU_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTemplateId(t.id); setDirty(true); }}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm cursor-pointer ${t.id === templateId ? "border-green-700 bg-green-50 font-semibold" : "bg-white"}`}
          >
            <span className="h-4 w-4 rounded-full border" style={{ background: `linear-gradient(135deg, ${t.theme.background} 50%, ${t.theme.accent} 50%)` }} />
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="menu-title">Title on the menu</Label>
              <Input id="menu-title" value={content.title} onChange={(e) => update({ ...content, title: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="menu-sub">Subtitle</Label>
              <Input id="menu-sub" value={content.subtitle ?? ""} onChange={(e) => update({ ...content, subtitle: e.target.value })} placeholder="Home-style cooking" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="menu-note">Hours / note</Label>
              <Input id="menu-note" value={content.note ?? ""} onChange={(e) => update({ ...content, note: e.target.value })} placeholder="Available 11AM - 4PM" />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="menu-contact">Contact</Label>
              <Input id="menu-contact" value={content.contact ?? ""} onChange={(e) => update({ ...content, contact: e.target.value })} placeholder="For reservation: 0788 000 000" />
            </div>
          </div>

          <div className="rounded-2xl border bg-green-50 p-4 text-sm text-green-950">
            <p className="font-semibold">Costs at your Food Bundles prices</p>
            {productsLoading ? (
              <p className="mt-1 text-green-900/80">Loading prices…</p>
            ) : (
              <p className="mt-1 text-green-900/80">
                {summary.dishes} dishes
                {summary.average !== null ? ` · average margin ${Math.round(summary.average * 100)}%` : ""}
                {summary.low ? ` · ${summary.low} with a low margin (under 50%)` : ""}
                {summary.missing ? ` · ${summary.missing} ingredients not on Food Bundles` : ""}
              </p>
            )}
          </div>

          {content.sections.map((s, i) => (
            <SectionCard
              key={s.id}
              section={s}
              products={products}
              onChange={(next) => setSection(s.id, next)}
              onRemove={() => update({ ...content, sections: content.sections.filter((x) => x.id !== s.id) })}
              onMove={(step) => moveSection(i, step)}
              onEditDish={(dish) => setEditing({ sectionId: s.id, dish })}
              onAddDish={() => setEditing({ sectionId: s.id, dish: { id: newId("d"), name: "", ingredients: [] } })}
            />
          ))}
          <Button variant="outline" onClick={() => update({ ...content, sections: [...content.sections, { id: newId("s"), title: "New section", dishes: [] }] })}>
            <Plus className="mr-1 h-4 w-4" /> Add section
          </Button>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="overflow-hidden rounded-2xl border shadow-sm">
            <MenuFrame ref={frame} content={content} template={template} />
          </div>
        </div>
      </div>

      <DishDialog
        dish={editing?.dish ?? null}
        sectionPrice={editingSection?.price}
        products={products}
        onClose={() => setEditing(null)}
        onSave={(dish) => {
          if (!editingSection) return;
          const exists = editingSection.dishes.some((d) => d.id === dish.id);
          setSection(editingSection.id, {
            ...editingSection,
            dishes: exists ? editingSection.dishes.map((d) => (d.id === dish.id ? dish : d)) : [...editingSection.dishes, dish],
          });
          setEditing(null);
        }}
      />
    </div>
  );
}
