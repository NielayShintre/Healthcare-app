import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Info, 
  Search,
  ChevronRight,
  Filter,
  ArrowRight,
  Droplet,
  Beaker,
  Stethoscope
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import type { LabResult } from '../../types';

interface MarkersHistoryScreenProps {
  labResults: LabResult[];
}

export default function MarkersHistoryScreen({ labResults }: MarkersHistoryScreenProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(
    labResults.length > 0 ? labResults[0].marker : null
  );
  const [selectedRange, setSelectedRange] = useState('1Y');

  // Get the most recent value for each marker
  const latestResults = useMemo(() => {
    const latestMap = new Map<string, LabResult>();
    labResults.forEach(result => {
      const existing = latestMap.get(result.marker);
      if (!existing || new Date(result.date) > new Date(existing.date)) {
        latestMap.set(result.marker, result);
      }
    });
    return Array.from(latestMap.values());
  }, [labResults]);

  // Set initial selected marker if not already set
  useMemo(() => {
    if (!selectedMarker && latestResults.length > 0) {
      setSelectedMarker(latestResults[0].marker);
    }
  }, [latestResults, selectedMarker]);

  const historyForSelectedMarker = useMemo(() => {
    if (!selectedMarker) return [];
    
    let filtered = labResults
      .filter(r => r.marker === selectedMarker)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Apply time range filter
    const now = new Date();
    if (selectedRange === '3M') {
      const date = new Date();
      date.setMonth(now.getMonth() - 3);
      filtered = filtered.filter(r => new Date(r.date) >= date);
    } else if (selectedRange === '6M') {
      const date = new Date();
      date.setMonth(now.getMonth() - 6);
      filtered = filtered.filter(r => new Date(r.date) >= date);
    } else if (selectedRange === '1Y') {
      const date = new Date();
      date.setFullYear(now.getFullYear() - 1);
      filtered = filtered.filter(r => new Date(r.date) >= date);
    }

    return filtered;
  }, [labResults, selectedMarker, selectedRange]);

  const chartData = useMemo(() => {
    return historyForSelectedMarker.map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: typeof r.value === 'number' ? r.value : parseFloat(r.value.toString())
    }));
  }, [historyForSelectedMarker]);

  const displayResults = latestResults;

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
              onClick={() => setSelectedRange(range)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                selectedRange === range ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
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
            <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-[0.2em] px-1 mb-2">Available Markers</h3>
            <div className="flex flex-col gap-3">
              {latestResults.map((result) => (
                <button
                  key={result.marker}
                  onClick={() => setSelectedMarker(result.marker)}
                  className={cn(
                    "group text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-white",
                    selectedMarker === result.marker ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-outline-variant shadow-sm hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-on-surface">{result.marker}</span>
                    {result.status !== 'Normal' && (
                      <span className="bg-error-container text-error text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        {result.status}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-on-surface">{result.value}</span>
                    <span className="text-xs font-medium text-on-surface-variant">{result.unit}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    <span>Range: {result.range}</span>
                    <ArrowRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", selectedMarker === result.marker ? "text-primary" : "text-outline-variant")} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Right Column: Detailed Trend and History */}
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-outline-variant p-8 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-display font-black text-on-surface flex items-center gap-3">
                    <Beaker className="h-6 w-6 text-primary" />
                    {selectedMarker} Analysis
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1 font-medium">Standardized trend across {historyForSelectedMarker.length} recorded results.</p>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="h-72 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMarker" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00455d" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00455d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666'}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold', color: '#00455d' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#00455d" strokeWidth={4} fillOpacity={1} fill="url(#colorMarker)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Baseline</span>
                    <p className="text-lg font-bold text-on-surface">{historyForSelectedMarker[0]?.value || '-'} {historyForSelectedMarker[0]?.unit}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Current</span>
                    <p className="text-lg font-bold text-on-surface">{historyForSelectedMarker[historyForSelectedMarker.length-1]?.value || '-'} {historyForSelectedMarker[historyForSelectedMarker.length-1]?.unit}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Clinical Status</span>
                    <p className={cn(
                      "text-lg font-bold",
                      historyForSelectedMarker[historyForSelectedMarker.length-1]?.status === 'Normal' ? "text-primary" : "text-error"
                    )}>
                      {historyForSelectedMarker[historyForSelectedMarker.length-1]?.status || 'Unknown'}
                    </p>
                 </div>
              </div>
            </div>

            {/* History Table for Selected Marker */}
            <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
               <div className="p-6 border-b border-outline-variant">
                  <h3 className="font-bold text-on-surface">Timeline History</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-container text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6">Result</th>
                        <th className="py-4 px-6">Unit</th>
                        <th className="py-4 px-6">Reference</th>
                        <th className="py-4 px-6">Lab Source</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[...historyForSelectedMarker].reverse().map((row, idx) => (
                        <tr key={idx} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                          <td className="py-4 px-6 font-medium text-on-surface">{row.date}</td>
                          <td className="py-4 px-6 font-black text-on-surface">{row.value}</td>
                          <td className="py-4 px-6 text-on-surface-variant">{row.unit}</td>
                          <td className="py-4 px-6 text-on-surface-variant">{row.range}</td>
                          <td className="py-4 px-6 italic text-on-surface-variant">{row.source}</td>
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
