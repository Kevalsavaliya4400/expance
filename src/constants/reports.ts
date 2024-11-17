export const REPORT_TYPES = {
  EXPENSE_BY_CATEGORY: 'expense_by_category',
  INCOME_BY_CATEGORY: 'income_by_category',
  CASH_FLOW: 'cash_flow',
  SAVINGS_RATE: 'savings_rate',
  NET_WORTH: 'net_worth',
} as const;

export const TIME_PERIODS = {
  WEEK: '7d',
  MONTH: '30d',
  QUARTER: '90d',
  YEAR: '365d',
  ALL: 'all',
} as const;

export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  AREA: 'area',
} as const;