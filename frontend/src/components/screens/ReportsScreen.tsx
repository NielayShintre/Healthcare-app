import React from 'react';
import { 
  CloudUpload, 
  FileText, 
  Image as ImageIcon, 
  Filter, 
  Eye, 
  MoreHorizontal, 
  RefreshCcw,
  ShieldCheck,
  MemoryStick as Memory
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { MedicalReport } from '../../types';

const reports: MedicalReport[] = [
  { id: '1', name: 'MRI_Lumbar_Spine.pdf', date: 'Oct 24, 2023', source: 'Quest Diagnostics', status: 'Analyzed', type: 'pdf' },
  { id: '2', name: 'Chest_XRay_AP.jpg', date: 'Oct 26, 2023', source: 'City Hospital Rad', status: 'Processing', type: 'image' },
  { id: '3', name: 'Metabolic_Panel_Comprehensive.pdf', date: 'Oct 20, 2023', source: 'LabCorp', status: 'Analyzed', type: 'pdf' },
];

export default function ReportsScreen() {
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
          <div className="flex-1 border-2 border-dashed border-primary-fixed-dim bg-surface-container-low/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-surface-container hover:border-primary transition-all duration-300">
            <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CloudUpload className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-1">Drag & Drop Files Here</h3>
            <p className="text-sm text-on-surface-variant mb-6 max-w-xs">Supported formats: PDF, JPG, PNG, DICOM (Max 50MB)</p>
            <button className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-primary-container transition-all">
              Browse Files
            </button>
          </div>
        </section>

        {/* Side Panel */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Active Analysis Card */}
          <div className="bg-primary text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20">
                <Memory className="h-20 w-20 animate-pulse" />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#95d6f7]">Active Analysis</h2>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/20 rounded-md">
                     <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                     <span className="text-[10px] font-bold">LIVE</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-bold truncate pr-4">CBC_Blood_Panel_2023.pdf</p>
                      <p className="text-xs font-bold text-[#95d6f7]">45%</p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '45%' }}
                        className="bg-white h-full rounded-full"
                       />
                    </div>
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#95d6f7]">Extracting biomarker patterns...</p>
                </div>
             </div>
          </div>

          {/* Security Info */}
          <div className="bg-white rounded-2xl p-6 border border-outline-variant flex-1 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <ShieldCheck className="h-32 w-32" />
            </div>
            <h3 className="text-xl font-display font-bold text-on-surface mb-2 relative z-10">End-to-End Encryption</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed relative z-10">
              All uploaded documents are encrypted at rest and in transit. Complying with HIPAA guidelines for maximum security.
            </p>
          </div>
        </section>

        {/* Previous Reports Table */}
        <section className="lg:col-span-12 bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 bg-surface-container-low/50 border-b border-outline-variant flex justify-between items-center">
             <h2 className="text-xl font-display font-bold text-on-surface">Recent Reports</h2>
             <button className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                <Filter className="h-4 w-4" />
                Filter
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Document Name</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Date Uploaded</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Source Lab</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {reports.map((report, idx) => (
                  <tr 
                    key={report.id} 
                    className={cn(
                      "group hover:bg-surface-container-low transition-colors",
                      idx !== reports.length - 1 && "border-b border-outline-variant/30"
                    )}
                  >
                    <td className="py-5 px-6 flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        report.type === 'pdf' ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"
                      )}>
                        {report.type === 'pdf' ? <FileText className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                      </div>
                      <span className="font-bold text-on-surface">{report.name}</span>
                    </td>
                    <td className="py-5 px-6 text-on-surface-variant font-medium">{report.date}</td>
                    <td className="py-5 px-6 text-on-surface-variant font-medium">{report.source}</td>
                    <td className="py-5 px-6">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        report.status === 'Analyzed' ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {report.status === 'Processing' && <RefreshCcw className="h-3 w-3 animate-spin" />}
                        {report.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-primary hover:bg-white rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-on-surface-variant hover:bg-white rounded-lg transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
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
