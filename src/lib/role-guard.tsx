// Frontend Role Guard - Token-Based
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function roleGuard(allowedRoles: string[]) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth-token")?.value;

  if (!token) redirect("/login");

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      redirect("/login");
    }

    const data = await res.json();
    const role = data.user?.role;

    console.log("User role:", role);

    if (!role || !allowedRoles.includes(role)) {
      redirect("/unauthorized");
    }

    return data.user;
  } catch (error) {
    console.error("Role guard error:", error);
    redirect("/");
  }
}
