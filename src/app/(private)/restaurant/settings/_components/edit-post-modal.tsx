/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePosts } from "@/app/contexts/post-context";
import { X, Video } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
}

const MAX_IMAGES = 5;
const MAX_VIDEOS = 3;
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;

export function EditPostModal({ isOpen, onClose, post }: EditPostModalProps) {
  const { updatePost, loading } = usePosts();
  const [content, setContent] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (post) {
      setContent(post.content || "");
      setIsActive(post.isActive ?? true);
    }
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (newImages.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    setNewImages([...newImages, ...files]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (newVideos.length + files.length > MAX_VIDEOS) {
      toast.error(`Maximum ${MAX_VIDEOS} videos allowed`);
      return;
    }

    for (const file of files) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(`Video "${file.name}" exceeds 10MB limit`);
        return;
      }
    }

    setNewVideos([...newVideos, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const removeNewVideo = (index: number) => {
    setNewVideos(newVideos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    const success = await updatePost(post.id, {
      content,
      images: newImages.length > 0 ? newImages : undefined,
      videos: newVideos.length > 0 ? newVideos : undefined,
      isActive,
    });

    if (success) {
      setNewImages([]);
      setNewVideos([]);
      onClose();
    }
  };

  if (!post) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Existing Images */}
          {post.images && post.images.length > 0 && (
            <div>
              <Label>Current Images</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {post.images.map((url: string, index: number) => (
                  <div key={index} className="relative">
                    <Image
                      src={url}
                      alt={`Current ${index}`}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="images">Add New Images (Max {MAX_IMAGES})</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="mt-1"
            />
            {newImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="videos">Add New Videos (Max {MAX_VIDEOS}, 10MB each)</Label>
            <Input
              id="videos"
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoChange}
              className="mt-1"
            />
            {newVideos.length > 0 && (
              <div className="space-y-2 mt-2">
                {newVideos.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewVideo(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Updating..." : "Update Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
