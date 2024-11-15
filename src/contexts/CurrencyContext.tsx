import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr',
  CNY: '¥',
  INR: '₹',
};

const exchangeRates: { [key: string]: number } = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.42,
  AUD: 1.35,
  CAD: 1.25,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.5,
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

  const formatAmount = (amount: number) => {
    const rate = exchangeRates[currency] || 1;
    const convertedAmount = amount * rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}