"use client";

import { DelegationSettings } from "./_components/DelegationSettings";

export default function TraderSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your trader account settings and preferences
        </p>
      </div>

      <DelegationSettings />
    </div>
  );
}
