import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "TOP_UP":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "PAYMENT":
        return <ArrowDownRight className="h-4 w-4 text-red-800" />;
      case "REFUND":
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClass = 
      status.toLowerCase() === "completed" ? "bg-green-100 text-green-800" :
      status.toLowerCase() === "pending" ? "bg-yellow-100 text-yellow-800" :
      status.toLowerCase() === "failed" ? "bg-red-100 text-red-800" :
      "bg-gray-100 text-gray-800";
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-gray-100 shadow-lg rounded-lg">
      <div className="text-center p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <p className="text-gray-600">Your latest account activity</p>
      </div>
      <div className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="text-gray-900 text-sm">
                      {transaction.type === "TOP_UP" ? "You have deposited " : "You have made a payment of "}
                      <span className={`font-bold text-sm ${transaction.amount > 0 ? "text-green-600" : "text-red-800"}`}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()} RWF
                      </span>
                      {transaction.type !== "TOP_UP" && (
                        <span> for <span className="text-gray-800 font-medium">{transaction.description}</span></span>
                      )}
                    </p>
                    <p className="text-xs text-gray-700">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}