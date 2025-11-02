"use client";

import { useState } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CreateWalletCard() {
  const { createWallet, loading } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async () => {
    setIsCreating(true);
    try {
      await createWallet({ currency: "RWF" });
      toast.success("Wallet created successfully!");
    } catch (error) {
      console.error("Create wallet error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Wallet className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Wallet Management</h1>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Create Your Wallet</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You don't have a wallet yet. Create one to start managing your funds and making payments.
          </p>
          <Button 
            onClick={handleCreateWallet}
            disabled={loading || isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Wallet...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Wallet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}