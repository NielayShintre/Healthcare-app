import React, { useState } from 'react';
import {
  Download,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Upload,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '../../lib/utils';
import type { View } from '../../types';
import { useReport } from '../../context/ReportContext';

interface MarkersHistoryScreenProps {
  onNavigate?: (view: View) => void;
}

function markerBadgeClass(status: string) {
  switch (status) {
    case 'High':
    case 'Critical': return 'bg-error-container text-on-error-container';
    case 'Low': return 'bg-blue-50 text-blue-700';
    case 'Borderline': return 'bg-amber-50 text-amber-800';
    default: return 'bg-surface-container-high text-on-surface-variant';
  }
}

function MarkerStatusIcon({ status }: { status: string }) {
  if (status === 'High' || status === 'Critical') return <ArrowUpRight className="h-3 w-3" />;
  if (status === 'Normal') return <CheckCircle2 className="h-3 w-3" />;
  if (status === 'Borderline' || status === 'Low') return <AlertTriangle className="h-3 w-3" />;
  return null;
}

export default function MarkersHistoryScreen({ onNavigate }: MarkersHistoryScreenProps) {
  const { report } = useReport();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!report || report.markers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Activity className="h-10 w-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-on-surface">No Markers Yet</h2>
          <p className="text-on-surface-variant mt-2 max-w-sm">Upload a medical report to track your health markers and see trends over time.</p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary-container transition-all"
          >
            <Upload className="h-4 w-4" />
            Upload a Report
          </button>
        )}
      </div>
    );
  }

  const idx = Math.min(selectedIndex, report.markers.length - 1);
  const selectedMarker = report.markers[idx];
  const chartData = [{ date: report.reportMeta.reportDate ?? 'Latest', value: selectedMarker.value }];
  const refHigh = selectedMarker.referenceRange.high;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">Health Markers</h1>
          <p className="text-on-surface-variant font-medium mt-1">
            {report.patient.name ?? 'Your report'} · {report.markers.length} markers
            {report.reportMeta.reportDate ? ` · ${report.reportMeta.reportDate}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-outline-variant shadow-sm w-fit shrink-0">
          <button className="flex items-center gap-1.5 px-4 py-2 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container rounded-lg">
            <Filter className="h-4 w-4" />
            Categories
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Marker Cards */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          {report.markers.map((marker, i) => (
            <button
              key={marker.name}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "group text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                i === idx
                  ? "bg-white border-primary shadow-lg ring-1 ring-primary/20"
                  : "bg-white border-outline-variant shadow-sm hover:border-primary/50 hover:shadow-md"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] transition-colors",
                    i === idx ? "text-primary" : "text-outline"
                  )}>
                    {marker.category}
                  </p>
                  <h3 className="text-lg font-display font-bold text-on-surface mt-1">{marker.name}</h3>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                  markerBadgeClass(marker.status)
                )}>
                  {marker.status}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-data font-bold text-on-surface">{marker.value}</span>
                <span className="text-xs font-bold text-outline-variant uppercase">{marker.unit}</span>
              </div>

              {/* Decorative sparkline bars */}
              <div className="h-10 flex items-end gap-1 px-1">
                {[0.4, 0.5, 0.45, 0.6, 0.8].map((h, j) => (
                  <div
                    key={j}
                    className={cn(
                      "flex-1 rounded-t-sm transition-all duration-300",
                      i === idx ? "bg-primary group-hover:bg-primary-container" : "bg-outline-variant/30 group-hover:bg-primary/30"
                    )}
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant text-right border-t border-outline-variant/10 mt-4 pt-2">
                {report.reportMeta.reportDate ?? '—'}
              </p>

              {i === idx && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </section>

        {/* Right Column: Detail View */}
        <section className="lg:col-span-8 space-y-6 flex flex-col h-full">
          {/* Trend Chart */}
          <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-display font-bold text-on-surface">{selectedMarker.name}</h2>
                <p className="text-sm font-medium text-on-surface-variant mt-1 italic">
                  Reference: <span className="font-bold bg-secondary text-white px-2 py-0.5 rounded">{selectedMarker.referenceRange.text}</span>
                </p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-container px-4 py-2 rounded-xl transition-all">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            <div className="flex-1 h-72 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c0c8cd22" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#70787e' }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#70787e' }} dx={-10} />
                  <Tooltip
                    cursor={{ stroke: '#004d66', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 32px rgba(0,69,93,0.1)', padding: '12px 16px' }}
                    labelStyle={{ fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                    itemStyle={{ fontSize: '16px', fontWeight: '900', color: '#00455d' }}
                    formatter={(val) => [`${val} ${selectedMarker.unit}`, 'Result']}
                  />
                  {refHigh != null && (
                    <ReferenceLine
                      y={refHigh}
                      stroke="#006a64"
                      strokeDasharray="3 3"
                      strokeWidth={2}
                      label={{ position: 'right', value: 'Upper limit', fill: '#006a64', fontSize: 10, fontWeight: 'bold' }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00455d"
                    strokeWidth={4}
                    dot={{ r: 6, fill: '#fff', stroke: '#00455d', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: '#ba1a1a', stroke: '#fff', strokeWidth: 3 }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-on-surface-variant mt-4 italic">
              Upload more reports to see your {selectedMarker.name.toLowerCase()} trend over time
            </p>
          </div>

          {/* Lay Explanation */}
          {selectedMarker.layExplanation && (
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">What this means</h4>
              <p className="text-sm text-on-surface leading-relaxed">{selectedMarker.layExplanation}</p>
            </div>
          )}

          {/* Reading History Table */}
          <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 bg-surface-container-low/50 border-b border-outline-variant">
              <h3 className="text-xl font-display font-bold text-on-surface">Reading History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Date</th>
                    <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Result</th>
                    <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Status</th>
                    <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Source Lab</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  <tr>
                    <td className="py-5 px-6 font-bold text-on-surface">{report.reportMeta.reportDate ?? '—'}</td>
                    <td className="py-5 px-6">
                      <span className="text-lg font-data font-black">{selectedMarker.value}</span>
                      <span className="ml-1 text-[10px] font-bold text-outline uppercase tracking-wider">{selectedMarker.unit}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        markerBadgeClass(selectedMarker.status)
                      )}>
                        <MarkerStatusIcon status={selectedMarker.status} />
                        {selectedMarker.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 font-bold text-on-surface-variant">{report.reportMeta.labOrHospital ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
