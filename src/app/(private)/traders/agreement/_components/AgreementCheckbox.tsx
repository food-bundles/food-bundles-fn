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
    <div className="space-y-3 sm:space-y-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
      <label className="flex items-start space-x-2 sm:space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 rounded border-2 border-border flex-shrink-0"
        />
        <span className="text-xs sm:text-sm leading-relaxed">
          I have read and agree to the terms and conditions of the Digital Food
          Store Owner Agreement.
        </span>
      </label>

      <button
        onClick={handleAccept}
        disabled={!agreed}
        className="w-full bg-primary text-primary-foreground py-2.5 sm:py-2 px-4 text-sm sm:text-base rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        Accept Agreement
      </button>
    </div>
  );
}
