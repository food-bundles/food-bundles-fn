"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react";
import { walletService, IWalletTransfer } from "@/app/services/walletService";

export function VoucherTransfersList() {
  const [transfers, setTransfers] = useState<IWalletTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    walletService
      .getMyWalletTransfers()
      .then((res) => setTransfers(res?.data ?? []))
      .catch(() => setTransfers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const getSourceLabel = (source: string) => {
    switch ((source || "VOUCHER_EXPIRY").toUpperCase()) {
      case "VOUCHER_EXPIRY":
        return "Voucher expiry credit";
      case "LOAN_APPROVAL":
        return "Loan approval credit";
      default:
        return source || "Voucher credit";
    }
  };

  return (
    <div className="bg-gray-100 shadow-lg rounded-lg">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Voucher Credits</h3>
          <p className="text-gray-600 text-sm">
            Unused voucher amounts transferred to your wallet
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 text-gray-500 hover:text-green-600 transition-colors"
          aria-label="Refresh voucher credits"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No voucher credits yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Unused voucher amounts will appear here once transferred
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center justify-between p-3 bg-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-gray-900 text-sm">
                      <span className="font-bold text-green-600">
                        +{transfer.amount.toLocaleString()} RWF
                      </span>{" "}
                      — {getSourceLabel(transfer.source)}
                    </p>
                    <p className="text-xs text-gray-700">
                      {new Date(transfer.transferredAt || transfer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}