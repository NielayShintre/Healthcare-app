import React, { createContext, useContext, useState } from 'react';
import type { ReportAnalysis } from '../types';

const STORAGE_KEY = 'medinsight_report';

type ReportContextValue = {
  report: ReportAnalysis | null;
  setReport: (r: ReportAnalysis) => void;
};

const ReportContext = createContext<ReportContextValue | null>(null);

export function ReportProvider({ children }: { children: React.ReactNode }) {
  const [report, setReportState] = useState<ReportAnalysis | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as ReportAnalysis) : null;
    } catch {
      return null;
    }
  });

  const setReport = (r: ReportAnalysis) => {
    setReportState(r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  };

  return (
    <ReportContext.Provider value={{ report, setReport }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport(): ReportContextValue {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error('useReport must be used within ReportProvider');
  return ctx;
}
