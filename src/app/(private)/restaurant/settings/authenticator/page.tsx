import AuthenticatorManagement from "@/components/shared/authenticator-management";
import { BusinessPhotoCard } from "../_components/business-photo-card";

export default function AuthenticatorManagementPage() {
  return (
    <div className="flex flex-col gap-4 p-3">
      <BusinessPhotoCard />
      <AuthenticatorManagement />
    </div>
  );
}
