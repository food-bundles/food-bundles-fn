/** User Lookup page for this person (by email, else phone, else id): all their accounts and details */
export const lookupHref = (user: { email?: string | null; phone?: string | null; id: string }) =>
  `/dashboard/users/lookup?q=${encodeURIComponent(user.email || user.phone || user.id)}`;
