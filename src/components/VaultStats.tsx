import React from 'react';
import { TrendingUp, Coins, Shield, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useContract } from '../hooks/useContract';

export function VaultStats() {
  const { ankrBalance } = useStore();
  const { cashBalance, totalAssets, totalCashSupply, isPaused } = useContract();

  const formatNumber = (num: string, decimals = 4) => {
    const parsed = parseFloat(num);
    if (parsed === 0) return '0';
    if (parsed < 0.0001) return '<0.0001';
    return parsed.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals 
    });
  };

  const stats = [
    {
      label: 'Total Assets',
      value: formatNumber(totalAssets),
      unit: 'ANKR',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'CASH Supply',
      value: formatNumber(totalCashSupply),
      unit: 'CASH',
      icon: Coins,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Your ANKR',
      value: formatNumber(ankrBalance),
      unit: 'ANKR',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Your CASH',
      value: formatNumber(cashBalance),
      unit: 'CASH',
      icon: Shield,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass rounded-2xl p-4 sm:p-5 card-hover animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'transparent', backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
              <stat.icon className={`w-5 h-5`} style={{ 
                background: `linear-gradient(135deg, ${stat.color.includes('blue') ? '#3b82f6, #06b6d4' : stat.color.includes('purple') ? '#a855f7, #ec4899' : stat.color.includes('amber') ? '#f59e0b, #f97316' : '#10b981, #14b8a6'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }} />
            </div>
            {stat.label === 'Total Assets' && isPaused && (
              <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-medium">
                Paused
              </span>
            )}
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mb-1">{stat.label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-sm text-slate-500">{stat.unit}</span>
          </div>
        </div>
      ))}

      {/* 1:1 Peg Badge */}
      <div className="col-span-2 lg:col-span-4 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-slate-300">
            1:1 Peg Active
          </span>
          <span className="text-xs text-slate-500">(Testnet Mode)</span>
        </div>
      </div>
    </div>
  );
}
