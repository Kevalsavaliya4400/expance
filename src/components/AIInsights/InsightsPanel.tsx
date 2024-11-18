import { useState, useEffect } from 'react';
import { ExpenseAnalyzer } from '../../lib/ai/expenseAnalyzer';
import InsightCard from './InsightCard';
import { useCurrency } from '../../contexts/CurrencyContext';

interface InsightsPanelProps {
  transactions: any[];
}

export default function InsightsPanel({ transactions }: InsightsPanelProps) {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    if (transactions.length === 0) {
      setLoading(false);
      return;
    }

    generateInsights();
  }, [transactions]);

  const generateInsights = async () => {
    try {
      const analyzer = new ExpenseAnalyzer(transactions);

      // Get spending patterns
      const patterns = analyzer.analyzeSpendingPatterns();
      const highSpendingCategories = patterns.filter(p => p.isHighSpending);

      // Get anomalies
      const anomalies = analyzer.detectAnomalies();

      // Get savings recommendations
      const recommendations = analyzer.generateSavingsRecommendations();

      // Get income stability analysis
      const incomeStability = analyzer.analyzeIncomeStability();

      // Predict future expenses
      const predictedExpense = await analyzer.predictFutureExpenses(30);

      const newInsights = [];

      // Add high spending insights
      highSpendingCategories.forEach(({ category, percentage }) => {
        newInsights.push({
          title: `High Spending in ${category}`,
          message: `This category represents ${percentage.toFixed(1)}% of your total expenses. Consider setting a budget.`,
          type: 'warning'
        });
      });

      // Add anomaly insights
      if (anomalies.length > 0) {
        newInsights.push({
          title: 'Unusual Transactions Detected',
          message: `Found ${anomalies.length} transactions that are significantly higher than your usual spending.`,
          type: 'info',
          action: {
            label: 'View Details',
            onClick: () => {} // Implement view details functionality
          }
        });
      }

      // Add income stability insight
      if (incomeStability) {
        const { stable, trend, variability } = incomeStability;
        newInsights.push({
          title: 'Income Analysis',
          message: `Your income is ${stable ? 'stable' : 'variable'} with ${variability.toFixed(1)}% variability. Trend is ${trend}.`,
          type: stable ? 'success' : 'warning'
        });
      }

      // Add future prediction insight
      newInsights.push({
        title: 'Expense Prediction',
        message: `Based on your spending patterns, predicted expenses for next month: ${formatAmount(predictedExpense)}`,
        type: 'info'
      });

      // Add top recommendations
      recommendations.forEach(rec => {
        newInsights.push({
          title: `Savings Opportunity: ${rec.category}`,
          message: rec.message,
          type: rec.priority === 'high' ? 'warning' : 'info'
        });
      });

      setInsights(newInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Not enough data to generate insights yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <InsightCard key={index} {...insight} />
      ))}
    </div>
  );
}