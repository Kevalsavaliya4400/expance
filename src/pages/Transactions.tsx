import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Transactions() {
  const { currentUser } = useAuth();
  const { formatAmount } = useCurrency();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
      </div>
      <div className="card p-6">
        <p className="text-gray-600 dark:text-gray-400">Transactions page coming soon...</p>
      </div>
    </div>
  );
}