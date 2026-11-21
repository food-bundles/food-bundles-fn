import FarmerProfile from "./_compponents/profile";
import { MyCropsCard } from "../_components/my-crops-card";
import { MySiteCard } from "../_components/my-site-card";

export default function FarmerProfilePage() {
  return (
    <>
      <FarmerProfile />
      {/* Same width as the profile above */}
      <div className="container mx-auto max-w-4xl space-y-6 px-6 pb-6">
        <MySiteCard />
        <MyCropsCard />
      </div>
    </>
  );
}
