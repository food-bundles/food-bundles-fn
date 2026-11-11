import { redirect } from "next/navigation";

// The guest shop moved to /shop, which works for visitors and buyers alike.
export default function GuestPage() {
  redirect("/shop");
}
