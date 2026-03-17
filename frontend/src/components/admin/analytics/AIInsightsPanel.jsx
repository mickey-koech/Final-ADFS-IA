import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, ScrollArea } from '@/components/ui';
import { Brain, AlertTriangle, TrendingUp, FileWarning, Target, Zap } from 'lucide-react';

const severityConfig = {
  low: { color: 'text-emerald-600', badge: 'success' },
  medium: { color: 'text-amber-600', badge: 'warning' },
  high: { color: 'text-rose-600', badge: 'destructive' },
};

const typeIcons = {
  anomaly: AlertTriangle,
  prediction: TrendingUp,
  recommendation: Target,
  warning: FileWarning,
};

export function AIInsightsPanel({ insights }) {
  return (
    <Card className="border-none bg-gradient-to-br from-white/80 to-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4 text-blue-600" />
          Neural Intelligence Hub
          <Zap className="w-3 h-3 text-amber-500 ml-auto animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Awaiting system patterns...</p>
              </div>
            ) : (
              insights.map((insight) => {
                const Icon = typeIcons[insight.type] || Target;
                const config = severityConfig[insight.severity] || severityConfig.medium;
                
                return (
                  <div
                    key={insight.id}
                    className="p-5 rounded-2xl bg-white border border-slate-50 hover:border-blue-100 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${config.color.replace('text', 'bg')}/10 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-slate-900 leading-tight">
                            {insight.title}
                          </h4>
                          <Badge variant={config.badge}>
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Target className="w-3 h-3" />
                            <span>Conf: {insight.confidence}%</span>
                          </div>
                          <div className="h-1.5 flex-1 bg-slate-50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
