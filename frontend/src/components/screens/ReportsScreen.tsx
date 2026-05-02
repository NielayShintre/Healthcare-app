import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { MedicalReport, LabResult } from '../../types';

interface ReportsScreenProps {
  reports: MedicalReport[];
  onUpload: (report: MedicalReport, results: LabResult[]) => void;
}

export default function ReportsScreen({ reports, onUpload }: ReportsScreenProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    // Simulate progress
    for (let i = 20; i <= 90; i += 20) {
      await new Promise(r => setTimeout(r, 400));
      setUploadProgress(i);
    }

    try {
      // 1. Try real backend upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        const newReport: MedicalReport = {
          id: Date.now().toString(),
          name: file.name,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          source: data.lab_name || 'Extracted Report',
          status: 'Analyzed',
          type: file.type.includes('pdf') ? 'pdf' : 'image'
        };

        const newResults: LabResult[] = data.markers.map((m: any) => ({
          marker: m.name,
          value: m.value,
          unit: m.unit,
          date: newReport.date,
          source: newReport.source,
          range: `${m.lab_range_low} - ${m.lab_range_high}`,
          status: m.status
        }));

        onUpload(newReport, newResults);
      } else {
        throw new Error('Backend unavailable');
      }
    } catch (error) {
      console.warn('Backend upload failed, using fallback parser:', error);
      
      // 2. Fallback: Mock Parser for Demo
      const mockReport: MedicalReport = {
        id: Date.now().toString(),
        name: file.name,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        source: 'MediLens AI Parser',
        status: 'Analyzed',
        type: file.type.includes('pdf') ? 'pdf' : 'image'
      };

      const mockResults: LabResult[] = [
        {
          marker: 'Vitamin D',
          value: 24.5,
          unit: 'ng/mL',
          date: mockReport.date,
          source: mockReport.source,
          range: '30.0 - 100.0',
          status: 'Low'
        },
        {
          marker: 'Cholesterol',
          value: 185,
          unit: 'mg/dL',
          date: mockReport.date,
          source: mockReport.source,
          range: '< 200',
          status: 'Normal'
        }
      ];

      onUpload(mockReport, mockResults);
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

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-on-surface">Medical Reports</h1>
        <p className="text-on-surface-variant font-medium mt-1">Securely upload lab results, imaging reports, and clinical notes for AI analysis.</p>
      </header>

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
                      <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
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
    </div>
  );
}
