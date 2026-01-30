import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

interface DepositFormProps {
  amount: string;
  paymentMethodId: string;
  phoneNumber: string;
  isLoading: boolean;
  paymentMethods: PaymentMethod[];
  onAmountChange: (amount: string) => void;
  onPaymentMethodChange: (methodId: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function DepositForm({
  amount,
  paymentMethodId,
  phoneNumber,
  isLoading,
  paymentMethods,
  onAmountChange,
  onPaymentMethodChange,
  onPhoneNumberChange,
  onCancel,
  onSubmit
}: DepositFormProps) {
  const selectedMethod = paymentMethods.find(method => method.id === paymentMethodId);
  
  return (
    <div className="space-y-4 mt-6">
      <div>
        <label className="block text-gray-800 text-sm mb-2">Amount (RWF)</label>
        <input
          type="number"
          placeholder="0000"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 text-gray-800"
        />
      </div>
      
      <div>
        <Label className="block text-gray-800 text-sm mb-2">Payment Method</Label>
        <Select
          value={paymentMethodId}
          onValueChange={onPaymentMethodChange}
        >
          <SelectTrigger className={`w-full ${
            paymentMethods.find(m => m.id === paymentMethodId)?.name === "MOBILE_MONEY" ? "text-green-600" :
            paymentMethods.find(m => m.id === paymentMethodId)?.name === "CARD" ? "text-purple-600" : ""
          }`}>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  method.name === 'MOBILE_MONEY' ? 'bg-green-100 text-green-800' :
                  method.name === 'CARD' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {method.name === 'MOBILE_MONEY' ? 'MoMo' : 
                   method.name === 'CARD' ? 'Card' : method.description}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedMethod?.name === "MOBILE_MONEY" && (
        <div>
          <label className="block text-gray-800 text-sm mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="250788123456"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 text-gray-800"
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-green-100 hover:bg-green-200 rounded"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 font-semibold text-white py-2 px-4 rounded flex items-center justify-center"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Deposit Now
        </button>
      </div>
    </div>
  );
}