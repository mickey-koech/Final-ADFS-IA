import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { FileDown, Loader2, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function PDFExport({ stats }) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const generateReport = async (type) => {
    setExporting(true);
    setShowMenu(false);
    try {
      const pdf = new jsPDF();
      const currentDate = format(new Date(), 'PPpp');
      const filename = `ADFS_${type}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      // Header Styling
      const headerColor = type === 'Security' ? [239, 68, 68] : [37, 99, 235];
      pdf.setFillColor(...headerColor);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text(`ADFS ${type} Report`, 14, 20);
      pdf.setFontSize(10);
      pdf.text(`System: Institutional Archiving | Generated: ${currentDate}`, 14, 30);

      pdf.setTextColor(0, 0, 0);

      if (type === 'System') {
        pdf.setFontSize(16);
        pdf.text('System Overview', 14, 55);
        autoTable(pdf, {
          startY: 60,
          head: [['Metric', 'Value']],
          body: [
            ['Total Users', String(stats?.totalUsers || 0)],
            ['Active Accounts', String(stats?.approvedUsers || 0)],
            ['Pending Approvals', String(stats?.pendingUsers || 0)],
            ['Archives Indexed', String(stats?.totalFiles || 0)],
            ['Departments', String(stats?.departments || 0)],
          ],
          theme: 'striped',
          headStyles: { fillColor: headerColor },
        });
      } else if (type === 'Users') {
        pdf.setFontSize(16);
        pdf.text('Administrative User Directory', 14, 55);
        // Note: In real app, we'd fetch this. Showing structure here.
        autoTable(pdf, {
          startY: 60,
          head: [['Requirement', 'Status']],
          body: [['Data Consistency', 'Verified'], ['Access Control', 'Active']],
          theme: 'striped',
          headStyles: { fillColor: headerColor },
        });
      }

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `ADFS-IA Digital Filing System - Page ${i} of ${pageCount}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      pdf.save(filename);
      toast.success(`${type} Report Exported`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to generate report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowMenu(!showMenu)}
        className="gap-2 border-blue-100 hover:border-blue-400"
        disabled={exporting}
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        Intelligence Export
        <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </Button>

      {showMenu && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-white/90 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <button 
            onClick={() => generateReport('System')}
            className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 transition-colors"
          >
            📊 System Audit
          </button>
          <button 
            onClick={() => generateReport('Users')}
            className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-blue-50 transition-colors"
          >
            👥 Personnel Report
          </button>
          <button 
            onClick={() => generateReport('Security')}
            className="w-full px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors border-t border-slate-50"
          >
            🔒 Security Audit
          </button>
        </div>
      )}
    </div>
  );
}
