import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  PlusCircle,
  AlertCircle,
  BrainCircuit,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';
import { useReport } from '../../context/ReportContext';
import type { ReportAnalysis } from '../../types';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
  isDisclaimer?: boolean;
}

function buildFirstMessage(report: ReportAnalysis): Message {
  let content = `Hello! I've reviewed your medical report${report.patient.name ? ` for **${report.patient.name}**` : ''}. Here's a brief overview:\n\n${report.summary}`;

  if (report.focusAreas.length > 0) {
    content += `\n\n**Key areas to discuss with your doctor:**\n${report.focusAreas.map(a => `- ${a}`).join('\n')}`;
  }

  if (report.redFlags.length > 0) {
    content += `\n\n**⚠️ Items requiring attention:**\n${report.redFlags.map(f => `- ${f}`).join('\n')}`;
  }

  content += '\n\nFeel free to ask me anything about your report. I\'m here to help you understand your results.';

  return {
    id: 'init',
    role: 'ai',
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isDisclaimer: true
  };
}

function TypingIndicator() {
  return (
    <div className="flex items-start max-w-3xl mx-auto w-full gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-sm bg-primary-container text-white border-transparent">
        <BrainCircuit className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1">
          MedInsight AI · typing
        </div>
        <div className="p-5 rounded-2xl bg-white border border-outline-variant/50 rounded-tl-none shadow-sm inline-flex gap-1.5 items-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatScreen() {
  const { report } = useReport();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (report && messages.length === 0) {
      setMessages([buildFirstMessage(report)]);
    }
  }, [report]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || !report || isLoading) return;

    const text = inputValue.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Build conversation history (exclude the synthetic init message)
    const history = messages
      .filter(m => m.id !== 'init')
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, report, history })
      });

      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const data = await resp.json() as { reply?: string; error?: string };
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.reply ?? 'Sorry, I could not generate a response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error connecting to the server. Please check that the server is running and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center bg-surface">
        <div className="text-center space-y-4 p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">No report uploaded</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Upload a medical report first to start chatting with MedInsight AI about your health data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Side Context Panel */}
      <aside className="hidden md:flex flex-col w-80 border-r border-outline-variant bg-white p-6 overflow-y-auto shrink-0 z-10 shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-display font-bold text-on-surface">Patient Context</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Insights driving this conversation.</p>
        </div>

        <div className="space-y-6">
          {/* Report Meta */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 mb-3 text-primary font-bold text-xs uppercase tracking-widest">
              <FileText className="h-4 w-4" />
              Report Info
            </div>
            <div className="space-y-1 text-sm text-on-surface">
              {report.reportMeta.reportType && (
                <p><span className="text-on-surface-variant text-xs">Type: </span>{report.reportMeta.reportType}</p>
              )}
              {report.reportMeta.labOrHospital && (
                <p><span className="text-on-surface-variant text-xs">Source: </span>{report.reportMeta.labOrHospital}</p>
              )}
              {report.reportMeta.reportDate && (
                <p><span className="text-on-surface-variant text-xs">Date: </span>{report.reportMeta.reportDate}</p>
              )}
            </div>
          </div>

          {/* Red Flags */}
          {report.redFlags.length > 0 && (
            <div className="bg-error-container/30 p-5 rounded-2xl border border-error-container">
              <div className="flex items-center gap-2 mb-3 text-error font-bold text-xs uppercase tracking-widest">
                <AlertTriangle className="h-4 w-4" />
                Attention Required
              </div>
              <ul className="space-y-1.5">
                {report.redFlags.map((flag, i) => (
                  <li key={i} className="text-xs text-on-surface flex items-start gap-2">
                    <div className="w-1 h-1 bg-error rounded-full mt-1.5 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Focus Areas */}
          {report.focusAreas.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">Areas of Focus</h3>
              <div className="flex flex-wrap gap-2">
                {report.focusAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg text-[10px] font-bold border border-outline-variant/30">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diagnoses */}
          {report.diagnoses.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">Diagnoses</h3>
              <div className="flex flex-wrap gap-2">
                {report.diagnoses.map((d, i) => (
                  <span key={i} className="px-3 py-1.5 bg-error-container text-on-error-container rounded-lg text-[10px] font-bold border border-error-container/30">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Medications */}
          {report.medications.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3">Medications</h3>
              <ul className="space-y-1">
                {report.medications.map((med, i) => (
                  <li key={i} className="text-xs text-on-surface flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full shrink-0" />
                    {med}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col bg-surface overflow-hidden relative">
        {/* Messages Scroll Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-40"
        >
          <AnimatePresence initial={false}>
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
                    {msg.role === 'ai' ? (
                      <div className="prose prose-sm max-w-none leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}

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
          </AnimatePresence>

          {isLoading && <TypingIndicator />}
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-outline-variant p-4 z-20">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            <div className="flex items-center bg-surface-container p-2 rounded-2xl border border-outline-variant focus-within:ring-2 focus-within:ring-primary transition-all shadow-sm">
              <button className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-white rounded-xl transition-all">
                <PlusCircle className="h-5 w-5" />
              </button>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about symptoms, lab results, or treatments..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 px-2 placeholder-outline-variant disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={cn(
                  "p-3 rounded-xl transition-all shadow-md flex items-center justify-center",
                  inputValue.trim() && !isLoading ? "bg-primary text-white scale-100" : "bg-surface-container-high text-outline-variant scale-95"
                )}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-center text-[10px] font-medium text-outline-variant pb-2">
              MedInsight AI · Not medical advice · AI Assistant
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
