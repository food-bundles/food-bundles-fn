/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { voucherService } from "@/app/services/voucherService";
import { useRestaurants } from "@/app/contexts/RestaurantContext";
import toast from "react-hot-toast";

interface IssueVoucherCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Pre-fill from a card request */
  preselectedRestaurant?: { id: string; name: string } | null;
}

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function IssueVoucherCardModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedRestaurant,
}: IssueVoucherCardModalProps) {
  const { getAllRestaurants } = useRestaurants();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [comboOpen, setComboOpen] = useState(false);
  const [loanLimit, setLoanLimit] = useState("500000");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFetching(true);
    getAllRestaurants({ limit: 200 })
      .then((res: any) => {
        if (res?.success) setRestaurants(res.data ?? []);
      })
      .finally(() => setFetching(false));
  }, [isOpen, getAllRestaurants]);

  // Pre-select restaurant if passed in
  useEffect(() => {
    if (preselectedRestaurant && restaurants.length > 0) {
      const found = restaurants.find((r) => r.id === preselectedRestaurant.id);
      if (found) setSelected(found);
    }
  }, [preselectedRestaurant, restaurants]);

  const handleIssue = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await voucherService.issueVoucherCard({
        restaurantId: selected.id,
        loanLimit: parseFloat(loanLimit),
      });
      toast.success(`Voucher card issued to ${selected.name}`);
      setSelected(null);
      setLoanLimit("500000");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to issue voucher card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            Issue Voucher Card
          </DialogTitle>
          <DialogDescription>
            Issue a permanent PAN voucher card to a restaurant. The card number is
            generated automatically and never changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Restaurant picker */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Restaurant *{" "}
              {fetching && <span className="text-gray-400 font-normal">(loading...)</span>}
            </label>
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-10 text-sm"
                >
                  {selected ? `${selected.name}` : "Select restaurant..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search restaurants..." />
                  <CommandList>
                    <CommandEmpty>No restaurant found.</CommandEmpty>
                    <CommandGroup>
                      {restaurants.map((r) => (
                        <CommandItem
                          key={r.id}
                          value={`${r.name} ${r.phone ?? ""} ${r.email}`}
                          onSelect={() => {
                            setSelected(r);
                            setComboOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selected?.id === r.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <p className="font-medium text-sm">{r.name}</p>
                            <p className="text-xs text-gray-500">{r.phone} · {r.email}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Loan limit */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Initial Loan Limit (RWF)
            </label>
            <Input
              type="number"
              value={loanLimit}
              onChange={(e) => setLoanLimit(e.target.value)}
              placeholder="500000"
              className="h-10 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Default is 500,000 RWF — configurable per restaurant
            </p>
          </div>

          {/* Info box */}
          {selected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-green-800">Card will be issued to:</p>
              <p className="text-green-700 mt-0.5">{selected.name}</p>
              <p className="text-green-600 text-xs mt-1">
                A unique 16-digit PAN will be generated and permanently assigned.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleIssue}
              disabled={!selected || loading || !loanLimit}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {loading ? "Issuing..." : "Issue Card"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
