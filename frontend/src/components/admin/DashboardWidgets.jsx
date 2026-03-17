import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Progress } from '@/components/ui';
import { Users, UserCheck, UserX, Building2, FileText, TrendingUp, Activity } from 'lucide-react';

export function DashboardWidgets({ stats, recentActivity = [], departmentStats = [] }) {
  const approvalRate = stats.totalUsers > 0 
    ? Math.round((stats.approvedUsers / stats.totalUsers) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Pending Approval', value: stats.pendingUsers, icon: UserX, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: 'Active Accounts', value: stats.approvedUsers, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Departments', value: stats.departments, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
        ].map((stat, i) => (
          <Card key={i} className={`hover:shadow-lg transition-all duration-300 border-none`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval Rate & Files */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              User Growth & Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">Approval Rate</span>
                <span className="font-black text-blue-600">{approvalRate}%</span>
              </div>
              <Progress value={approvalRate} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Approved</p>
                <p className="text-xl font-black text-emerald-600">{stats.approvedUsers}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending</p>
                <p className="text-xl font-black text-amber-600">{stats.pendingUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Repository Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center py-8">
            <div className="text-5xl font-black text-slate-900 tracking-tighter">{stats.totalFiles}</div>
            <p className="text-slate-500 font-medium mt-2">Total institutional files archived</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Dept Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              Global Audit Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No recent audit logs</p>
                </div>
              ) : (
                recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between group">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{activity.action}</p>
                      <p className="text-[10px] font-medium text-slate-400">{activity.user_email}</p>
                    </div>
                    <Badge variant="outline">{new Date(activity.timestamp).toLocaleDateString()}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Department Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {departmentStats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Awaiting department data</p>
                </div>
              ) : (
                departmentStats.slice(0, 4).map((dept, idx) => {
                  const percentage = stats.approvedUsers > 0 
                    ? Math.round((dept.userCount / stats.approvedUsers) * 100) 
                    : 0;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-900 uppercase tracking-tight">{dept.name}</span>
                        <span className="text-slate-500 font-bold">{dept.userCount} Members</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
