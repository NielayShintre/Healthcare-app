import React, { useState } from 'react';
import { 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  Search,
  Filter,
  MoreVertical,
  Activity,
  Droplet,
  Heart,
  Scale
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
import type { LabResult } from '../../types';

interface MarkersHistoryScreenProps {
  labResults: LabResult[];
}

export default function MarkersHistoryScreen({ labResults }: MarkersHistoryScreenProps) {
  const [selectedMarker, setSelectedMarker] = useState<string>(labResults[0]?.marker || 'Hemoglobin');

  const displayResults = labResults.length > 0 ? labResults : [];
  
  // Filter history for the selected marker
  const markerHistory = displayResults.filter(r => r.marker === selectedMarker);
  
  // Create a trend chart data structure
  const chartData = markerHistory.map(r => ({
    date: r.date.split(',')[0], // Simplify date for chart
    value: typeof r.value === 'number' ? r.value : parseFloat(r.value as any) || 0
  })).reverse(); // Reverse to show chronological order if needed, but here we assume newest is first

  // Unique markers for selection cards
  const uniqueMarkers = Array.from(new Set(labResults.map(r => r.marker)));
  const latestResults = uniqueMarkers.map(m => labResults.find(r => r.marker === m)).filter(Boolean) as LabResult[];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high': return 'bg-error-container text-error';
      case 'low': return 'bg-error-container text-error';
      case 'elevated': return 'bg-amber-100 text-amber-800';
      case 'borderline': return 'bg-amber-50 text-amber-700';
      default: return 'bg-surface-container-high text-on-surface-variant';
    }
  };

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
                range === '1Y' ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container"
              )}
             >
                {range}
             </button>
          ))}
        </div>
      </header>

      {displayResults.length === 0 ? (
        <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center">
          <Activity className="h-12 w-12 text-outline-variant mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface">No Health Markers Found</h2>
          <p className="text-on-surface-variant mt-2">Upload a medical report to see your health markers and trends.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Marker Selection */}
          <section className="lg:col-span-4 flex flex-col gap-4">
            {latestResults.map((result) => (
              <button
                key={result.marker}
                onClick={() => setSelectedMarker(result.marker)}
                className={cn(
                  "group text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-white",
                  selectedMarker === result.marker ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-outline-variant shadow-sm hover:border-primary/50"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-outline">LATEST READING</p>
                    <h3 className="text-lg font-display font-bold text-on-surface mt-1">{result.marker}</h3>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                    getStatusColor(result.status)
                  )}>
                    {result.status}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-data font-bold text-on-surface">{result.value}</span>
                  <span className="text-xs font-bold text-outline-variant uppercase">{result.unit}</span>
                </div>
                <p className="text-[10px] font-bold text-on-surface-variant text-right border-t border-outline-variant/10 mt-4 pt-2">
                  Source: {result.source} · {result.date}
                </p>
              </button>
            ))}
          </section>

          {/* Right Column: Trend & History */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-on-surface">{selectedMarker} Trend</h2>
                  <p className="text-sm font-medium text-on-surface-variant mt-1">
                    Normal Range: <span className="font-bold text-primary">{latestResults.find(r => r.marker === selectedMarker)?.range || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#00455d" 
                      strokeWidth={4} 
                      dot={{ r: 6, fill: '#fff', stroke: '#00455d', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: '#00455d' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                  <h3 className="text-xl font-display font-bold text-on-surface">Reading History</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
                    <input placeholder="Search records..." className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-sm" />
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-surface-container border-b border-outline-variant">
                       <th className="py-4 px-6 text-xs font-bold uppercase">Date</th>
                       <th className="py-4 px-6 text-xs font-bold uppercase">Source</th>
                       <th className="py-4 px-6 text-xs font-bold uppercase">Result</th>
                       <th className="py-4 px-6 text-xs font-bold uppercase text-right">Status</th>
                     </tr>
                   </thead>
                   <tbody>
                      {markerHistory.map((row, idx) => (
                        <tr key={idx} className="border-b border-outline-variant/20 hover:bg-surface-container transition-colors">
                          <td className="py-5 px-6 font-medium text-on-surface">{row.date}</td>
                          <td className="py-5 px-6 text-sm text-on-surface-variant">{row.source}</td>
                          <td className="py-5 px-6 font-bold text-on-surface">
                            {row.value} <span className="text-[10px] font-bold text-outline uppercase">{row.unit}</span>
                          </td>
                          <td className="py-5 px-6 text-right">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              getStatusColor(row.status)
                            )}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
