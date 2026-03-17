import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { FileText, ArrowUpDown } from 'lucide-react';

const statusConfig = {
  reviewed: { variant: 'success', className: '' },
  pending: { variant: 'warning', className: '' },
  flagged: { variant: 'destructive', className: '' },
};

export function RecentUploadsTable({ uploads }) {
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUploads = [...uploads].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === 'asc' ? 1 : -1;
    return aValue > bValue ? modifier : -modifier;
  });

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4 text-blue-600" />
          Archive Ingestion Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl border border-slate-50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>
                  <button onClick={() => handleSort('fileName')} className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase">
                    Document <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort('user')} className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase">
                    User <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button onClick={() => handleSort('timestamp')} className="flex items-center gap-2 hover:text-blue-600 transition-colors uppercase">
                    Ingested <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-black text-slate-900">{upload.fileName}</TableCell>
                  <TableCell className="font-medium">{upload.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {upload.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-slate-500">{upload.size}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[upload.status]?.variant || 'default'}>
                      {upload.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-400">
                    {new Date(upload.timestamp).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
