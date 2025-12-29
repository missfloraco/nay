import React from 'react';
import { StatCardProps } from '@/core/models/index';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  trendLabel,
  colorFrom = 'from-blue-600',
  colorTo = 'to-blue-400'
}) => {
  const isPositive = trend >= 0;

  return (
    <div className="premium-card p-8 group transition-all duration-500">
      {/* Background Decorative Gradient */}
      <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${colorFrom} ${colorTo} opacity-[0.03] dark:opacity-[0.07] rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-700`}></div>

      <div className="relative flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorFrom} ${colorTo} text-white shadow-xl shadow-${colorFrom.replace('from-', '')}/20 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div className={`
          flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter
          ${isPositive ? 'bg-success/10 text-success' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'}
        `}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(trend)}%
        </div>
      </div>

      <div className="relative">
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{title}</p>
        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-2 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${colorFrom} ${colorTo}`}></span>
          {trendLabel}
        </p>
      </div>
    </div>
  );
};
