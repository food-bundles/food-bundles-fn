"use client";

import { useState } from "react";

export default function AgreementCheckbox() {
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      localStorage.setItem("traderAgreementAccepted", "true");
      document.cookie = "traderAgreementAccepted=true; path=/; max-age=31536000"; // 1 year
      window.location.href = "/traders";
    }
  };

  return (
    <div className="space-y-4">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-5 h-5 mt-1 rounded border-2 border-border"
        />
        <span className="text-sm leading-relaxed">
          I have read and agree to the terms and conditions of the Digital Food
          Store Owner Agreement.
        </span>
      </label>

      <button
        onClick={handleAccept}
        disabled={!agreed}
        className="w-full bg-primary text-primary-foreground py-2 px-4 text-sm rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        Accept Agreement
      </button>
    </div>
  );
}
