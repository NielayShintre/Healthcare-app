/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Upload,
  MessageSquare,
  User,
  LayoutDashboard,
  Plus,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  Search,
  Droplets,
  Activity,
  ArrowRight,
  Download,
  Share2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  History,
  BookOpen,
  Send,
  PlusCircle,
  Home,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import type { View, PatientData } from './types';
import { useReport } from './context/ReportContext';

// Mock data and components will be added here
import OnboardingScreen from './components/screens/OnboardingScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import ReportsScreen from './components/screens/ReportsScreen';
import ChatScreen from './components/screens/ChatScreen';
import MarkersHistoryScreen from './components/screens/MarkersHistoryScreen';

export default function App() {
  const { report } = useReport();
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'reports', label: 'Medical Reports', icon: Upload },
    { id: 'chat', label: 'AI Chatbot', icon: MessageSquare },
    { id: 'markers', label: 'Health Markers', icon: BarChart3 },
  ];

  const renderView = () => {
    switch(currentView) {
      case 'onboarding': return <OnboardingScreen onComplete={() => setCurrentView('reports')} />;
      case 'dashboard': return <DashboardScreen onNavigate={setCurrentView} />;
      case 'reports': return <ReportsScreen onNavigate={setCurrentView} />;
      case 'chat': return <ChatScreen />;
      case 'markers': return <MarkersHistoryScreen onNavigate={setCurrentView} />;
      default: return <DashboardScreen onNavigate={setCurrentView} />;
    }
  };

  const Sidebar = () => (
    <nav className="h-screen w-64 hidden lg:flex flex-col border-r bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-4 space-y-2 shrink-0 sticky top-0">
      <div className="mb-8 px-4 py-2">
        <h1 className="text-xl font-bold font-display text-primary tracking-tight">MedInsight AI</h1>
      </div>

      {currentView !== 'onboarding' && (
        <div className="flex items-center px-4 py-3 mb-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-outline-variant/30">
          <img 
            src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=100&h=100" 
            alt="Doctor Avatar" 
            className="w-10 h-10 rounded-full mr-3 object-cover border border-outline-variant/50"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <p className="font-bold text-primary leading-tight truncate">{report?.patient.name ?? 'No report uploaded'}</p>
            <p className="text-xs text-on-surface-variant truncate">{report?.reportMeta.reportDate ?? 'Upload a report to begin'}</p>
          </div>
        </div>
      )}

      <button 
        onClick={() => setCurrentView('reports')}
        className="w-full bg-primary text-white py-2.5 px-4 rounded-lg font-semibold mb-6 flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        Upload New Report
      </button>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={cn(
              "w-full flex items-center px-4 py-3 rounded-lg duration-200 text-sm font-medium",
              currentView === item.id 
                ? "bg-white dark:bg-slate-800 text-primary font-bold border-r-4 border-primary shadow-sm" 
                : "text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-900"
            )}
          >
            <item.icon className={cn("mr-3 h-5 w-5", currentView === item.id ? "text-primary" : "text-on-surface-variant")} />
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
            "flex flex-col items-center justify-center p-2 min-w-[64px] transition-transform active:scale-90",
            currentView === item.id ? "text-primary" : "text-on-surface-variant"
          )}
        >
          <item.icon className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-surface">
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

