import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ClipboardList, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  
  const conditions = [
    'Hypertension', 'Type 2 Diabetes', 'Asthma', 'None'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-surface">
      {/* Top Bar for Mobile */}
      <div className="fixed top-0 left-0 w-full px-6 h-16 flex items-center justify-center bg-white shadow-sm z-50 border-b border-outline-variant/30 lg:hidden font-display">
        <span className="font-bold text-primary tracking-tight">MedInsight AI</span>
      </div>

      <motion.main 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl mt-16 lg:mt-0 bg-white rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        {/* Left Panel */}
        <div className="w-full md:w-5/12 bg-primary-container relative overflow-hidden flex flex-col p-8 text-white">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=600" 
              alt="Medical background"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">Patient Profile Setup</h2>
              <p className="text-on-primary-container text-lg leading-relaxed">Please provide accurate information to help us tailor your diagnostic experience.</p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="text-sm font-medium">HIPAA Compliant Secure Data</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-outline uppercase tracking-widest">Step {step} of 3</span>
              <span className="text-xs font-bold text-primary uppercase">Basic Vitals</span>
            </div>
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(step / 3) * 100}%` }}
                className="bg-primary h-full rounded-full"
              />
            </div>
          </div>

          <form className="space-y-6 flex-1" onSubmit={(e) => { e.preventDefault(); onComplete(); }}>
            <div className="space-y-6">
              <h3 className="text-2xl font-display font-bold text-on-surface">Personal Information</h3>
              
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Full Legal Name</label>
                <input 
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-outline-variant"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Age</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
                    placeholder="e.g. 34"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Biological Sex</label>
                  <select 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="f">Female</option>
                    <option value="m">Male</option>
                    <option value="o">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold text-on-surface">Physical Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Height (cm)</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 pr-12 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                    placeholder="170"
                    required
                  />
                  <span className="absolute right-4 bottom-3.5 text-xs font-bold text-outline uppercase">cm</span>
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">Weight (kg)</label>
                  <input 
                    type="number"
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 pr-12 text-on-surface focus:ring-2 focus:ring-primary outline-none"
                    placeholder="65"
                    required
                  />
                  <span className="absolute right-4 bottom-3.5 text-xs font-bold text-outline uppercase">kg</span>
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/30" />

            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold text-on-surface">Known Conditions</h3>
              <div className="flex flex-wrap gap-2">
                {conditions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="px-4 py-2 rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors active:bg-primary-container active:text-white"
                  >
                    {item}
                  </button>
                ))}
                <button 
                  type="button"
                  className="px-4 py-2 rounded-full border border-dashed border-outline text-outline text-sm font-medium hover:bg-surface-container-low transition-colors flex items-center gap-1"
                >
                  + Add Other
                </button>
              </div>
            </div>

            <div className="pt-6 mt-auto flex justify-end gap-3">
              <button 
                type="button"
                className="px-6 py-3 rounded-xl font-bold text-primary hover:bg-surface-container transition-colors"
                onClick={onComplete}
              >
                Skip 
              </button>
              <button 
                type="submit"
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold flex items-center gap-2 hover:bg-primary-container transition-all shadow-md group"
              >
                Continue to History
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </motion.main>
    </div>
  );
}
