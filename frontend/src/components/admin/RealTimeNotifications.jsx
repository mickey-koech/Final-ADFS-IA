import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, ScrollArea, Button } from '@/components/ui';
import { Bell, AlertTriangle, ShieldAlert, Activity, X, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { adminService } from '@/services/api';

export function RealTimeNotifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // In a production app, we would use WebSockets or SSE from the FastAPI backend here.
    // For now, we'll poll every 30 seconds to simulate real-time updates.
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await adminService.getAlerts();
      setAlerts(res.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await adminService.resolveAlert(alertId);
      toast.success('Security alert resolved');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'mass_deletion': return <AlertTriangle className="w-4 h-4" />;
      case 'unauthorized_access': return <ShieldAlert className="w-4 h-4" />;
      case 'mass_upload': return <Activity className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <Card className="border-none bg-gradient-to-br from-white/80 to-rose-50/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-900 font-black tracking-tight">
            <Bell className="w-4 h-4 text-blue-600 animate-pulse" />
            Security Feed
          </div>
          {unresolvedCount > 0 && (
            <Badge variant="destructive" className="animate-bounce">
              {unresolvedCount} Warnings
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-400 opacity-30" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">System Integrity Validated</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    alert.resolved
                      ? 'bg-slate-50 border-slate-100 opacity-50'
                      : 'bg-white border-blue-50 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl ${
                        alert.severity === 'critical' ? 'bg-rose-100 text-rose-600' :
                        alert.severity === 'high' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 text-[10px]">
                          <span className={`font-black uppercase tracking-widest ${
                            alert.severity === 'critical' ? 'text-rose-600' : 'text-slate-400'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-slate-300 font-bold">•</span>
                          <span className="text-slate-400 font-bold">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="font-black text-slate-900 uppercase tracking-tight text-sm">
                          {alert.alert_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
