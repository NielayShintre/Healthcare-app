import React from 'react';
import { 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  CircleDot
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { cn } from '../../lib/utils';

const historyData = [
  { date: 'Jan 23', value: 98 },
  { date: 'Mar 23', value: 105 },
  { date: 'Jun 23', value: 112 },
  { date: 'Aug 23', value: 125 },
  { date: 'Oct 23', value: 142 },
];

const markerCards = [
  { panel: 'LIPID PANEL', label: 'LDL Cholesterol', value: '142', unit: 'mg/dL', status: 'High', date: 'Oct 12, 2023', active: true },
  { panel: 'LIPID PANEL', label: 'HDL Cholesterol', value: '55', unit: 'mg/dL', status: 'Normal', date: 'Oct 12, 2023', active: false },
  { panel: 'METABOLIC', label: 'Fasting Glucose', value: '92', unit: 'mg/dL', status: 'Normal', date: 'Oct 12, 2023', active: false },
  { panel: 'VITALS', label: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'Elevated', date: 'Oct 12, 2023', active: false },
];

const readingHistory = [
  { date: 'Oct 12, 2023', result: '142', status: 'High', source: 'Quest Diagnostics' },
  { date: 'Aug 05, 2023', result: '125', status: 'High', source: 'City Hospital Lab' },
  { date: 'Jun 20, 2023', result: '112', status: 'Borderline', source: 'Quest Diagnostics' },
  { date: 'Mar 10, 2023', result: '105', status: 'Normal', source: 'Primary Care Clinic' },
  { date: 'Jan 15, 2023', result: '98', status: 'Normal', source: 'Primary Care Clinic' },
];

export default function MarkersHistoryScreen() {
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface">Health Markers History</h1>
          <p className="text-on-surface-variant font-medium mt-1">Track and analyze your vital health indicators over time.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-outline-variant shadow-sm w-fit shrink-0">
          {['3M', '6M', '1Y', 'All'].map((range) => (
             <button 
              key={range}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                range === '1Y' ? "bg-primary-container text-white" : "text-on-surface-variant hover:bg-surface-container"
              )}
             >
                {range}
             </button>
          ))}
          <div className="w-px h-6 bg-outline-variant mx-1" />
          <button className="flex items-center gap-1.5 px-4 py-2 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container rounded-lg">
             <Filter className="h-4 w-4" />
             Categories
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Master List */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          {markerCards.map((card) => (
            <button
              key={card.label}
              className={cn(
                "group text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                card.active 
                  ? "bg-white border-primary shadow-lg ring-1 ring-primary/20" 
                  : "bg-white border-outline-variant shadow-sm hover:border-primary/50 hover:shadow-md"
              )}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.15em] transition-colors",
                    card.active ? "text-primary" : "text-outline"
                  )}>
                    {card.panel}
                  </p>
                  <h3 className="text-lg font-display font-bold text-on-surface mt-1">{card.label}</h3>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                  card.status === 'High' ? "bg-error-container text-on-error-container" :
                  card.status === 'Elevated' ? "bg-amber-100 text-amber-800" :
                  "bg-surface-container-high text-on-surface-variant"
                )}>
                  {card.status}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-data font-bold text-on-surface">{card.value}</span>
                <span className="text-xs font-bold text-outline-variant uppercase">{card.unit}</span>
              </div>

              {/* Faux Sparkline */}
              <div className="h-10 flex items-end gap-1 px-1">
                {[0.4, 0.5, 0.45, 0.6, 0.8].map((h, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex-1 rounded-t-sm transition-all duration-300",
                      card.active ? "bg-primary group-hover:bg-primary-container" : "bg-outline-variant/30 group-hover:bg-primary/30"
                    )}
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant text-right border-t border-outline-variant/10 mt-4 pt-2">
                Latest: {card.date}
              </p>
              
              {card.active && (
                 <div className="absolute top-0 right-0 p-3">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                 </div>
              )}
            </button>
          ))}
        </section>

        {/* Right Column: Detailed Context */}
        <section className="lg:col-span-8 space-y-6 flex flex-col h-full">
          {/* Trend Chart */}
          <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-display font-bold text-on-surface">LDL Cholesterol Trend</h2>
                <p className="text-sm font-medium text-on-surface-variant mt-1 italic">
                  Reference Range: <span className="font-bold text-secondary-container bg-secondary px-2 py-0.5 rounded text-white">&lt; 100 mg/dL</span>
                </p>
              </div>
              <button className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-container px-4 py-2 rounded-xl transition-all">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>

            <div className="flex-1 h-72 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#c0c8cd22" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#70787e' }}
                    dy={15}
                  />
                  <YAxis 
                    domain={[60, 160]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#70787e' }}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#004d66', strokeWidth: 1, strokeDasharray: '4 4' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 8px 32px rgba(0,69,93,0.1)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{ fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.1em' }}
                    itemStyle={{ fontSize: '16px', fontWeight: '900', color: '#00455d' }}
                    formatter={(val) => [`${val} mg/dL`, 'Result']}
                  />
                  <ReferenceLine y={100} stroke="#006a64" strokeDasharray="3 3" strokeWidth={2} label={{ position: 'right', value: 'Target', fill: '#006a64', fontSize: 10, fontWeight: 'bold' }} />
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
          </div>

          {/* Reading History Table */}
          <div className="bg-white border border-outline-variant rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden">
             <div className="p-6 bg-surface-container-low/50 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-display font-bold text-on-surface">Reading History</h3>
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline-variant group-focus-within:text-primary transition-colors" />
                  <input 
                    placeholder="Search past labs..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-surface-container border-b border-outline-variant">
                     <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Date</th>
                     <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Result</th>
                     <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Status</th>
                     <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest">Source Lab</th>
                     <th className="py-4 px-6 text-[10px] font-black text-outline uppercase tracking-widest text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm font-medium">
                    {readingHistory.map((row, idx) => (
                      <tr 
                        key={idx}
                        className="group hover:bg-surface-container transition-colors border-b border-outline-variant/20 last:border-0"
                      >
                        <td className="py-5 px-6 font-bold text-on-surface">{row.date}</td>
                        <td className="py-5 px-6">
                           <span className="text-lg font-data font-black">{row.result}</span>
                           <span className="ml-1 text-[10px] font-bold text-outline uppercase tracking-wider">mg/dL</span>
                        </td>
                        <td className="py-5 px-6">
                           <span className={cn(
                             "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                             row.status === 'High' ? "bg-error-container text-on-error-container" :
                             row.status === 'Borderline' ? "bg-amber-50 text-amber-700" :
                             "bg-green-50 text-green-700"
                           )}>
                             {row.status === 'High' && <ArrowUpRight className="h-3 w-3" />}
                             {row.status === 'Normal' && <CheckCircle2 className="h-3 w-3" />}
                             {row.status}
                           </span>
                        </td>
                        <td className="py-5 px-6 font-bold text-on-surface-variant truncate max-w-[150px]">{row.source}</td>
                        <td className="py-5 px-6 text-right">
                          <button className="p-2 text-outline-variant hover:text-primary transition-colors">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
