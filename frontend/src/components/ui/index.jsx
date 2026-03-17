import React from 'react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-glass overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 border-b border-white/10 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-black text-slate-900 tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-900 text-white",
    outline: "border border-slate-200 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    destructive: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Progress = ({ value = 0, className = "" }) => (
  <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className}`}>
    <div 
      className="bg-blue-600 h-full transition-all duration-500 ease-out" 
      style={{ width: `${value}%` }}
    />
  </div>
);

const Button = ({ children, onClick, size = "md", variant = "default", className = "" }) => {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    outline: "bg-white/50 backdrop-blur-md border border-slate-200 text-slate-700 hover:bg-white",
  };
  return (
    <button 
      onClick={onClick}
      className={`rounded-xl font-bold transition-all duration-300 active:scale-95 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Table = ({ children }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full text-left border-collapse">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-slate-50/50">{children}</thead>;
const TableBody = ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>;
const TableRow = ({ children, className = "" }) => <tr className={`hover:bg-slate-50/30 transition-colors ${className}`}>{children}</tr>;
const TableHead = ({ children }) => <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">{children}</th>;
const TableCell = ({ children, className = "" }) => <td className={`px-4 py-4 text-sm text-slate-700 ${className}`}>{children}</td>;

const ScrollArea = ({ children, className = "" }) => (
  <div className={`overflow-y-auto custom-scrollbar ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent, Badge, Progress, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, ScrollArea };
