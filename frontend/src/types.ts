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
