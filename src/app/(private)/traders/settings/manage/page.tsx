/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { CommissionSettings } from "./_component/CommissionSettings";
import { DelegationSettings } from "./_component/DelegationSettings";
import { traderService } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function TraderSettingsPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [walletRes, statusRes] = await Promise.all([
        traderService.getWallet(),
        traderService.getDelegationStatus(),
      ]);
      setWallet(walletRes.data);
      setStatus(statusRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const delegationStatus = status?.status || status?.delegationStatus;
  const commission = wallet?.commission || status?.commission || 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your trader account settings and preferences
        </p>
      </div>

      {/* Info Section */}
      <Card className="p-2 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 ">
            <p className="text-sm text-gray-600">Delegation Status :</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24 " />
            ) : (
              <p
                className={`text-sm font-semibold  ${
                  delegationStatus === "ACCEPTED"
                    ? "text-green-600"
                    : delegationStatus === "PENDING"
                      ? "text-yellow-600"
                      : "text-gray-600"
                }`}
              >
                {delegationStatus === "ACCEPTED"
                  ? "Active"
                  : delegationStatus === "PENDING"
                    ? "Pending"
                    : "Inactive"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ">
            <p className="text-sm text-gray-600">Commission Mode :</p>
            {isLoading ? (
              <Skeleton className="h-6 w-24 " />
            ) : (
              <p className="font-semibold text-gray-600">
                {wallet?.commissionMode.toLowerCase() || status?.commissionMode.toLowerCase() || "Normal"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ">
            <p className="text-sm text-gray-600">Commission Rate :</p>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="font-semibold text-gray-600">{commission}%</p>
            )}
          </div>
        </div>
      </Card>

      {/* Settings Cards */}
      <div className="flex flex-wrap gap-4">
        {!isLoading && (
          <>
            <DelegationSettings commission={commission} />
            <CommissionSettings
              commissionMode={wallet?.commissionMode || "Normal"}
              commission={commission}
              onUpdate={fetchData}
            />
          </>
        )}
        {isLoading && (
          <>
            <Skeleton className="h-64 w-full sm:w-64" />
            <Skeleton className="h-64 w-full sm:w-64" />
          </>
        )}
      </div>
    </div>
  );
}
