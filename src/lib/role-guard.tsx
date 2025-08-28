import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function roleGuard(allowedRoles: string[]) {
  const token = (await cookies()).get("auth_token")?.value;

  if (!token) redirect("/login");

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
    headers: { Cookie: `auth_token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) redirect("/login");

  const data = await res.json();
  const role = data.user?.role;

  if (!role || !allowedRoles.includes(role)) {
    redirect("/unauthorized");
  }

  return data.user; 
}
