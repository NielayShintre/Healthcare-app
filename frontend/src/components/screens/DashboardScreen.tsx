import React from 'react';
import {
  Heart,
  Activity,
  Scale,
  Download,
  Share2,
  BarChart3,
  Search,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Droplet,
  Upload,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../../lib/utils';
import type { View } from '../../types';
import { useReport } from '../../context/ReportContext';

interface DashboardScreenProps {
  onNavigate: (view: View) => void;
}

function getVitalIcon(label: string) {
  const u = label.toUpperCase();
  if (u.includes('HEART') || u.includes('PULSE')) return <Heart className="h-5 w-5" />;
  if (u.includes('PRESSURE')) return <BarChart3 className="h-5 w-5" />;
  if (u.includes('WEIGHT') || u.includes('BMI')) return <Scale className="h-5 w-5" />;
  if (u.includes('TEMP')) return <Droplet className="h-5 w-5" />;
  return <Activity className="h-5 w-5" />;
}

function markerValueColor(status: string) {
  switch (status) {
    case 'High':
    case 'Critical': return 'text-error';
    case 'Low': return 'text-blue-600';
    case 'Borderline': return 'text-secondary';
    default: return 'text-on-surface';
  }
}

function markerBadgeClass(status: string) {
  switch (status) {
    case 'High':
    case 'Critical': return 'bg-error-container text-on-error-container';
    case 'Low': return 'bg-blue-50 text-blue-700';
    case 'Borderline': return 'bg-secondary-container text-on-secondary-container';
    default: return 'bg-surface-container-high text-on-surface-variant';
  }
}

function MarkerStatusIcon({ status }: { status: string }) {
  if (status === 'High' || status === 'Critical') return <ArrowUpRight className="h-3 w-3" />;
  if (status === 'Normal') return <CheckCircle2 className="h-3 w-3" />;
  if (status === 'Borderline' || status === 'Low') return <AlertTriangle className="h-3 w-3" />;
  return null;
}

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const { report } = useReport();

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Activity className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-on-surface">No Report Yet</h2>
          <p className="text-on-surface-variant mt-2 max-w-sm">Upload a medical report to see your health insights, vitals, and lab markers here.</p>
        </div>
        <button
          onClick={() => onNavigate('reports')}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary-container transition-all"
        >
          <Upload className="h-4 w-4" />
          Upload a Report
        </button>
      </div>
    );
  }

  const glucoseMarker = report.markers.find(m => /glucose|blood sugar|fasting/i.test(m.name));
  const chartData = glucoseMarker
    ? [{ month: report.reportMeta.reportDate ?? 'Latest', value: glucoseMarker.value }]
    : null;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-20 lg:pb-10">
      {/* Red flags banner */}
      {report.redFlags.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-error-container rounded-xl border border-error/20">
          <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-on-error-container text-sm">Attention Required</p>
            <ul className="mt-1 space-y-0.5">
              {report.redFlags.map((flag, i) => (
                <li key={i} className="text-sm text-on-error-container">{flag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Health Insights Dashboard</h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Patient: {report.patient.name ?? 'Unknown'}
            {report.reportMeta.reportDate ? ` · ${report.reportMeta.reportDate}` : ''}
            {report.reportMeta.labOrHospital ? ` · ${report.reportMeta.labOrHospital}` : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-outline rounded-lg text-sm font-bold text-primary hover:bg-surface-container transition-colors">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary-container transition-all">
            <Share2 className="h-4 w-4" />
            Share Records
          </button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vitals Summary */}
        <section className="lg:col-span-4 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8" />
          <h3 className="text-xl font-display font-bold text-on-surface mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Current Vitals
          </h3>
          {report.vitals.length === 0 ? (
            <p className="text-on-surface-variant text-sm">No vitals found in this report.</p>
          ) : (
            <div className="space-y-4 flex-1">
              {report.vitals.map((v) => (
                <div key={v.label} className="p-3.5 rounded-xl bg-surface-container-low border border-transparent hover:border-outline-variant transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                      v.status !== 'Normal' ? "bg-error-container text-error" : "bg-primary/10 text-primary"
                    )}>
                      {getVitalIcon(v.label)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-outline-variant tracking-wider uppercase">{v.label}</p>
                      <p className="text-xl font-bold font-data text-on-surface">
                        {v.value} <span className="text-sm font-normal text-on-surface-variant font-sans">{v.unit}</span>
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase",
                    v.status !== 'Normal' ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"
                  )}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Chart Area */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col">
          {chartData ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-on-surface flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-primary" />
                    {glucoseMarker!.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Single data point · {glucoseMarker!.unit} · Upload more reports to see trend
                  </p>
                </div>
              </div>
              <div className="flex-1 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00455d" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#00455d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c0c8cd33" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#70787e' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#70787e' }} dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #c0c8cd33', boxShadow: '0 4px 12px rgba(15,23,42,0.05)', padding: '8px 12px' }}
                      itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#00455d" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#00455d' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-outline-variant" />
              </div>
              <div>
                <p className="font-bold text-on-surface">No Blood Glucose Data</p>
                <p className="text-sm text-on-surface-variant mt-1 max-w-xs">Glucose trend tracking is available when your report includes fasting blood sugar results.</p>
              </div>
            </div>
          )}
        </section>

        {/* Detailed Lab Table */}
        {report.markers.length > 0 && (
          <section className="lg:col-span-12 bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
            <div className="p-6 bg-surface-container-low/50 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-display font-bold text-on-surface">Lab Results</h3>
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline-variant group-focus-within:text-primary transition-colors" />
                <input
                  placeholder="Search health markers..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant rounded-full text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest">Marker</th>
                    <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest">Value</th>
                    <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest">Date & Source</th>
                    <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest">Reference Range</th>
                    <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {report.markers.slice(0, 8).map((m, idx) => (
                    <tr
                      key={m.name}
                      className={cn(
                        "group hover:bg-surface-container-low transition-colors",
                        idx < Math.min(report.markers.length, 8) - 1 && "border-b border-outline-variant/30"
                      )}
                    >
                      <td className="py-5 px-6 font-bold text-on-surface">{m.name}</td>
                      <td className="py-5 px-6">
                        <span className={cn("text-lg font-data font-bold", markerValueColor(m.status))}>
                          {m.value}
                        </span>
                        <span className="ml-1.5 text-xs text-on-surface-variant font-sans">{m.unit}</span>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-on-surface">{report.reportMeta.reportDate ?? '—'}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{report.reportMeta.labOrHospital ?? '—'}</p>
                      </td>
                      <td className="py-5 px-6 font-data text-on-surface-variant">{m.referenceRange.text}</td>
                      <td className="py-5 px-6 text-right">
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase", markerBadgeClass(m.status))}>
                          <MarkerStatusIcon status={m.status} />
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
