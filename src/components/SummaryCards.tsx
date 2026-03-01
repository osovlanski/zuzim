'use client';

interface SummaryCardsProps {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

function formatAmount(amount: number): string {
  return `₪${Math.abs(amount).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface CardProps {
  label: string;
  amount: number;
  count: number;
  color: string;
}

function Card({ label, amount, count, color }: CardProps) {
  return (
    <div className={`rounded-2xl p-6 shadow-sm border ${color}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">{formatAmount(amount)}</p>
      <p className="mt-1 text-sm text-gray-400">{count} transactions</p>
    </div>
  );
}

export default function SummaryCards({ todayTotal, weekTotal, monthTotal, todayCount, weekCount, monthCount }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card label="Today" amount={todayTotal} count={todayCount} color="border-blue-100 bg-blue-50" />
      <Card label="This Week" amount={weekTotal} count={weekCount} color="border-purple-100 bg-purple-50" />
      <Card label="This Month" amount={monthTotal} count={monthCount} color="border-green-100 bg-green-50" />
    </div>
  );
}
