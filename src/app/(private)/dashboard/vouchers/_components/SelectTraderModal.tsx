/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { traderService } from "@/app/services/traderService";
import { Loader2, User, Wallet } from "lucide-react";
import toast from "react-hot-toast";

interface SelectTraderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrader: (traderId: string) => void;
}

export function SelectTraderModal({ isOpen, onClose, onSelectTrader }: SelectTraderModalProps) {
  const [traders, setTraders] = useState<Array<{ id: string; name: string; availableBalance: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTraderId, setSelectedTraderId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetchAcceptedDelegations();
    }
  }, [isOpen]);

  const fetchAcceptedDelegations = async () => {
    setLoading(true);
    try {
      const response = await traderService.getAcceptedDelegations();
      setTraders(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch traders");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (!selectedTraderId) {
      toast.error("Please select a trader");
      return;
    }
    onSelectTrader(selectedTraderId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Trader</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : traders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No traders with accepted delegations found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {traders.map((trader) => (
                <div
                  key={trader.id}
                  onClick={() => setSelectedTraderId(trader.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTraderId === trader.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{trader.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Wallet className="h-3 w-3" />
                          <span>{trader.availableBalance.toLocaleString()} RWF</span>
                        </div>
                      </div>
                    </div>
                    {selectedTraderId === trader.id && (
                      <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedTraderId}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
