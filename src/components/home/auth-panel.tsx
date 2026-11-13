import type { ReactNode } from "react";

// Dark brand panel on the left of the login and signup cards.
export function AuthPanel({
  kicker,
  title,
  text,
  points,
  children,
}: {
  kicker: string;
  title: ReactNode;
  text?: string;
  points?: string[];
  children?: ReactNode;
}) {
  return (
    <div className="fb-mesh relative flex w-full flex-col justify-center gap-5 overflow-hidden p-7 text-white sm:p-10">
      <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold tracking-[1.2px]">
        <span className="fb-live h-2 w-2 rounded-full bg-[#00D048]" />
        {kicker}
      </span>
      <h1 className="fb-display m-0 text-[clamp(32px,3.6vw,46px)] font-bold leading-[1.02] tracking-[-1.4px]">{title}</h1>
      {text && <p className="m-0 max-w-[420px] text-[17px] leading-relaxed text-[#E4F5EA]">{text}</p>}
      {points && (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[16px] leading-snug">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00D048]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B2E1F" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              </span>
              {p}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

// Shared form styles for the auth pages
export const authInput =
  "h-12 rounded-xl border-[#DCE6DF] bg-white px-4 text-base text-[#0B2E1F] shadow-none placeholder:text-[#7A8E83] focus-visible:border-[#00A43A] focus-visible:ring-[#00A43A]/25";
export const authPrimaryButton =
  "h-12 rounded-full bg-[#0B2E1F] text-base font-bold text-white transition-colors hover:bg-[#0F5C36] disabled:cursor-not-allowed disabled:opacity-60";
export const authSecondaryButton =
  "h-12 rounded-full border border-[#C5D1C6] bg-white text-base font-bold text-[#0B2E1F] transition-colors hover:bg-[#F6F9F7] disabled:opacity-60";
