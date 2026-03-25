import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { 
  Users, 
  ShieldAlert, 
  Building2, 
  Clock, 
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Modular Components
import { DashboardWidgets } from '../../components/admin/DashboardWidgets';
import { PDFExport } from '../../components/admin/PDFExport';
import { RealTimeNotifications } from '../../components/admin/RealTimeNotifications';
import { UploadFrequencyChart } from '../../components/admin/analytics/UploadFrequencyChart';
import { FileTypeDistribution } from '../../components/admin/analytics/FileTypeDistribution';
import { DepartmentActivityChart } from '../../components/admin/analytics/DepartmentActivityChart';
import { AIInsightsPanel } from '../../components/admin/analytics/AIInsightsPanel';
import { RecentUploadsTable } from '../../components/admin/analytics/RecentUploadsTable';
import { ChatAnalytics } from '../../components/admin/analytics/ChatAnalytics';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '../../components/ui';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [adminStats, setAdminStats] = useState({
    pendingUsers: 0,
    activeAlerts: 0,
    totalDepartments: 0
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersRes, alertsRes, deptsRes, analyticsRes] = await Promise.all([
        adminService.getPendingUsers(),
        adminService.getAlerts(),
        adminService.getDepartments(),
        adminService.getAnalytics()
      ]);
      
      setPendingUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
      setAdminStats({
        pendingUsers: usersRes.data.length,
        activeAlerts: alertsRes.data.length,
        totalDepartments: deptsRes.data.length,
        totalUsers: 156, // Example static for now or add to API
        totalFiles: analyticsRes.data?.total_files || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error('Partial data load failure');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">
      {/* Premium Header Container */}
      <Card className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 p-10 bg-white/40 border-white/60 backdrop-blur-3xl shadow-2xl shadow-blue-500/5 rounded-[40px]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldAlert className="w-3.5 h-3.5" />
            Strategic Oversight Active
          </div>
          <h1 className="text-6xl font-[1000] text-slate-900 tracking-[-0.04em] leading-none">
            Institutional <span className="text-blue-600">Intelligence</span>
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl">
            Real-time analytics and administrative control for the school's digital archive ecosystem.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <PDFExport stats={adminStats} />
          <div className="h-14 w-[1px] bg-slate-200 mx-2 hidden xl:block"></div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Node Status: Optimal
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Last Sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </Card>

      {/* Primary KPI Grid */}
      <DashboardWidgets stats={adminStats} />

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10">
        {/* Left Column: Intelligence Feed & Activity (8 cols) */}
        <div className="2xl:col-span-8 space-y-10">
          {/* Historical Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <UploadFrequencyChart data={analytics?.upload_activity || []} />
            <FileTypeDistribution data={analytics?.files_by_type || []} />
          </div>

          {/* Detailed Activity Tracking */}
          <RecentUploadsTable uploads={analytics?.recent_uploads || []} />
          
          {/* Departmental Comparison */}
          <DepartmentActivityChart data={analytics?.department_activity || []} />

          {/* Action Auditing */}
          <ChatAnalytics data={analytics?.action_analytics} />
        </div>

        {/* Right Column: Alerts & Approvals (4 cols) */}
        <div className="2xl:col-span-4 space-y-10">
          <RealTimeNotifications />
          
          <AIInsightsPanel insights={analytics?.ai_insights || []} />

          {/* Quick User Approval Queue */}
          <Card className="bg-white/80 backdrop-blur-xl rounded-[40px] border-white shadow-xl overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-[1000] uppercase tracking-tight">Access Requests</CardTitle>
                <p className="text-xs font-bold text-slate-400">Identity verification required</p>
              </div>
              <Badge variant="outline">{pendingUsers.length}</Badge>
            </CardHeader>
            <CardContent className="p-8">
              {pendingUsers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Queue Empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingUsers.map(user => (
                    <div key={user.id} className="p-6 rounded-[32px] bg-slate-50/50 border border-slate-50 flex items-center justify-between hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{user.username}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{user.role}</p>
                        </div>
                      </div>
                      <Button 
                        variant="default"
                        size="icon"
                        onClick={() => adminService.approveUser(user.id).then(() => { toast.success('Approved'); fetchAdminData(); })}
                        className="shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95"
                      >
                         <TrendingUp className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

