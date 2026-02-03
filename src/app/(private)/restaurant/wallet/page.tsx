"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, History, CreditCard, Smartphone } from "lucide-react";
import { TopUpModal } from "./_components/TopUpModal";
import { TransactionHistory } from "./_components/TransactionHistory";
import { CreateWalletCard } from "./_components/CreateWalletCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletPage() {
  const { wallet, getMyWallet, loading } = useWallet();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    getMyWallet().catch(() => {
      // Wallet doesn't exist, show create wallet option
    });
  }, [getMyWallet]);

  // Show create wallet if no wallet exists and not loading
  if (!loading && !wallet) {
    return <CreateWalletCard />;
  }

  if (loading && !wallet) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Wallet Management</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-40 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Wallet Management</h1>
        </div>
        <Badge variant={wallet?.isActive ? "default" : "destructive"}>
          {wallet?.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Wallet Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-600">
                {wallet?.balance?.toLocaleString() || 0} {wallet?.currency || "RWF"}
              </div>
              <Button 
                onClick={() => setShowTopUpModal(true)}
                className="w-full"
                disabled={!wallet?.isActive}
              >
                <Plus className="h-4 w-4 mr-2" />
                Top Up Wallet
              </Button>
            </div>
          </CardContent>
          
          </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowTransactions(true)}
              >
                <History className="h-4 w-4 mr-2" />
                View Transaction History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowTopUpModal(true)}
                disabled={!wallet?.isActive}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Top Up with Card
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowTopUpModal(true)}
                disabled={!wallet?.isActive}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Top Up with Mobile Money
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Info */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Wallet ID</p>
                <p className="font-mono text-sm">{wallet.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="font-semibold">{wallet.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm">{new Date(wallet.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="font-semibold">{wallet._count?.transactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <TopUpModal 
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
      />
      
      <TransactionHistory 
        isOpen={showTransactions}
        onClose={() => setShowTransactions(false)}
      />
    </div>
  );
}