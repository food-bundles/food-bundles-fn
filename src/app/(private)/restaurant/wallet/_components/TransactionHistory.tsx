"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionHistory({ isOpen, onClose }: TransactionHistoryProps) {
  const { transactions, getTransactions, verifyTopUp, loading } = useWallet();
  const [page, setPage] = useState(1);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      getTransactions({ page: 1, limit: 20 });
      setPage(1);
    }
  }, [isOpen, getTransactions]);

  const handleVerifyTransaction = async (transactionId: string) => {
    setVerifyingId(transactionId);
    try {
      await verifyTopUp(transactionId);
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "PROCESSING": return "bg-yellow-100 text-yellow-800";
      case "FAILED": return "bg-red-100 text-red-800";
      case "PENDING": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TOP_UP": return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case "PAYMENT": return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      default: return <RefreshCw className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh]">
          <div className="space-y-3">
            {loading && transactions.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                          {transaction.paymentMethod && (
                            <p className="text-xs text-gray-500">
                              via {transaction.paymentMethod.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'TOP_UP' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'TOP_UP' ? '+' : '-'}
                          {transaction.amount.toLocaleString()} RWF
                        </p>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        
                        {transaction.status === 'PROCESSING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => handleVerifyTransaction(transaction.id)}
                            disabled={verifyingId === transaction.id}
                          >
                            {verifyingId === transaction.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                            Verify
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {transaction.flwTxRef && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Ref: {transaction.flwTxRef}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => getTransactions({ page: page + 1, limit: 20 })}
            disabled={loading}
          >
            Load More
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}