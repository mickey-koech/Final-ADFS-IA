import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { MessageCircle, Users, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '@/services/api';

const COLORS = [
  '#2563eb', // blue
  '#4f46e5', // indigo
  '#7c3aed', // purple
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
];

export function ChatAnalytics({ data = null }) {
  // If data is provided externally, use it, otherwise show placeholder state
  // In a real scenario, this would fetch from adminService.getChatAnalytics()
  const [stats, setStats] = useState(data || {
    totalMessages: 1240,
    activeDepartments: 5,
    activeUsers: 48,
    todayMessages: 156,
    departmentStats: [
      { department: 'Administration', count: 450, color: COLORS[0] },
      { department: 'Finance', count: 320, color: COLORS[1] },
      { department: 'Registrar', count: 280, color: COLORS[2] },
      { department: 'Academic', count: 120, color: COLORS[3] },
      { department: 'HR', count: 70, color: COLORS[4] },
    ],
    dailyActivity: [
      { date: 'Mon', messages: 120 },
      { date: 'Tue', messages: 150 },
      { date: 'Wed', messages: 180 },
      { date: 'Thu', messages: 140 },
      { date: 'Fri', messages: 210 },
      { date: 'Sat', messages: 90 },
      { date: 'Sun', messages: 60 },
    ],
    topUsers: [
      { id: '1', name: 'John Doe', messageCount: 145, department: 'Administration' },
      { id: '2', name: 'Jane Smith', messageCount: 120, department: 'Finance' },
      { id: '3', name: 'Robert Brown', messageCount: 98, department: 'Registrar' },
    ]
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Total Logs', value: stats.totalMessages, icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Depts', value: stats.activeDepartments, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Power Users', value: stats.activeUsers, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Volume/24h', value: stats.todayMessages, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((item, i) => (
          <Card key={i} className="border-none hover:scale-105 transition-transform duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${item.bg}`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="text-2xl font-black text-slate-900">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              Volume by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="department" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '16px',
                    }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Temporal Activity Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '16px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#7c3aed' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie + List */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-purple-600" />
              Usage Concentration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.departmentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="department"
                  >
                    {stats.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '16px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Audit Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{user.messageCount} Actions</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
