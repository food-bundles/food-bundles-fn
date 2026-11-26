"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";

/**
 * "Continue with Google" for the Food Bundles mobile app. The app opens this
 * page in a secure in-app browser; Google's button gives a signed ID token,
 * which goes back to the app, and the app sends it to the same /google-login
 * the website uses (the backend checks it with Google).
 *
 * The token only ever goes back to the app: other addresses are refused.
 */
const APP_LINK = /^(foodbundles|exp|exps):\/\//;

const withParams = (base: string, params: Record<string, string>) =>
  `${base}${base.includes("?") ? "&" : "?"}${new URLSearchParams(params).toString()}`;

function MobileGoogle() {
  const search = useSearchParams();
  const back = search.get("redirect") ?? "";
  const valid = APP_LINK.test(back);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B2E1F] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#00A43A]">Food Bundles app</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0B2E1F]">Continue with Google</h1>
        <p className="mt-2 text-sm text-[#4A6358]">Choose your Google account. You will go straight back to the app.</p>

        {valid ? (
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={(res) => {
                if (!res.credential) return setError("Google did not answer. Please try again.");
                window.location.href = withParams(back, { credential: res.credential });
              }}
              onError={() => setError("Google sign-in was cancelled or failed. Please try again.")}
              text="continue_with"
              shape="pill"
              size="large"
            />
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">Open this page from the Food Bundles app.</p>
        )}

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {valid && (
          <a href={withParams(back, { error: "cancelled" })} className="mt-6 inline-block text-sm font-semibold text-[#0F5C36] underline">
            Back to the app
          </a>
        )}
      </div>
    </main>
  );
}

export default function MobileGooglePage() {
  return (
    <Suspense>
      <MobileGoogle />
    </Suspense>
  );
}
