import { Suspense } from "react";
import ProductManagement from "./_components/product-management";

export default function FarmerDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6">
      {/* Suspense: the dashboard reads ?submit=1 (sidebar "Submit produce") */}
      <Suspense fallback={null}>
        <ProductManagement />
      </Suspense>
    </div>
  );
}
