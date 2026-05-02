import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Droplet,
  Heart,
  Scale,
  Plus,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '../../lib/utils';
import type { PatientData, LabResult } from '../../types';

interface DashboardScreenProps {
  onNavigate: (view: string) => void;
  patient: PatientData | null;
  labResults: LabResult[];
}

export default function DashboardScreen({ onNavigate, patient, labResults }: DashboardScreenProps) {
  const [selectedRange, setSelectedRange] = useState('6M');

  // Filter lab results for the chart based on selected range
  const chartData = useMemo(() => {
    const glucoseResults = labResults
      .filter(r => r.marker.toLowerCase().includes('glucose'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (glucoseResults.length === 0) {
      return [
        { date: 'Jan', value: 95 },
        { date: 'Feb', value: 98 },
        { date: 'Mar', value: 105 },
        { date: 'Apr', value: 102 },
        { date: 'May', value: 110 },
        { date: 'Jun', value: 105 }
      ];
    }

    // Simple range filtering logic for demo
    const now = new Date();
    let filtered = glucoseResults;
    
    if (selectedRange === '6M') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      filtered = glucoseResults.filter(r => new Date(r.date) >= sixMonthsAgo);
    } else if (selectedRange === '1Y') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filtered = glucoseResults.filter(r => new Date(r.date) >= oneYearAgo);
    }

    return filtered.map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short' }),
      value: typeof r.value === 'number' ? r.value : parseFloat(r.value.toString())
    }));
  }, [labResults, selectedRange]);

  // Calculate BMI and other vitals
  const vitals = [
    { 
      label: 'BMI', 
      value: patient?.height && patient?.weight 
        ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1) 
        : '24.2', 
      unit: 'kg/m²', 
      status: 'Normal', 
      icon: Scale, 
      color: 'text-primary' 
    },
    { 
      label: 'Blood Pressure', 
      value: '135/85', 
      unit: 'mmHg', 
      status: 'Elevated', 
      icon: Activity, 
      color: 'text-error' 
    },
    { 
      label: 'HbA1c', 
      value: '6.4', 
      unit: '%', 
      status: 'Borderline', 
      icon: Droplet, 
      color: 'text-amber-500' 
    }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8 pb-24 lg:pb-10">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-4xl font-display font-black text-on-surface tracking-tight">
            Hello, {patient?.fullName?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">Here is your health summary based on your latest reports.</p>
        </div>
        <button 
          onClick={() => onNavigate('reports')}
          className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-primary-container transition-all flex items-center gap-2 group"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
          Upload New Report
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vitals Quick View */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-[0.2em] px-1">Key Metrics</h3>
          <div className="grid grid-cols-1 gap-4">
            {vitals.map((v) => (
              <div key={v.label} className="bg-white border border-outline-variant p-5 rounded-2xl flex items-center justify-between group hover:border-primary transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center transition-transform group-hover:scale-110", v.color)}>
                    <v.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{v.label}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-on-surface">{v.value}</span>
                      <span className="text-xs font-medium text-on-surface-variant">{v.unit}</span>
                    </div>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase",
                  v.status === 'Elevated' || v.status === 'Borderline' ? "bg-error-container text-error" : "bg-surface-container-high text-on-surface-variant"
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
                  onClick={() => setSelectedRange(range)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                    selectedRange === range ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
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
                    <stop offset="5%" stopColor="#00455d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00455d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666'}} />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold', color: '#00455d' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00455d" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Results Table */}
        <section className="lg:col-span-12 bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-xl font-display font-bold text-on-surface">Recent Lab Markers</h2>
            <button 
              onClick={() => onNavigate('markers')}
              className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
            >
              View History <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  <th className="py-4 px-6">Marker</th>
                  <th className="py-4 px-6">Result</th>
                  <th className="py-4 px-6">Normal Range</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {labResults.slice(0, 5).map((result, idx) => (
                  <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6 font-bold text-on-surface">{result.marker}</td>
                    <td className="py-4 px-6">
                      <span className="font-black text-on-surface">{result.value}</span>
                      <span className="ml-1 text-on-surface-variant text-xs">{result.unit}</span>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant font-medium">{result.range}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{result.date}</td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        result.status === 'Normal' ? "bg-primary/10 text-primary" : "bg-error-container text-error"
                      )}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
