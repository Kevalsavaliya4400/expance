interface CategorySelectProps {
  type: 'income' | 'expense';
  value: string;
  onChange: (category: string) => void;
}

const categories = {
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Other Income'
  ],
  expense: [
    'Food & Dining',
    'Shopping',
    'Transport',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Travel',
    'Other'
  ]
};

export default function CategorySelect({ type, value, onChange }: CategorySelectProps) {
  return (
    <div>
      <label htmlFor="category" className="block text-sm font-medium mb-2">
        Category
      </label>
      <select
        id="category"
        required
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select a category</option>
        {categories[type].map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  );
}