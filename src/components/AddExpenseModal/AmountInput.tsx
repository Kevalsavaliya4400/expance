interface AmountInputProps {
  amount: string;
  currency: string;
  onChange: (amount: string) => void;
}

export default function AmountInput({ amount, currency, onChange }: AmountInputProps) {
  return (
    <div>
      <label htmlFor="amount" className="block text-sm font-medium mb-2">
        Amount ({currency})
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {currency}
        </span>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="input pl-12"
          value={amount}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );
}