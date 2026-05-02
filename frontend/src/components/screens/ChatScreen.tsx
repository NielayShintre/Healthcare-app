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
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

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

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    content: "Hello. I've reviewed the latest lipid panel results. I notice the LDL levels are slightly elevated compared to the previous baseline.\n\nWould you like me to translate these lab values into layman's terms or provide dietary suggestions based on current clinical guidelines?",
    timestamp: '10:00 AM',
    isDisclaimer: true
  },
  {
    id: '2',
    role: 'user',
    content: 'Yes, please explain what the LDL numbers mean simply, and what foods I should avoid.',
    timestamp: '10:01 AM'
  },
  {
    id: '3',
    role: 'ai',
    content: "### Understanding LDL (The \"Bad\" Cholesterol)\n\nThink of LDL cholesterol like plaque in a pipe. If too much of it builds up, it can narrow the pipes (your blood vessels) and make it harder for blood to flow smoothly. Your recent score was **135 mg/dL**, which is considered borderline high.",
    timestamp: '10:01 AM',
    subContent: {
      title: 'Health Improvement Suggestions',
      items: [
        'Reduce Saturated Fats: Cut back on red meat, full-fat dairy, and fried foods.',
        'Increase Soluble Fiber: Add oats, beans, and fruits like apples to your diet.',
        'Stay Active: Aim for 30 minutes of moderate walking daily.'
      ]
    },
    citation: 'AHA/ACC 2018 Guidelines on the Management of Blood Cholesterol. Recommendation: Lifestyle modification is the first line of defense for borderline LDL elevation.'
  }
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMsg]);
    setInputValue('');
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Side Context Panel */}
      <aside className="hidden md:flex flex-col w-80 border-r border-outline-variant bg-white p-6 overflow-y-auto shrink-0 z-10 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-on-surface">Patient Context</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Insights driving this conversation.</p>
        </div>

        <div className="space-y-6">
          {/* History Snippet */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 mb-3 text-primary font-bold text-xs uppercase tracking-widest">
              <History className="h-4 w-4" />
              Recent History
            </div>
            <p className="text-sm text-on-surface leading-relaxed">
              Elevated blood pressure noted in last 3 visits. Ongoing prescription for **Lisinopril 10mg**.
            </p>
          </div>

          {/* Focus Areas */}
          <div>
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">Areas of Focus</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-error-container text-on-error-container rounded-lg text-[10px] font-bold border border-error-container/30">Hypertension</span>
              <span className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg text-[10px] font-bold border border-outline-variant/30">Lipid Panel</span>
              <span className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg text-[10px] font-bold border border-outline-variant/30">Dietary Habits</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col bg-surface overflow-hidden relative">
        {/* Messages Scroll Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-40"
        >
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start max-w-3xl mx-auto w-full gap-4",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm overflow-hidden",
                msg.role === 'ai' ? "bg-primary-container text-white border-transparent" : "bg-white border-outline-variant"
              )}>
                {msg.role === 'ai' ? (
                  <BrainCircuit className="h-5 w-5" />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100" 
                    alt="User" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Content */}
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
                  {/* Markdown or Plain Text */}
                  <div className="prose prose-sm max-w-none text-inherit leading-relaxed">
                    {msg.content.split('\n\n').map((para, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {para.startsWith('###') ? <strong className="text-lg block mb-2">{para.replace('### ', '')}</strong> : para}
                      </p>
                    ))}
                  </div>

                  {/* Sub Content (Cards/Items) */}
                  {msg.subContent && (
                    <div className="mt-4 p-4 bg-surface-container rounded-xl border border-outline-variant/30 text-on-surface">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                        {msg.subContent.title}
                      </h5>
                      <ul className="space-y-2">
                        {msg.subContent.items.map((item, i) => (
                          <li key={i} className="text-xs font-medium flex items-start gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Citation */}
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

                  {/* AI Disclaimer */}
                  {msg.isDisclaimer && (
                    <div className="mt-6 p-3 bg-surface-container-high rounded-xl border border-primary/5 flex items-start gap-3">
                       <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                       <p className="text-[10px] font-medium text-on-surface-variant leading-relaxed">
                          <strong>Medical Disclaimer:</strong> This AI provides informational support only. Always consult a licensed physician for medical advice, diagnosis, or treatment.
                       </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-md flex items-center justify-center",
                  inputValue.trim() ? "bg-primary text-white scale-100" : "bg-surface-container-high text-outline-variant scale-95"
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
