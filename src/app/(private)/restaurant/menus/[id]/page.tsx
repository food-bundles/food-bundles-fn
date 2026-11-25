"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { getTemplate, startFromTemplate } from "@/lib/menu-designer/templates";
import { apiError, menuService } from "@/app/services/menuService";
import { MenuEditor, type EditorStart } from "../_components/MenuEditor";

/** /restaurant/menus/new?template=… starts from a design; /restaurant/menus/{id} opens a saved menu */
export default function MenuEditorPage() {
  return (
    <Suspense>
      <MenuEditorLoader />
    </Suspense>
  );
}

function MenuEditorLoader() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const { user } = useAuth();
  const [start, setStart] = useState<EditorStart | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === "new") {
      const template = getTemplate(search.get("template") ?? "");
      setStart({ name: `${template.name} menu`, templateId: template.id, content: startFromTemplate(template.id, user?.name) });
      return;
    }
    menuService
      .get(id)
      .then((m) => setStart({ menuId: m.id, name: m.name, templateId: m.templateId, content: m.content }))
      .catch((err) => setError(apiError(err, "Could not open this menu")));
    // The business name only fills a new menu once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <Link href="/restaurant/menus" className="text-green-700 underline">
          Back to menus
        </Link>
      </div>
    );
  }
  if (!start) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-green-700" />
      </div>
    );
  }
  return <MenuEditor key={start.menuId ?? "new"} start={start} />;
}
