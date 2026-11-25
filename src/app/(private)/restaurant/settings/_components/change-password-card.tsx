"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { accountService, passwordProblem } from "@/app/services/accountService";
import { apiMessage } from "@/app/services/affiliatorManageService";

const field =
  "h-11 w-full rounded-xl border border-[#DCE6DF] bg-white px-3 pr-10 text-sm text-[#0B2E1F] outline-none focus:border-[#0F5C36]";

// Change the password of the signed-in person. An affiliator uses it to
// replace the code they received by SMS with their own password.
export function ChangePasswordCard() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const affiliator = user?.role === "AFFILIATOR";
  const problem = next ? passwordProblem(next) : null;
  const mismatch = again.length > 0 && again !== next;
  const ready = current && next && !problem && again === next;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    try {
      await accountService.changePassword(current, next);
      toast.success("Password changed. Use it next time you log in.");
      setCurrent("");
      setNext("");
      setAgain("");
    } catch (err) {
      toast.error(apiMessage(err, "Could not change the password"));
    } finally {
      setBusy(false);
    }
  };

  const input = (id: string, label: string, value: string, set: (v: string) => void, hint?: string | null) => (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm font-semibold text-[#0B2E1F]">
      {label}
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => set(e.target.value)} className={field} autoComplete="new-password" />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A6358] cursor-pointer"
          aria-label={show ? "Hide passwords" : "Show passwords"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint ? <span className="text-xs font-normal text-red-600">{hint}</span> : null}
    </label>
  );

  return (
    <section className="rounded-2xl border border-[#DCE6DF] bg-white p-5 sm:p-6" aria-labelledby="change-password-h">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-[#0F5C36]" />
        <h2 id="change-password-h" className="m-0 text-lg font-bold text-[#0B2E1F]">
          Change password
        </h2>
      </div>
      <p className="mt-2 mb-4 text-sm leading-relaxed text-[#4A6358]">
        {affiliator
          ? "Logged in with the code you received by SMS? Set your own password here."
          : "Use at least 8 characters with a capital letter, a small letter, a number and a symbol (for example Test@1234)."}
      </p>
      <form onSubmit={onSubmit} className="grid max-w-md gap-3">
        {input("pw-current", affiliator ? "Current password (or SMS code)" : "Current password", current, setCurrent)}
        {input("pw-new", "New password", next, setNext, problem)}
        {input("pw-again", "Repeat new password", again, setAgain, mismatch ? "The passwords don't match" : null)}
        <button
          type="submit"
          disabled={!ready || busy}
          className="mt-1 inline-flex h-10 w-fit items-center gap-2 rounded-full bg-[#0B2E1F] px-5 text-sm font-bold text-white hover:bg-[#0F5C36] disabled:opacity-60 cursor-pointer"
        >
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>
    </section>
  );
}
