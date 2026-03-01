'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryData {
  category: string;
  total: number;
  count: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Health: '#10b981',
  Entertainment: '#8b5cf6',
  Utilities: '#f59e0b',
  Other: '#6b7280',
};

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data available
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.category,
    value: Math.abs(item.total),
    count: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#6b7280'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => {
            const numValue = Number(value ?? 0);
            return `₪${numValue.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
