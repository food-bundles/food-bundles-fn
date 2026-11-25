import createAxiosClient from "@/app/hooks/axiosClient";
import type { MenuContent, SavedMenu, SavedMenuSummary } from "@/lib/menu-designer/types";

/** Menu designer: the customer's saved menus and dish photos */
const api = () => createAxiosClient();

/** Saving keeps only what the menu needs: search words are for opening templates */
const forSaving = (content: MenuContent): MenuContent => ({
  ...content,
  sections: content.sections.map((s) => ({
    ...s,
    dishes: s.dishes.map((d) => ({ ...d, ingredients: d.ingredients.map((g) => ({ productId: g.productId, name: g.name, qty: g.qty })) })),
  })),
});

export const menuService = {
  list: () => api().get<{ data: SavedMenuSummary[] }>("/menus").then((r) => r.data.data),
  get: (id: string) => api().get<{ data: SavedMenu }>(`/menus/${id}`).then((r) => r.data.data),
  create: (body: { name: string; templateId: string; content: MenuContent }) =>
    api().post<{ data: SavedMenu }>("/menus", { ...body, content: forSaving(body.content) }).then((r) => r.data.data),
  update: (id: string, body: { name?: string; templateId?: string; content?: MenuContent }) =>
    api()
      .put<{ data: SavedMenu }>(`/menus/${id}`, { ...body, content: body.content ? forSaving(body.content) : undefined })
      .then((r) => r.data.data),
  remove: (id: string) => api().delete(`/menus/${id}`),
  /** Uploads a photo of a dish; returns its address */
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api()
      .post<{ data: { url: string } }>("/menus/photos", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.data.url);
  },
};

export const apiError = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
