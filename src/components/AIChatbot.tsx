import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from './FirebaseProvider';
import { usePlan } from '../lib/entitlements';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function AIChatbot() {
  const { tenantId, userProfile } = useAuth();
  const { canUseAI } = usePlan();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && userProfile?.clinicName) {
      setMessages([{
        role: 'model',
        content: `Olá! Sou o assistente de inteligência artificial da ${userProfile.clinicName}. Como posso ajudar com seus pacientes e dados da clínica hoje?`
      }]);
    }
  }, [userProfile?.clinicName, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const fetchClinicContextData = async () => {
    if (!tenantId) return { patients: [], appointments: [] };
    
    try {
      // Get basic stats or context
      const patientsSnap = await getDocs(query(collection(db, 'pacientes'), where('userId', '==', tenantId)));
      const consSnap = await getDocs(query(collectionGroup(db, 'consultas'), where('userId', '==', tenantId)));
      
      const patients = patientsSnap.docs.map(doc => doc.data().nome);
      const appointments = consSnap.docs.map(doc => ({ 
        patientId: doc.data().pacienteId,
        date: doc.data().data, 
        status: doc.data().status || 'Agendada' 
      }));
      
      return { 
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        patientsNames: patients.slice(0, 50).join(', ') // limit context
      };
    } catch (e) {
      console.error(e);
      return {};
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const clinicData = await fetchClinicContextData();
      const clinicContext = `
        Clínica: ${userProfile?.clinicName || 'Nossa Clínica'}
        Total de Pacientes Cadastrados: ${clinicData.totalPatients || 0}
        Total de Consultas no Sistema: ${clinicData.totalAppointments || 0}
        Nomes de alguns pacientes: ${clinicData.patientsNames || 'Nenhum'}
      `;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, text: m.content })),
          context: clinicContext
        })
      });

      if (!response.ok) throw new Error('Falha na API da IA');
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', content: data.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: 'Desculpe, ocorreu um erro ao se comunicar com a IA. Tente novamente mais tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!tenantId) return null; // Don't show if not logged in
  if (!canUseAI) return null; // AI assistant requires a paid plan

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-0 w-14 h-14 bg-apple-blue text-white rounded-full shadow-2xl cursor-pointer hover:bg-blue-600 transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Bot size={28} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-black/10 flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 100px)', height: '540px' }}
          >
            {/* Header */}
            <div className="bg-apple-blue/10 p-4 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-apple-blue">
                <Bot size={24} />
                <h3 className="font-bold">Assistente IA</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:bg-white/50 p-1 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FA]">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-apple-gray text-gray-600' : 'bg-apple-blue text-white'}`}>
                    {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.role === 'user' ? 'bg-apple-blue text-white rounded-tr-none' : 'bg-white border rounded-tl-none shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-apple-blue text-white flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 bg-white border rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t shrink-0">
              <form onSubmit={handleSend} className="relative flex items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte algo ao assistente..."
                  className="pr-12 rounded-xl border-gray-200 focus-visible:ring-apple-blue"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 w-8 h-8 rounded-lg bg-apple-blue hover:bg-blue-600"
                >
                  <Send size={14} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
