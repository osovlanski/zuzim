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
  Income: '#22c55e',
  Other: '#6b7280',
};

const CATEGORY_ICONS: Record<string, string> = {
  Food: '\u{1F354}',
  Transport: '\u{1F697}',
  Shopping: '\u{1F6CD}',
  Health: '\u{1F48A}',
  Entertainment: '\u{1F3AC}',
  Utilities: '\u26A1',
  Income: '\u{1F4B5}',
  Other: '\u{1F4E6}',
};

interface TooltipPayload {
  name: string;
  value: number;
  payload: { count: number };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const formattedAmount = `\u20AA${item.value.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <div className="glass-card rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="font-semibold text-white">{item.name}</p>
      <p className="text-slate-300">{formattedAmount}</p>
      <p className="text-slate-500 text-xs">{item.payload.count} transactions</p>
    </div>
  );
}

interface LegendPayload {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: LegendPayload[];
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {payload.map(entry => (
        <div key={entry.value} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-400">
            {CATEGORY_ICONS[entry.value] ?? ''} {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-600">
        No data yet
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
          cy="45%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#6b7280'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
