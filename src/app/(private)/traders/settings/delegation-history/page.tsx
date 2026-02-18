"use client";

import { DelegationHistory } from "./_component/DelegationHistory";

export default function TraderSettingsPage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <DelegationHistory />
      </div>
    </div>
  );
}
