"use client";

import { DelegationSettings } from "../manage/_component/DelegationSettings";
import { DelegationHistory } from "./_component/DelegationHistory";

export default function TraderSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <DelegationHistory />
      </div>
    </div>
  );
}
