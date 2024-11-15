import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatAmount: (amount: number, fromCurrency?: string) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Exchange rates relative to USD (1 USD = X currency)
const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.42,
  AUD: 1.52,
  CAD: 1.35,
  CHF: 0.88,
  CNY: 7.19,
  INR: 83.12,
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadUserCurrency();
    }
  }, [currentUser]);

  const loadUserCurrency = async () => {
    if (!currentUser) return;

    try {
      const userSettingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
      const settingsDoc = await getDoc(userSettingsRef);
      
      if (settingsDoc.exists()) {
        const { currency } = settingsDoc.data();
        if (currency) {
          setCurrencyState(currency);
        }
      }
    } catch (error) {
      console.error('Error loading user currency:', error);
    }
  };

  const setCurrency = async (newCurrency: string) => {
    if (!currentUser) return;

    try {
      const userSettingsRef = doc(db, 'users', currentUser.uid, 'settings', 'preferences');
      await setDoc(userSettingsRef, { currency: newCurrency }, { merge: true });
      setCurrencyState(newCurrency);
    } catch (error) {
      console.error('Error saving currency preference:', error);
      throw error;
    }
  };

  // Convert amount between currencies
  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) return amount;

    // Convert to USD first (base currency)
    const amountInUSD = amount / exchangeRates[fromCurrency];
    // Then convert from USD to target currency
    return amountInUSD * exchangeRates[toCurrency];
  };

  // Format amount with proper currency symbol and conversion
  const formatAmount = (amount: number, fromCurrency?: string) => {
    let finalAmount = amount;
    
    // If a source currency is provided and it's different from the target currency,
    // convert the amount
    if (fromCurrency && fromCurrency !== currency) {
      finalAmount = convertAmount(amount, fromCurrency, currency);
    }

    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(finalAmount);
  };

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      setCurrency, 
      formatAmount,
      convertAmount 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}