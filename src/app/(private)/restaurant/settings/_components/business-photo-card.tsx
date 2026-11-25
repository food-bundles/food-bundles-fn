/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { restaurantService } from "@/app/services/restaurantService";
import { restaurantShowcaseService } from "@/app/services/restaurantShowcaseService";

const MAX_BYTES = 5 * 1024 * 1024;

// The photo of the customer's business (storefront, dining room, a dish).
// It is used on the Food Bundles homepage when an admin features the customer.
export function BusinessPhotoCard() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    restaurantService
      .getRestaurantById(user.id)
      .then((res) => setImage(res.data?.businessImage ?? null))
      .catch(() => setImage(null))
      .finally(() => setLoading(false));
  }, [user?.id]);

  // The photo is the business owner's to manage
  if (user?.role === "AFFILIATOR") return null;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file (JPG, PNG or WebP)");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("The photo must be 5 MB or smaller");
      return;
    }
    setBusy(true);
    try {
      const url = await restaurantShowcaseService.uploadMyBusinessImage(file);
      setImage(url);
      toast.success("Business photo updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not upload the photo");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setBusy(true);
    try {
      await restaurantShowcaseService.removeMyBusinessImage();
      setImage(null);
      toast.success("Business photo removed");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not remove the photo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-6" aria-labelledby="business-photo-h">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-2xl bg-[#F6F9F7]">
          {image ? (
            <Image src={image} alt="Your business photo" fill sizes="128px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[#4A6358]">
              <Store className="h-7 w-7" />
              <span className="text-xs">{loading ? "Loading…" : "No photo yet"}</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 id="business-photo-h" className="m-0 text-lg font-bold text-[#0B2E1F]">
            Business photo
          </h2>
          <p className="m-0 text-sm leading-relaxed text-[#4A6358]">
            A photo of your restaurant, hotel or school: the front, the dining room or a dish you serve.
            If Food Bundles features your business on its website, this photo is shown with your name.
          </p>
          <p className="m-0 text-xs text-[#4A6358]">JPG, PNG or WebP, up to 5 MB. A portrait photo looks best.</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy || loading}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0B2E1F] px-4 text-sm font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
            >
              <ImagePlus className="h-4 w-4" />
              {busy ? "Saving…" : image ? "Change photo" : "Upload photo"}
            </button>
            {image && (
              <button
                type="button"
                onClick={onRemove}
                disabled={busy}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#DCE6DF] px-4 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
