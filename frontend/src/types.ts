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
  status: 'Analyzed' | 'Processing' | 'Pending';
  type: 'pdf' | 'image';
  url?: string;
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
  value: number | string;
  unit: string;
  date: string;
  source: string;
  range: string;
  status: 'High' | 'Normal' | 'Borderline' | 'Low';
  reportId?: string;
}
