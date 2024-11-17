import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Reports() {
  const { currentUser } = useAuth();
  const { formatAmount } = useCurrency();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>
      <div className="card p-6">
        <p className="text-gray-600 dark:text-gray-400">Reports page coming soon...</p>
      </div>
    </div>
  );
}