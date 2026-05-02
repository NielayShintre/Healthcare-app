import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  FileText, 
  MessageCircle, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { storage } from './lib/storage';

// Screens
import DashboardScreen from './components/screens/DashboardScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import ReportsScreen from './components/screens/ReportsScreen';
import ChatScreen from './components/screens/ChatScreen';
import MarkersHistoryScreen from './components/screens/MarkersHistoryScreen';

// Types
import type { View, PatientData, MedicalReport, LabResult } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const storedPatient = await storage.get<PatientData>('patient_profile');
      const storedReports = await storage.get<MedicalReport[]>('medical_reports');
      const storedResults = await storage.get<LabResult[]>('lab_results');
      
      if (storedPatient) {
        setPatient(storedPatient);
        setCurrentView('dashboard');
      }
      if (storedReports) setReports(storedReports);
      if (storedResults) setLabResults(storedResults);
      
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleOnboardingComplete = async (data: PatientData) => {
    setPatient(data);
    await storage.set('patient_profile', data);
    setCurrentView('dashboard');
  };

  const enterDemoMode = async () => {
    const demoPatient: PatientData = {
      fullName: "Sarah Jenkins",
      age: "42",
      gender: "Female",
      height: "165",
      weight: "68",
      conditions: ["Type 2 Diabetes", "Hypertension"],
      medications: "Metformin 500mg, Lisinopril 10mg",
      allergies: "Penicillin"
    };
    
    const demoReports: MedicalReport[] = [
      { id: '1', name: 'Apollo_Labs_CBC.pdf', date: 'Apr 12, 2024', source: 'Apollo Diagnostics', status: 'Analyzed', type: 'pdf' },
      { id: '2', name: 'Glucose_Checkup.jpg', date: 'Mar 05, 2024', source: 'Self-Reported', status: 'Analyzed', type: 'image' }
    ];

    const demoResults: LabResult[] = [
      { marker: 'Hemoglobin', value: 11.2, unit: 'g/dL', date: 'Apr 12, 2024', source: 'Apollo Labs', range: '13.0 - 17.5', status: 'Low' },
      { marker: 'Fasting Glucose', value: 105, unit: 'mg/dL', date: 'Mar 05, 2024', source: 'Self-Reported', range: '70 - 99', status: 'High' },
      { marker: 'Cholesterol', value: 185, unit: 'mg/dL', date: 'Apr 12, 2024', source: 'Apollo Labs', range: '< 200', status: 'Normal' }
    ];

    setPatient(demoPatient);
    setReports(demoReports);
    setLabResults(demoResults);
    
    await storage.set('patient_profile', demoPatient);
    await storage.set('medical_reports', demoReports);
    await storage.set('lab_results', demoResults);
    
    setCurrentView('dashboard');
  };

  const handleUpload = async (report: MedicalReport, results: LabResult[]) => {
    const newReports = [report, ...reports];
    const newResults = [...results, ...labResults];
    setReports(newReports);
    setLabResults(newResults);
    await storage.set('medical_reports', newReports);
    await storage.set('lab_results', newResults);
  };

  const handleDeleteReport = async (reportId: string) => {
    // 1. Calculate new state
    const newReports = reports.filter(r => r.id !== reportId);
    const newResults = labResults.filter(r => r.reportId !== reportId);

    // 2. Update UI State synchronously
    setReports(newReports);
    setLabResults(newResults);

    // 3. Update Persistent Storage & Backend asynchronously
    try {
      await Promise.all([
        storage.set('medical_reports', newReports),
        storage.set('lab_results', newResults),
        fetch(`http://localhost:8000/api/reports/${reportId}`, { method: 'DELETE' }).catch(err => console.warn('Backend delete failed:', err))
      ]);
    } catch (error) {
      console.error('Persistence failed:', error);
    }
  };

  const handleNavigateToChat = (message: string) => {
    setChatInitialMessage(message);
    setCurrentView('chat');
  };

  const renderView = () => {
    if (isLoading) return <div className="h-screen flex items-center justify-center text-primary font-bold">Loading your health data...</div>;
    
    switch(currentView) {
      case 'onboarding': return <OnboardingScreen onComplete={handleOnboardingComplete} onDemo={enterDemoMode} />;
      case 'dashboard': return <DashboardScreen onNavigate={setCurrentView} patient={patient} labResults={labResults} />;
      case 'reports': return <ReportsScreen reports={reports} labResults={labResults} onUpload={handleUpload} onDelete={handleDeleteReport} onNavigate={setCurrentView} onAnalyseInChat={handleNavigateToChat} />;
      case 'chat': return <ChatScreen patient={patient} labResults={labResults} initialMessage={chatInitialMessage} onMessageConsumed={() => setChatInitialMessage(null)} />;
      case 'markers': return <MarkersHistoryScreen labResults={labResults} />;
      default: return <DashboardScreen onNavigate={setCurrentView} patient={patient} labResults={labResults} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', label: 'Reports', icon: ClipboardList },
    { id: 'markers', label: 'History', icon: Activity },
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  ];

  const Sidebar = () => (
    <nav className="h-screen w-64 hidden lg:flex flex-col border-r bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-4 space-y-2 shrink-0 sticky top-0">
      <div className="mb-8 px-4 py-2">
        <h1 className="text-xl font-bold font-display text-primary tracking-tight">MedInsight AI</h1>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={cn(
              "w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
              currentView === item.id 
                ? "bg-primary text-white shadow-md" 
                : "text-on-surface-variant hover:bg-slate-100"
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button className="w-full flex items-center px-4 py-2.5 text-on-surface-variant hover:bg-slate-100 rounded-lg text-sm font-medium">
          <HelpCircle className="mr-3 h-5 w-5" />
          Help Center
        </button>
        <button className="w-full flex items-center px-4 py-2.5 text-on-surface-variant hover:bg-slate-100 rounded-lg text-sm font-medium">
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </nav>
  );

  const MobileHeader = () => (
    <header className="fixed top-0 w-full z-50 bg-white dark:bg-slate-900 text-primary border-b border-slate-200 lg:hidden flex justify-between items-center px-6 h-16 shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-bold font-display tracking-tight">MedInsight AI</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <Bell className="h-6 w-6" />
        </button>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
    </header>
  );

  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 lg:hidden bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 pb-safe">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id as View)}
          className={cn(
            "flex flex-col items-center p-2 rounded-xl transition-all",
            currentView === item.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <item.icon className="h-6 w-6" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-on-surface transition-colors selection:bg-primary/10">
      {currentView !== 'onboarding' && <Sidebar />}
      
      {currentView !== 'onboarding' && <MobileHeader />}

      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all",
        currentView !== 'onboarding' ? "mt-16 lg:mt-0 pb-24 lg:pb-0" : ""
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {currentView !== 'onboarding' && <BottomNav />}
    </div>
  );
}
