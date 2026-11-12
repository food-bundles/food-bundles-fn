import createAxiosClient from "@/app/hooks/axiosClient";

export interface FeaturedRestaurant {
  id: string;
  name: string;
  businessImage: string | null;
}

// Homepage "Trusted by Kigali's kitchens" and the business photo customers set
export const restaurantShowcaseService = {
  /** Public: customers an admin chose to show on the homepage */
  getFeatured: async (): Promise<FeaturedRestaurant[]> => {
    const response = await createAxiosClient().get("/restaurants/featured");
    return response.data?.data ?? [];
  },

  /** Logged-in customer: upload the photo of their business */
  uploadMyBusinessImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("image", file);
    const response = await createAxiosClient().put("/restaurants/me/business-image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data?.businessImage;
  },

  /** Logged-in customer: remove their business photo */
  removeMyBusinessImage: async (): Promise<void> => {
    await createAxiosClient().delete("/restaurants/me/business-image");
  },

  /** Admin: show or hide a customer on the homepage */
  setFeatured: async (restaurantId: string, featuredOnWebsite: boolean) => {
    const response = await createAxiosClient().patch(`/restaurants/${restaurantId}/featured`, {
      featuredOnWebsite,
    });
    return response.data;
  },
};
