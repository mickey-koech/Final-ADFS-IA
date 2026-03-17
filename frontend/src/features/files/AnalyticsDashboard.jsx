import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, FileText, HardDrive, Users, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/');
      setData(res.data);
    } catch {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading analytics...</p>
      </div>
    </div>
  );

  const totalFiles = data?.total_files || 0;
  const totalFolders = data?.total_folders || 0;
  const totalUsers = data?.total_users || 0;
  const storageUsed = data?.total_size_kb || 0;

  // Build chart data from multidimensional arrays
  const filesByType = Object.entries(data?.files_by_type || {}).map(([name, value]) => ({ name, value }));
  const filesByMonth = data?.files_by_month || [];
  const uploadActivity = data?.upload_activity || filesByMonth;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">System-wide usage statistics and file activity</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Files', value: totalFiles, icon: FileText, color: 'blue', sub: 'Indexed records' },
          { label: 'Folders', value: totalFolders, icon: HardDrive, color: 'purple', sub: 'Campus organization' },
          { label: 'Staff Accounts', value: totalUsers, icon: Users, color: 'green', sub: 'Verified users' },
          { label: 'Storage Used', value: `${(storageUsed / 1024).toFixed(1)} MB`, icon: TrendingUp, color: 'orange', sub: 'Current archives' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-600">{label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${color}-50`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Type Breakdown (Pie) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Distribution by Format</h3>
          <p className="text-xs font-medium text-slate-400 mb-6 uppercase tracking-wider">File type breakdown</p>
          {filesByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={filesByType} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {filesByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No file data yet</div>
          )}
        </div>

        {/* Upload Activity (Bar) */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">System Volume Trend</h3>
          <p className="text-xs font-medium text-slate-400 mb-6 uppercase tracking-wider">Institutional growth</p>
          {uploadActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={uploadActivity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Upload some files to see activity</div>
          )}
        </div>
      </div>

      {/* Audit Log Trail */}
      {data?.recent_actions && data.recent_actions.length > 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Recent System Activity</h3>
          <div className="space-y-2">
            {data.recent_actions.slice(0, 8).map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-slate-50 last:border-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                  log.action === 'UPLOAD' ? 'bg-green-50 text-green-600' :
                  log.action === 'LOGIN' ? 'bg-blue-50 text-blue-600' :
                  'bg-slate-100 text-slate-600'
                }`}>{log.action}</span>
                <span className="text-slate-600 flex-1">{log.target_type} #{log.target_id}</span>
                <span className="text-slate-400 text-xs">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
