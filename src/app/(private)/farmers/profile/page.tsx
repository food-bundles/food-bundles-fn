
import FarmerProfile from "./_compponents/profile";
import { DefaultAccountSetting } from "@/components/default-account";

export default function FarmerProfilePage() {
  return (
    <>
      {/* Only shown to people with more than one account */}
      <DefaultAccountSetting className="mx-4 mt-4 sm:mx-6" />
      <FarmerProfile />
    </>
  );
}
