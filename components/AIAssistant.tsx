
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Mic, MicOff, MessageSquare, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { PLRequest, StaffBalance, UserSession } from '../types';

interface Props {
  requests: PLRequest[];
  balances: StaffBalance[];
  currentUser: UserSession | null;
}

const AIAssistant: React.FC<Props> = ({ requests, balances, currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AISC OTL Concierge. How can I assist you with your Professional Learning journey or fund tracking today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
        YOU ARE: The AISC OTL Intelligent Concierge.
        YOUR CONTEXT: An internal Professional Learning (PL) and Fund Tracking system for the American International School Chennai (AISC).
        
        CURRENT DATA ENVIRONMENT:
        - Active User: ${currentUser ? `${currentUser.name} (${currentUser.role})` : 'Anonymous'}
        - User Email: ${currentUser?.email}
        - Total Global Staff: ${balances.length}
        - System Requests: ${requests.length}
        - Data Dump: ${JSON.stringify({ requests, balances })}

        CORE OPERATING PRINCIPLES:
        1. DATA FIDELITY: Only answer based on the provided JSON data. If a user asks "What is my balance?", find the record matching "${currentUser?.email}".
        2. AISC SPECIFICITY: Refer to school sections (ES, MS, HS) and roles (Teacher, TA, Coach).
        3. APPROVAL KNOWLEDGE: 
           - Stage 1: PENDING (Needs Supervisor Approval).
           - Stage 2: SUPERVISOR_APPROVED (Needs OTL Director Approval).
           - Stage 3: FULLY_APPROVED (Ready for Finance processing).
        4. FISCAL ADVICE: If a user asks if they can afford an activity, calculate: (Current Balance - Total Cost of all PENDING requests) vs (Price of new activity).
        5. TONE: Professional, efficient, encouraging, and supportive of faculty development. Use Markdown for formatting (bolding, lists).
        
        EXAMPLE RESPONSES:
        - "Your current balance is **$1,200**. You have one pending request (**REQ-1022**) for **$300**, which leaves you with **$900** for future use."
        - "Request **REQ-4452** has been approved by your supervisor and is currently with the OTL Director (Joel B) for final authorization."

        LIMITATIONS:
        - Do not hallucinate data not present in the system.
        - If a request isn't found, ask for the ID (e.g., REQ-XXXX).
        - Direct complex policy questions to the Office of Teaching and Learning (OTL).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction,
          temperature: 0.3, // Lower temperature for higher data accuracy
        },
      });

      const aiText = response.text || "I'm sorry, I'm having trouble accessing the OTL records right now. Please try again or refresh the page.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Connectivity Error: I am unable to reach the OTL Intelligence Layer. Please ensure your API key is valid." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-indigo-700 p-4 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest">AISC OTL AI</h3>
                <p className="text-[10px] opacity-80 font-bold">Intelligent Concierge Active</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-medium leading-relaxed prose prose-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200 rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning Records...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your balance or a request..."
                className="flex-grow bg-slate-100 px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-xl transition shadow-md ${
                  !input.trim() || isLoading ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-90'
                }`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-90 group relative"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
          <Bot size={28} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-xl">
             AISC OTL Assistant
          </span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
