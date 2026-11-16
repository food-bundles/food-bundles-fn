"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus } from "lucide-react";
import { CreateInvitationData, InvitationRole } from "@/app/services/invitationService";
import { RolePicker, toRolePayload } from "../../_components/role-picker";
import { personAdminService } from "@/app/services/roleService";

type Existing = Awaited<ReturnType<typeof personAdminService.byEmail>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  // The account this email already belongs to: the invitation adds a role to it
  const [existing, setExisting] = useState<Existing>(null);

  useEffect(() => {
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setExisting(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      personAdminService
        .byEmail(value)
        .then((r) => !cancelled && setExisting(r))
        .catch(() => !cancelled && setExisting(null));
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [email]);

  // A role they already have (a dashboard role counts as Staff)
  const picked = role ? toRolePayload(role) : null;
  const pickedRole = picked ? picked.role ?? "STAFF" : null;
  const alreadyHeld = existing?.roles.find((r) => r.role === pickedRole);

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
    } else if (alreadyHeld) {
      newErrors.role = alreadyHeld.status === "PENDING" ? `They already asked for ${alreadyHeld.label}: approve it in Role requests` : `They already have the ${alreadyHeld.label} role`;
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
    setExisting(null);
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
            {existing && !existing.unlinked && (
              <p className="mt-2 rounded-lg bg-[#EFFAF3] p-2.5 text-xs text-[#0B2E1F]">
                This email already belongs to <b>{existing.name || "a Food Bundles user"}</b>
                {existing.roles.length > 0 && <> ({existing.roles.map((r) => (r.status === "ACTIVE" ? r.label : `${r.label}, ${r.status.toLowerCase()}`)).join(", ")})</>}. The
                invitation adds the new role to that account; they keep their password.
              </p>
            )}
            {existing?.unlinked && (
              <p className="mt-2 rounded-lg bg-[#FFF4DD] p-2.5 text-xs text-[#9A6400]">
                This email is used by an account that hasn&apos;t been imported into people yet.
              </p>
            )}
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
              {existing && !existing.unlinked ? "Invite to add role" : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}