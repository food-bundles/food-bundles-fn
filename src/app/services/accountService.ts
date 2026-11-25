import createAxiosClient from "@/app/hooks/axiosClient";

/** Same rules as the backend: at least 8 characters, capital, small letter, number, symbol */
export const passwordProblem = (password: string): string | null => {
  if (password.length < 8) return "Use at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Add a capital letter";
  if (!/[a-z]/.test(password)) return "Add a small letter";
  if (!/\d/.test(password)) return "Add a number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add a symbol such as @ or #";
  return null;
};

export const accountService = {
  /** The signed-in person changes their own password */
  changePassword: (currentPassword: string, newPassword: string) =>
    createAxiosClient().patch("/account/password", { currentPassword, newPassword }),
};
