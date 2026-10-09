"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { CreateInvitationData, InvitationRole } from "@/app/services/invitationService";
import { RolePicker, toRolePayload } from "../../_components/role-picker";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvitationData) => Promise<void>;
  isLoading: boolean;
}

export function InviteModal({ isOpen, onClose, onSubmit, isLoading }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState<{ email?: string; role?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { email?: string; role?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!role) {
      newErrors.role = "Role is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const payload = toRolePayload(role);
      await onSubmit({
        email: email.trim(),
        role: payload.role as InvitationRole | undefined,
        adminRoleId: payload.adminRoleId,
      });
      setEmail("");
      setRole("");
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to send invitation:", error);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Send Invitation
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              placeholder="user@example.com"
              className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>
            <RolePicker
              value={role}
              onChange={(value) => {
                setRole(value);
                if (errors.role) setErrors(prev => ({ ...prev, role: undefined }));
              }}
              disabled={isLoading}
              invalid={!!errors.role}
            />
            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}