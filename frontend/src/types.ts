export type View = 'onboarding' | 'dashboard' | 'reports' | 'chat' | 'markers';

export interface PatientData {
  fullName: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  conditions: string[];
}

export interface MedicalReport {
  id: string;
  name: string;
  date: string;
  source: string;
  status: 'Analyzed' | 'Processing';
  type: 'pdf' | 'image';
}

export interface VitalMetric {
  label: string;
  value: string;
  unit: string;
  status: 'Normal' | 'Elevated' | 'Caution';
  icon: string;
}

export interface LabResult {
  marker: string;
  value: number;
  unit: string;
  date: string;
  source: string;
  range: string;
  status: 'High' | 'Normal' | 'Borderline';
}

export type ReportAnalysis = {
  patient: { name: string | null; age: number | null; sex: 'male' | 'female' | 'other' | null };
  reportMeta: { labOrHospital: string | null; reportDate: string | null; reportType: string | null };
  summary: string;
  vitals: Array<{ label: string; value: string; unit: string; status: 'Normal' | 'Elevated' | 'Caution' }>;
  markers: Array<{
    name: string;
    category: 'lipids' | 'metabolic' | 'liver' | 'thyroid' | 'cbc' | 'minerals' | 'inflammation' | 'vitals' | 'other';
    value: number;
    unit: string;
    referenceRange: { low: number | null; high: number | null; text: string };
    status: 'Normal' | 'Borderline' | 'High' | 'Low' | 'Critical';
    layExplanation: string;
  }>;
  findings: string[];
  diagnoses: string[];
  medications: string[];
  focusAreas: string[];
  redFlags: string[];
};
