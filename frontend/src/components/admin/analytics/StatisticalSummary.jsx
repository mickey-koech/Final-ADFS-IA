import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatisticalSummary({ stats }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const colorClass = {
          primary: 'text-blue-600 bg-blue-50 border-blue-100',
          secondary: 'text-indigo-600 bg-indigo-50 border-indigo-100',
          warning: 'text-amber-600 bg-amber-50 border-amber-100',
          success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
          accent: 'text-purple-600 bg-purple-50 border-purple-100',
        }[stat.color] || 'text-slate-600 bg-slate-50 border-slate-100';

        const rawColor = {
          primary: 'blue',
          secondary: 'indigo',
          warning: 'amber',
          success: 'emerald',
          accent: 'purple',
        }[stat.color] || 'slate';

        return (
          <Card key={idx} className="border-none group hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${colorClass.split(' ')[1]} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
                </div>
                {stat.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
                    stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">{stat.title}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
