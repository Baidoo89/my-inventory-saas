import { DollarSign, Archive, TrendingUp } from 'lucide-react';

const iconMap = {
  revenue: DollarSign,
  stockValue: Archive,
  lowStock: TrendingUp,
};

type StatCardProps = {
  type: 'revenue' | 'stockValue' | 'lowStock';
  label: string;
  value: number;
  currency?: string;
};

export default function StatCard({ type, label, value, currency }: StatCardProps) {
  const Icon = iconMap[type];

  const formatValue = () => {
    if (currency) {
      return `${currency}${value.toFixed(2)}`;
    }
    return value;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 bg-${type === 'revenue' ? 'emerald' : type === 'stockValue' ? 'blue' : 'amber'}-100 text-${type === 'revenue' ? 'emerald' : type === 'stockValue' ? 'blue' : 'amber'}-600 rounded-xl`}>
          <Icon size={24} />
        </div>
        <p className="text-sm font-bold text-slate-500 uppercase">{label}</p>
      </div>
      <p className="text-3xl font-extrabold text-slate-900">
        {formatValue()}
        {type === 'lowStock' && <span className="text-sm text-slate-400 font-normal"> items</span>}
      </p>
    </div>
  );
}
