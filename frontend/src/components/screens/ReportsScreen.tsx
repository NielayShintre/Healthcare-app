import React, { useState, useMemo } from 'react';
import { 
  CloudUpload, 
  FileText, 
  Image as ImageIcon, 
  Filter, 
  Eye, 
  MoreHorizontal, 
  RefreshCcw,
  ShieldCheck,
  MemoryStick as Memory,
  Loader2,
  CheckCircle2,
  X,
  ExternalLink,
  Download,
  Search,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { MedicalReport, LabResult } from '../../types';

interface ReportsScreenProps {
  reports: MedicalReport[];
  labResults: LabResult[];
  onUpload: (report: MedicalReport, results: LabResult[]) => void;
  onDelete: (reportId: string) => void;
  onNavigate: (view: string) => void;
  onAnalyseInChat: (message: string) => void;
}

export default function ReportsScreen({ reports, labResults, onUpload, onDelete, onNavigate, onAnalyseInChat }: ReportsScreenProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewingReport, setViewingReport] = useState<MedicalReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(10);
    
    const localUrl = URL.createObjectURL(file);
    const reportId = Date.now().toString();
    
    for (let i = 20; i <= 90; i += 20) {
      await new Promise(r => setTimeout(r, 400));
      setUploadProgress(i);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        const newReport: MedicalReport = {
          id: reportId,
          name: file.name,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          source: data.lab_name || 'Extracted Report',
          status: 'Analyzed',
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          url: localUrl
        };

        const newResults: LabResult[] = data.markers.map((m: any) => ({
          marker: m.name,
          value: m.value,
          unit: m.unit,
          date: newReport.date,
          source: newReport.source,
          range: `${m.lab_range_low} - ${m.lab_range_high}`,
          status: m.status,
          reportId: reportId
        }));

        onUpload(newReport, newResults);
      } else {
        const errData = await response.json().catch(() => ({ detail: 'Backend error' }));
        throw new Error(errData.detail || 'Failed to analyze report');
      }
    } catch (error: any) {
      console.error('Extraction failed:', error);
      setError(error.message || 'The MediLens AI service is currently unavailable. Please check if the backend is running.');
    } finally {
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const ReportViewer = ({ report, onClose }: { report: MedicalReport, onClose: () => void }) => {
    const reportMarkers = useMemo(() => {
      return labResults.filter(r => r.reportId === report.id);
    }, [report.id, labResults]);

    const handleAnalyseInChat = () => {
      const details = reportMarkers.map(m => `${m.marker}: ${m.value} ${m.unit} (${m.status})`).join(', ');
      const prompt = `These are my details from ${report.name} (${report.source}): ${details}. Please help me understand my report and what these values mean for my health.`;
      onAnalyseInChat(prompt);
      onClose();
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                {report.type === 'pdf' ? <FileText className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-on-surface">{report.name}</h2>
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">{report.source} · {report.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-2.5 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
                 <Download className="h-5 w-5" />
               </button>
               <button 
                 onClick={() => {
                   if (confirm('Are you sure you want to delete this report? This will remove all associated health markers.')) {
                     onDelete(report.id);
                     onClose();
                   }
                 }}
                 className="p-2.5 hover:bg-error-container hover:text-error rounded-full transition-colors text-on-surface-variant flex items-center gap-2 text-xs font-bold"
               >
                 <X className="h-5 w-5" />
                 Delete Report
               </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Real Document Preview */}
            <div className="flex-1 bg-surface-container overflow-hidden flex flex-col">
               {report.url ? (
                 <iframe 
                   src={report.url} 
                   className="w-full h-full border-none bg-white"
                   title="Report Preview"
                 />
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 bg-surface-container-high rounded-3xl flex items-center justify-center mb-6 text-outline-variant">
                      <FileText className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-bold text-on-surface mb-2">No Live Preview Available</h3>
                    <p className="text-sm text-on-surface-variant max-w-md">This demo report's source file is not available in the current session. Please upload a fresh file to see the live PDF/Image viewer.</p>
                    <button 
                      onClick={() => {
                        onClose();
                        document.getElementById('file-upload')?.click();
                      }}
                      className="mt-6 bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-md"
                    >
                      Upload Fresh File
                    </button>
                 </div>
               )}
            </div>

            {/* Analysis Results Side panel */}
            <div className="w-80 border-l border-outline-variant bg-white p-6 overflow-y-auto hidden lg:flex flex-col">
               <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-6">AI Extraction Summary</h3>
               
               <div className="space-y-6 flex-1">
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                     <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                        <ShieldCheck className="h-4 w-4" />
                        Status: {report.status}
                     </div>
                     <p className="text-[11px] text-on-surface leading-relaxed">
                       Successfully mapped clinical data points with high confidence. All units standardized.
                     </p>
                  </div>

                  <div className="space-y-3">
                     <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Markers in this File</h4>
                     <div className="flex flex-col gap-2">
                        {reportMarkers.length > 0 ? reportMarkers.map(m => (
                           <div key={m.marker} className="flex flex-col p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-on-surface">{m.marker}</span>
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                              </div>
                              <div className="flex justify-between items-end">
                                <span className="text-lg font-black text-on-surface">{m.value} <span className="text-[10px] font-medium text-on-surface-variant">{m.unit}</span></span>
                                <span className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                  m.status === 'Normal' ? "bg-primary/10 text-primary" : "bg-error-container text-error"
                                )}>
                                  {m.status}
                                </span>
                              </div>
                           </div>
                        )) : (
                          <div className="text-[11px] text-on-surface-variant italic py-4">
                            No markers were extracted from this report.
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-outline-variant">
                  <button 
                    disabled={reportMarkers.length === 0}
                    onClick={handleAnalyseInChat}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md text-sm hover:bg-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="h-4 w-4" />
                    Analyse with Chat
                  </button>
               </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-on-surface">Medical Reports</h1>
        <p className="text-on-surface-variant font-medium mt-1">Securely upload lab results, imaging reports, and clinical notes for AI analysis.</p>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container text-error p-4 rounded-2xl border border-error/20 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-error/10 rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dropzone Area */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-xl font-display font-bold text-on-surface mb-6">New Upload</h2>
          
          <div 
            className={cn(
              "flex-1 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center group transition-all duration-300 relative",
              isUploading ? "border-primary bg-primary/5" : "border-primary-fixed-dim bg-surface-container-low/50 hover:bg-surface-container hover:border-primary cursor-pointer"
            )}
            onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
          >
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div 
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <Loader2 className="h-20 w-20 text-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-primary">
                      {uploadProgress}%
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-1">Analyzing Document...</h3>
                  <p className="text-sm text-on-surface-variant max-w-xs">Extracting health markers and standardizing units using MediLens AI.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                    <CloudUpload className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-1">Drag & Drop Files Here</h3>
                  <p className="text-sm text-on-surface-variant mb-6 max-w-xs">Supported formats: PDF, JPG, PNG (Max 50MB)</p>
                  <button 
                    className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-primary-container transition-all"
                  >
                    Browse Files
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-8 text-[10px] font-black text-outline-variant uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              HIPAA COMPLIANT
            </div>
            <div className="flex items-center gap-2">
              <Memory className="h-4 w-4 text-primary" />
              LOCAL-ONLY PROCESSING
            </div>
          </div>
        </section>

        {/* Sidebar Info */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-primary text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8" />
             <h3 className="text-lg font-bold mb-4 relative z-10">How it works</h3>
             <ul className="space-y-4 relative z-10">
               {[
                 { step: 1, text: "Upload your lab PDF or photo." },
                 { step: 2, text: "AI extracts values & ranges." },
                 { step: 3, text: "Markers are automatically added to your history." }
               ].map((item) => (
                 <li key={item.step} className="flex gap-3 items-start">
                   <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{item.step}</span>
                   <p className="text-sm font-medium leading-snug">{item.text}</p>
                 </li>
               ))}
             </ul>
          </div>
          
          <div className="bg-white border border-outline-variant p-6 rounded-2xl shadow-sm">
             <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
               <RefreshCcw className="h-4 w-4" />
               Recent Activity
             </h3>
             <div className="space-y-4">
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-center gap-3 pb-3 border-b border-outline-variant/30 last:border-0 last:pb-0">
                    <div className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center text-primary">
                      {report.type === 'pdf' ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-on-surface truncate">{report.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{report.date}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  </div>
                ))}
             </div>
          </div>
        </aside>

        {/* History Table */}
        <section className="lg:col-span-12 bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-xl font-display font-bold text-on-surface">Analysis History</h2>
            <button className="text-sm font-bold text-primary flex items-center gap-2 hover:underline">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  <th className="py-4 px-6">Document Name</th>
                  <th className="py-4 px-6">Analysis Date</th>
                  <th className="py-4 px-6">Lab Source</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {reports.length > 0 ? reports.map((report) => (
                  <tr key={report.id} className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {report.type === 'pdf' ? <FileText className="h-5 w-5 text-red-500" /> : <ImageIcon className="h-5 w-5 text-blue-500" />}
                        <span className="font-bold text-on-surface">{report.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">{report.date}</td>
                    <td className="py-4 px-6 font-medium text-on-surface">{report.source}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setViewingReport(report)}
                          className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant"
                          title="View Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Delete this report and its markers?')) {
                              onDelete(report.id);
                            }
                          }}
                          className="p-2 hover:bg-error-container hover:text-error rounded-lg transition-colors text-on-surface-variant"
                          title="Delete Report"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant font-medium">
                      No reports analyzed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Report Viewer Modal */}
      <AnimatePresence>
        {viewingReport && (
          <ReportViewer 
            report={viewingReport} 
            onClose={() => setViewingReport(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
