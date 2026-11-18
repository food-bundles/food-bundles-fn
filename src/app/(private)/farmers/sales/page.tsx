import { redirect } from "next/navigation";

/** Sales and the money report were two pages with the same numbers; the Sales report is now the one page */
export default function FarmerSalesPage() {
  redirect("/farmers/report");
}
