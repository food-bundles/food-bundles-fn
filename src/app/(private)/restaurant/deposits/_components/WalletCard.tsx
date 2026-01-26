import { Wallet, Plus } from "lucide-react";

interface WalletCardProps {
  balance: number;
  isActive: boolean;
  showDepositForm: boolean;
  onShowDepositForm: () => void;
  children?: React.ReactNode;
}

export function WalletCard({ balance, isActive, showDepositForm, onShowDepositForm, children }: WalletCardProps) {
  return (
    <div className="bg-white border border-yellow-200 shadow-lg rounded-lg p-8">
      <div className="text-center mb-4">
        <Wallet className="h-12 w-12 mx-auto mb-3 text-green-600" />
        <h2 className="text-lg font-semibold mb-1 text-gray-800">
          Account Balance
        </h2>
        <p className="text-gray-600 text-sm">Your current prepaid balance</p>
      </div>

      <div className="text-center mb-4">
        <div className="text-xl font-bold mb-2 text-gray-900 font-mono">
          {balance?.toLocaleString() || "0"} RWF
        </div>
        <p className="text-gray-600 text-sm">
          Account Status{" "}
          {isActive ? (
            <span className="text-green-600 font-medium">Active</span>
          ) : (
            <span className="text-red-600 font-medium">Inactive</span>
          )}
        </p>
      </div>

      {!showDepositForm ? (
        <button
          onClick={onShowDepositForm}
          className="w-full bg-yellow-500 text-white hover:bg-yellow-600 font-semibold py-2 px-4 rounded flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Deposit Funds
        </button>
      ) : (
        children
      )}
    </div>
  );
}