import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FileType } from 'lucide-react';

const COLORS = [
  '#2563eb', // blue
  '#4f46e5', // indigo
  '#7c3aed', // purple
  '#059669', // emerald
  '#d97706', // amber
];

export function FileTypeDistribution({ data }) {
  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileType className="w-4 h-4 text-purple-600" />
          Archive Composition
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
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
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
