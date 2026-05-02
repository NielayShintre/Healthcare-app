import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  History, 
  BookOpen, 
  PlusCircle, 
  Info,
  AlertCircle,
  BrainCircuit,
  MessageCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { PatientData, LabResult } from '../../types';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  subContent?: {
    title: string;
    items: string[];
  };
  citation?: string;
  isDisclaimer?: boolean;
}

interface ChatScreenProps {
  patient: PatientData | null;
  labResults: LabResult[];
}

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    content: "Hello. I've reviewed your health profile. How can I help you today? I can explain your lab results, discuss health markers, or provide lifestyle suggestions.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isDisclaimer: true
  }
];

export default function ChatScreen({ patient, labResults }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getMockResponse = (input: string) => {
    const lower = input.toLowerCase();
    
    if (lower.includes('hemoglobin') || lower.includes('low') || lower.includes('tired')) {
      return {
        answer: "I noticed your Hemoglobin level is **11.2 g/dL**, which is below the target range for your profile (typically 13.0 - 17.5 g/dL).\n\n**What this means:** Hemoglobin is a protein in your red blood cells that acts like a 'delivery truck' for oxygen. Since your levels are low, your body's tissues aren't receiving as much oxygen as they need. This is a condition called **Anemia**, which is likely why you are feeling fatigued or tired.\n\n**Suggestions:**\n1. **Iron-Rich Foods:** Incorporating more spinach, lentils, or red meat can help your body build more hemoglobin 'delivery trucks'.\n2. **Vitamin C:** Eating citrus fruits alongside iron-rich foods helps your body absorb the iron better.\n3. **Follow-up:** It's important to discuss these results with your doctor to rule out any underlying causes like a vitamin deficiency.",
        citation: "Source: ICMR Clinical Guidelines 2023 on Anemia Management"
      };
    }
    
    if (lower.includes('diabetes') || lower.includes('glucose') || lower.includes('sugar')) {
      return {
        answer: "Your Fasting Glucose is currently **105 mg/dL**, which is categorized as 'Borderline' or 'Pre-diabetic' levels (Normal is typically under 100 mg/dL).\n\n**What this means:** Fasting Glucose measures the amount of sugar in your blood after you haven't eaten for 8 hours. At 105 mg/dL, your body is starting to have a slightly harder time moving sugar out of your blood and into your cells for energy.\n\n**Reason for Monitoring:** Because you have a recorded history of **Type 2 Diabetes**, staying in the target range is crucial to prevent long-term complications in your kidneys and eyes. \n\n**Suggestions:** \n- Continue your Metformin as prescribed.\n- Try a 10-minute walk after meals to help your muscles use up that extra blood sugar naturally.",
        citation: "Source: American Diabetes Association (ADA) 2024 Standards"
      };
    }

    if (lower.includes('hypertension') || lower.includes('blood pressure') || lower.includes('pressure')) {
      return {
        answer: "Your blood pressure was recently recorded at **135/85 mmHg**. \n\n**What this means:** The top number (Systolic) represents the pressure when your heart beats, and the bottom number (Diastolic) is the pressure when your heart rests. A level of 135/85 is considered 'Stage 1 Hypertension'.\n\n**Reasoning:** High blood pressure puts extra 'wear and tear' on your blood vessels over time. Since you are already taking **Lisinopril**, this reading suggests we should monitor if your current dosage or lifestyle is managing the pressure effectively.\n\n**Suggestion:** Reducing salt intake can help lower the fluid volume in your blood vessels, effectively 'lowering the pressure' in the pipes.",
        citation: "Source: AHA/ACC Hypertension Clinical Practice Guidelines"
      };
    }

    return {
      answer: "I'm looking at your health profile, including your history of " + (patient?.conditions?.join(', ') || 'health markers') + ". \n\nI can explain the reasoning behind any of your lab results or help you understand what a specific medical term means. For example, would you like to know more about your Hemoglobin or Fasting Glucose trends?",
      citation: "Source: MediLens Clinical Intelligence Engine"
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;
    
    const userText = inputValue;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const patientContext = {
        age: patient?.age || 0,
        sex: patient?.sex || "unknown",
        weight: patient?.weight,
        height: patient?.height,
        conditions: patient?.conditions || [],
        medications: patient?.medications || "",
        allergies: patient?.allergies || ""
      };

      const response = await fetch('http://localhost:8000/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          patient_context: patientContext,
          reports: [],
          conversation_history: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citation: data.citation
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Backend responded with error');
      }
    } catch (error) {
      console.warn('Backend unavailable, using frontend mock response:', error);
      
      setTimeout(() => {
        const mockData = getMockResponse(userText);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: mockData.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citation: mockData.citation
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
      return;
    } finally {
      // Typing state handled in success/error branches
    }
    
    setIsTyping(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-40px)] flex overflow-hidden">
      {/* Side Context Panel */}
      <aside className="hidden md:flex flex-col w-80 border-r border-outline-variant bg-white p-6 overflow-y-auto shrink-0 z-10 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-on-surface">Patient Context</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Insights driving this conversation.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low p-5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 mb-3 text-primary font-bold text-xs uppercase tracking-widest">
              <History className="h-4 w-4" />
              Recent History
            </div>
            <p className="text-sm text-on-surface leading-relaxed">
              {patient?.conditions?.length ? `Known conditions: ${patient.conditions.join(', ')}.` : 'No known chronic conditions.'}
              {patient?.medications && ` Current medications: ${patient.medications}.`}
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">Areas of Focus</h3>
            <div className="flex flex-wrap gap-2">
              {patient?.conditions?.map(c => (
                <span key={c} className="px-3 py-1.5 bg-error-container text-on-error-container rounded-lg text-[10px] font-bold border border-error-container/30">{c}</span>
              ))}
              {labResults.slice(0, 2).map(r => (
                <span key={r.marker} className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg text-[10px] font-bold border border-outline-variant/30">{r.marker}</span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col bg-surface overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-32"
        >
          <div className="max-w-3xl mx-auto w-full space-y-8">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-start gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm overflow-hidden",
                  msg.role === 'ai' ? "bg-primary-container text-white border-transparent" : "bg-white border-outline-variant"
                )}>
                  {msg.role === 'ai' ? (
                    <BrainCircuit className="h-5 w-5" />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.fullName || 'U')}&background=00455d&color=fff`}
                      alt="User" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                <div className={cn("flex-1 space-y-2", msg.role === 'user' ? "text-right" : "")}>
                  <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">
                    {msg.role === 'ai' ? 'MedInsight AI' : 'You'} · {msg.timestamp}
                  </div>
                  
                  <div className={cn(
                    "p-5 rounded-2xl relative shadow-sm max-w-[90%]",
                    msg.role === 'ai' 
                      ? "bg-white border border-outline-variant/50 rounded-tl-none ml-0 mr-auto" 
                      : "bg-primary text-white rounded-tr-none ml-auto mr-0 text-left"
                  )}>
                    <div className="prose prose-sm max-w-none text-inherit leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {msg.citation && (
                      <div className="mt-5 pt-4 border-t border-outline-variant/30">
                         <h6 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                           <BookOpen className="h-3 w-3" />
                           Clinical Evidence
                         </h6>
                         <p className="text-[11px] text-on-surface-variant italic leading-normal">
                           {msg.citation}
                         </p>
                      </div>
                    )}

                    {msg.isDisclaimer && (
                      <div className="mt-6 p-3 bg-surface-container-high rounded-xl border border-primary/5 flex items-start gap-3">
                         <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                         <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed text-left">
                            <strong>Medical Disclaimer:</strong> This AI provides informational support only. Always consult a licensed physician for medical advice, diagnosis, or treatment.
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border bg-primary-container text-white border-transparent">
                  <BrainCircuit className="h-5 w-5 animate-pulse" />
                </div>
                <div className="bg-white border border-outline-variant/50 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">AI is thinking...</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-outline-variant p-4 z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            <div className="flex items-center bg-surface-container p-2 rounded-2xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary transition-all shadow-sm">
              <button className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-white rounded-xl transition-all">
                <PlusCircle className="h-5 w-5" />
              </button>
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about symptoms, lab results, or treatments..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 px-2 placeholder-outline-variant"
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-md flex items-center justify-center",
                  (inputValue.trim() && !isTyping) ? "bg-primary text-white scale-100" : "bg-surface-container-high text-outline-variant scale-95"
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center text-[10px] font-medium text-outline-variant pb-2">
              MedInsight AI can make mistakes. Always verify critical medical information with your provider.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
