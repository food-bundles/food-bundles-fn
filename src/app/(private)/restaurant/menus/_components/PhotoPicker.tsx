"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LIBRARY_PHOTOS, PHOTO_CATEGORIES, photoUrl, type PhotoCategory } from "@/lib/menu-designer/photos";
import { apiError, menuService } from "@/app/services/menuService";

const MAX_BYTES = 5 * 1024 * 1024;

/** A dish photo: from the built-in library, or a photo of their own dish */
export function PhotoPicker({ value, onChange }: { value?: string; onChange: (url?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<PhotoCategory>("mains");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file (JPG, PNG or WebP)");
    if (file.size > MAX_BYTES) return toast.error("The photo must be 5 MB or smaller");
    setUploading(true);
    try {
      onChange(await menuService.uploadPhoto(file));
      setOpen(false);
    } catch (err) {
      toast.error(apiError(err, "Could not upload the photo"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border bg-muted/40 cursor-pointer"
        aria-label="Choose a photo"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <ImagePlus className="h-5 w-5" /> Add photo
          </span>
        )}
      </button>
      <div className="flex flex-col gap-1">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? "Change photo" : "Choose photo"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            <X className="mr-1 h-4 w-4" /> Remove
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose a photo</DialogTitle>
            <DialogDescription>Pick one of our food photos, or upload a photo of your own dish (best).</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tabs value={category} onValueChange={(v) => setCategory(v as PhotoCategory)}>
              <TabsList className="flex h-auto flex-wrap">
                {PHOTO_CATEGORIES.map((c) => (
                  <TabsTrigger key={c.id} value={c.id}>
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={upload} />
            <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-green-700 hover:bg-green-600">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              Upload my photo
            </Button>
          </div>
          <div className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {LIBRARY_PHOTOS.filter((p) => p.category === category).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(photoUrl(p.id));
                  setOpen(false);
                }}
                className="group overflow-hidden rounded-lg border text-left cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl(p.id, 360)} alt={p.label} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" loading="lazy" />
                <span className="block px-2 py-1 text-xs">{p.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Library photos from Unsplash.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
