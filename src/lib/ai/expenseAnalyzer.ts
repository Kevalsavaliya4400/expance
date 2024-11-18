import * as tf from '@tensorflow/tfjs';
import regression from 'regression';
import { Transaction } from '../../types';

export class ExpenseAnalyzer {
  private transactions: Transaction[];

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  // Predict future expenses based on historical data
  async predictFutureExpenses(daysAhead: number = 30): Promise<number> {
    const expenseData = this.transactions
      .filter(t => t.type === 'expense')
      .map((t, i) => [i, t.amount]);

    const result = regression.linear(expenseData);
    return result.predict(expenseData.length + daysAhead)[1];
  }

  // Analyze spending patterns
  analyzeSpendingPatterns() {
    const categoryTotals = this.transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
      isHighSpending: (amount / total) > 0.3 // Flag if category takes >30% of spending
    }));
  }

  // Detect unusual transactions
  detectAnomalies(): Transaction[] {
    const amounts = this.transactions.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / amounts.length
    );

    return this.transactions.filter(t => 
      Math.abs(t.amount - mean) > 2 * stdDev // Flag transactions > 2 standard deviations
    );
  }

  // Generate savings recommendations
  generateSavingsRecommendations() {
    const patterns = this.analyzeSpendingPatterns();
    const recommendations = [];

    // Analyze high-spending categories
    patterns.forEach(({ category, percentage }) => {
      if (percentage > 30) {
        recommendations.push({
          category,
          message: `Consider reducing spending in ${category} as it represents ${percentage.toFixed(1)}% of your expenses`,
          priority: 'high'
        });
      }
    });

    // Analyze transaction frequency
    const frequentSmallTransactions = this.transactions.filter(t => 
      t.type === 'expense' && t.amount < 10
    ).length;

    if (frequentSmallTransactions > this.transactions.length * 0.2) {
      recommendations.push({
        category: 'Small Expenses',
        message: 'You have many small transactions. Consider bundling purchases to reduce impulse spending.',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  // Analyze income stability
  analyzeIncomeStability() {
    const incomes = this.transactions
      .filter(t => t.type === 'income')
      .map(t => t.amount);

    if (incomes.length < 2) return null;

    const variability = this.calculateCoeffientOfVariation(incomes);
    
    return {
      stable: variability < 0.15,
      variability: variability * 100,
      trend: this.calculateTrend(incomes)
    };
  }

  private calculateCoeffientOfVariation(values: number[]) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
    );
    return stdDev / mean;
  }

  private calculateTrend(values: number[]) {
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const percentageChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
    
    if (percentageChange > 5) return 'increasing';
    if (percentageChange < -5) return 'decreasing';
    return 'stable';
  }
}