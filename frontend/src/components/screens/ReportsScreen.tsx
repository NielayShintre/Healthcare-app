import React, { useState, useRef } from 'react';
import {
  CloudUpload,
  FileText,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { View } from '../../types';
import { useReport } from '../../context/ReportContext';

interface ReportsScreenProps {
  onNavigate: (view: View) => void;
}

export default function ReportsScreen({ onNavigate }: ReportsScreenProps) {
  const { report, setReport } = useReport();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(body || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setReport(data);
      onNavigate('dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-on-surface">Medical Reports</h1>
        <p className="text-on-surface-variant font-medium mt-1">Upload a medical PDF for AI-powered analysis and plain-language insights.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dropzone */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col min-h-[400px]">
          <h2 className="text-xl font-display font-bold text-on-surface mb-6">New Upload</h2>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            className={cn(
              "flex-1 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-primary-fixed-dim bg-surface-container-low/50 hover:bg-surface-container hover:border-primary",
              loading && "cursor-not-allowed opacity-70",
              !loading && "cursor-pointer group"
            )}
            onClick={() => !loading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {loading ? (
              <>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">Analyzing Report…</h3>
                <p className="text-sm text-on-surface-variant max-w-xs">Claude is reading your PDF and extracting health data. This may take up to 15 seconds.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CloudUpload className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">Drag & Drop a PDF Here</h3>
                <p className="text-sm text-on-surface-variant mb-6 max-w-xs">Lab reports, discharge summaries, imaging reports — one PDF at a time (max 50 MB)</p>
                <button
                  type="button"
                  className="bg-primary text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-primary-container transition-all"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Browse Files
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-error-container rounded-xl">
              <AlertCircle className="h-5 w-5 text-error shrink-0" />
              <p className="text-sm text-on-error-container font-medium">{error}</p>
            </div>
          )}
        </section>

        {/* Side Panel */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Security Info */}
          <div className="bg-white rounded-2xl p-6 border border-outline-variant flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="h-32 w-32" />
            </div>
            <h3 className="text-xl font-display font-bold text-on-surface mb-2 relative z-10">How it works</h3>
            <ol className="text-sm text-on-surface-variant leading-relaxed relative z-10 space-y-2 list-decimal list-inside">
              <li>Upload your medical PDF</li>
              <li>Claude reads and extracts health data</li>
              <li>Dashboard fills with your vitals and markers</li>
              <li>Chat with the AI about your report</li>
            </ol>
          </div>

          {/* AI Disclosure */}
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">AI Assistant · Not Medical Advice</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              This tool uses Claude AI to summarize your report in plain language. It does not diagnose conditions or replace your doctor's judgment.
            </p>
          </div>
        </section>

        {/* Recent Reports Table */}
        <section className="lg:col-span-12 bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 bg-surface-container-low/50 border-b border-outline-variant">
            <h2 className="text-xl font-display font-bold text-on-surface">Recent Reports</h2>
          </div>
          <div className="overflow-x-auto">
            {report ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container border-b border-outline-variant">
                    <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Document</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Date</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Source</th>
                    <th className="py-4 px-6 text-[10px] font-bold text-outline-variant uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-5 px-6 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{report.reportMeta.reportType ?? 'Medical Report'}</p>
                        <p className="text-xs text-on-surface-variant">{report.patient.name ?? 'Unknown patient'}</p>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-on-surface-variant font-medium">{report.reportMeta.reportDate ?? '—'}</td>
                    <td className="py-5 px-6 text-on-surface-variant font-medium">{report.reportMeta.labOrHospital ?? '—'}</td>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Analyzed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <p className="text-on-surface-variant text-sm">No reports uploaded yet. Upload a PDF above to get started.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
