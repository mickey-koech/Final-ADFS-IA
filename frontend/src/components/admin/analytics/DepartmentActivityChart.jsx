import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Building2 } from 'lucide-react';

export function DepartmentActivityChart({ data }) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-emerald-600" />
          Cross-Departmental Engagement
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="department" 
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '16px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Bar 
                dataKey="uploads" 
                fill="#059669" 
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar 
                dataKey="downloads" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
