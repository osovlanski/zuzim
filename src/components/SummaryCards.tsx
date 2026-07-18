'use client';

interface SummaryCardsProps {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  incomeTotal: number;
  spendTotal: number;
}

function formatAmount(amount: number): string {
  return `₪${Math.abs(amount).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface CardProps {
  label: string;
  amount: number;
  count: number;
  icon: string;
  accentFrom: string;
  accentTo: string;
  iconBg: string;
}

function Card({ label, amount, count, icon, accentFrom, accentTo, iconBg }: CardProps) {
  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-6">
      {/* Subtle gradient accent in the corner */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15 blur-xl"
        style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatAmount(amount)}</p>
          <p className="mt-1 text-xs text-slate-500">{count} transactions</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({ todayTotal, weekTotal, monthTotal, todayCount, weekCount, monthCount, incomeTotal, spendTotal }: SummaryCardsProps) {
  const netTotal = incomeTotal + spendTotal;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Today"
        amount={todayTotal}
        count={todayCount}
        icon="&#x2600;&#xFE0F;"
        accentFrom="#6366f1"
        accentTo="#8b5cf6"
        iconBg="rgba(99,102,241,0.2)"
      />
      <Card
        label="This Week"
        amount={weekTotal}
        count={weekCount}
        icon="&#x1F4C5;"
        accentFrom="#ec4899"
        accentTo="#f97316"
        iconBg="rgba(236,72,153,0.2)"
      />
      <Card
        label="Spent This Month"
        amount={monthTotal}
        count={monthCount}
        icon="&#x1F4B0;"
        accentFrom="#10b981"
        accentTo="#3b82f6"
        iconBg="rgba(16,185,129,0.2)"
      />
      <Card
        label={netTotal >= 0 ? 'Net This Month' : 'Net This Month (deficit)'}
        amount={netTotal}
        count={monthCount}
        icon={netTotal >= 0 ? '\u{1F4C8}' : '\u{1F4C9}'}
        accentFrom={netTotal >= 0 ? '#22c55e' : '#ef4444'}
        accentTo={netTotal >= 0 ? '#3b82f6' : '#f97316'}
        iconBg={netTotal >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}
      />
    </div>
  );
}
