"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { newsletterService, NewsletterCampaign } from "@/app/services/newsletterService";
import { toast } from "sonner";

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaign: NewsletterCampaign | null;
}

export default function EditCampaignModal({
  isOpen,
  onClose,
  onSuccess,
  campaign,
}: EditCampaignModalProps) {
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        subject: campaign.subject,
        content: campaign.content,
      });
    }
  }, [campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    
    setLoading(true);
    try {
      await newsletterService.updateCampaign(campaign.id, formData);
      toast.success("Campaign updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Newsletter Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Weekly Price Updates - FoodBundles"
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="This week's updates check out our latest prices.."
              rows={10}
              required
              className="font-mono text-sm"
            />
            {/* <p className="text-xs text-gray-500 mt-1">
              You can use HTML tags to format your email content
            </p> */}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-600">
              {loading ? "Updating..." : "Update Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
