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
  ChevronRight,
  TrendingUp,
  Droplet
} from 'lucide-react';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../../lib/utils';
import type { View, VitalMetric, LabResult, PatientData } from '../../types';

interface DashboardScreenProps {
  onNavigate: (view: View) => void;
  patient: PatientData | null;
  labResults: LabResult[];
}

export default function DashboardScreen({ onNavigate, patient, labResults }: DashboardScreenProps) {
  // Derive vitals from patient data
  const dynamicVitals: VitalMetric[] = [
    { label: 'HEART RATE', value: '72', unit: 'bpm', status: 'Normal', icon: 'heart' },
    { label: 'BLOOD PRESSURE', value: '118/76', unit: 'mmHg', status: 'Normal', icon: 'activity' },
    { 
      label: 'WEIGHT / BMI', 
      value: patient ? `${patient.weight} / ${(patient.weight / ((patient.height/100)**2)).toFixed(1)}` : 'N/A', 
      unit: 'kg', 
      status: 'Normal', 
      icon: 'scale' 
    },
  ];

  // Derive blood sugar trend from labResults if available
  const glucoseResults = labResults.filter(r => r.marker.toLowerCase().includes('glucose'));
  const chartData = glucoseResults.length > 0 
    ? glucoseResults.map(r => ({ month: r.date.split(' ')[0], value: typeof r.value === 'number' ? r.value : parseFloat(r.value as any) || 0 })).reverse()
    : [
        { month: 'May', value: 85 },
        { month: 'Jun', value: 92 },
        { month: 'Jul', value: 118 },
        { month: 'Aug', value: 105 },
        { month: 'Sep', value: 98 },
      ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-20 lg:pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-on-surface">Health Insights Dashboard</h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Patient: {patient?.fullName || 'Guest'} · ID: #MI-8492 · Last updated: {labResults[0]?.date || 'Oct 24, 2023'}
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
          <div className="space-y-4 flex-1">
            {dynamicVitals.map((v) => (
              <div key={v.label} className="p-3.5 rounded-xl bg-surface-container-low border border-transparent hover:border-outline-variant transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    v.status === 'Elevated' ? "bg-error-container text-error" : "bg-primary/10 text-primary"
                  )}>
                    {v.label.includes('HEART') && <Heart className="h-5 w-5" />}
                    {v.label.includes('PRESSURE') && <BarChart3 className="h-5 w-5" />}
                    {v.label.includes('WEIGHT') && <Scale className="h-5 w-5" />}
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
                  v.status === 'Elevated' ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"
                )}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Chart Area */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-display font-bold text-on-surface flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                Glucose Trend
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Timeline analysis · Standardized units</p>
            </div>
            <div className="flex bg-surface-container p-1 rounded-lg">
              {['6M', '1Y', 'ALL'].map((range) => (
                <button 
                  key={range}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                    range === '6M' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00455d" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00455d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c0c8cd33" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#70787e' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#70787e' }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #c0c8cd33', 
                    boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00455d" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#00455d' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Detailed Lab Table */}
        <section className="lg:col-span-12 bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="p-6 bg-surface-container-low/50 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-xl font-display font-bold text-on-surface">Recent Lab Results</h3>
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
                  <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest">Latest Value</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest">Date & Source</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest">Global Range</th>
                  <th className="py-4 px-6 text-xs font-bold text-outline-variant uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {labResults.length > 0 ? labResults.map((result, idx) => (
                  <tr 
                    key={idx} 
                    className={cn(
                      "group hover:bg-surface-container-low transition-colors",
                      idx !== labResults.length - 1 && "border-b border-outline-variant/30"
                    )}
                  >
                    <td className="py-5 px-6 font-bold text-on-surface">{result.marker}</td>
                    <td className="py-5 px-6">
                      <span className={cn(
                        "text-lg font-data font-bold",
                        result.status === 'High' || result.status === 'Low' ? "text-error" : 
                        result.status === 'Borderline' ? "text-secondary" : "text-on-surface"
                      )}>
                        {result.value}
                      </span>
                      <span className="ml-1.5 text-xs text-on-surface-variant font-sans">{result.unit}</span>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-on-surface">{result.date}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{result.source}</p>
                    </td>
                    <td className="py-5 px-6 font-data text-on-surface-variant">{result.range}</td>
                    <td className="py-5 px-6 text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        result.status === 'High' || result.status === 'Low' ? "bg-error-container text-on-error-container" : 
                        result.status === 'Borderline' ? "bg-secondary-container text-on-secondary-container" : 
                        "bg-surface-container-high text-on-surface-variant"
                      )}>
                        {(result.status === 'High' || result.status === 'Low') && <ArrowUpRight className="h-3 w-3" />}
                        {result.status === 'Normal' && <CheckCircle2 className="h-3 w-3" />}
                        {result.status === 'Borderline' && <AlertTriangle className="h-3 w-3" />}
                        {result.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-on-surface-variant font-medium">
                      No lab results found. Please upload a report to populate this dashboard.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
