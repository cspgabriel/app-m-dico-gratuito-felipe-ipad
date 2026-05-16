import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, MapPin, Video, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../components/FirebaseProvider';

const MOCK_EVENTS = [
  { id: 1, patient: 'Ana Silva', time: '09:00', duration: 30, type: 'Primeira Consulta', status: 'confirmed', location: 'Presencial' },
  { id: 2, patient: 'Carlos Santos', time: '10:00', duration: 45, type: 'Retorno', status: 'pending', location: 'Telemedicina' },
  { id: 3, patient: 'Maria Oliveira', time: '14:30', duration: 30, type: 'Exame de Rotina', status: 'confirmed', location: 'Presencial' },
  { id: 4, patient: 'João Pedro', time: '16:00', duration: 60, type: 'Procedimento', status: 'confirmed', location: 'Presencial' },
];

export default function AgendaPage() {
  const { userProfile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handleIntegrateGoogle = () => {
    alert('Integração com Google Calendar será aberta em uma nova janela.');
    // Real implementation would open standard Google OAuth flow snippet here
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Agenda</h2>
          <p className="text-gray-500 font-medium mt-1">Gerencie seus horários e consultas</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="rounded-xl gap-2 font-bold border-2"
            onClick={handleIntegrateGoogle}
          >
            <CalendarDays size={18} />
            Integrar Google Calendar
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-500/20 font-bold">
            <Plus size={18} />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Calendar View Container */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* Sidebar / Mini Calendar */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-100 p-6 bg-gray-50/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-gray-900">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
            </h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentDate(addDays(currentDate, -1))}>
                <ChevronLeft size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex justify-center items-center h-64 text-gray-400 text-sm font-medium">
            [Mini Calendário Mensal Aqui]
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-widest">Opções</h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" defaultChecked />
              <span className="text-sm font-medium text-gray-700">Minhas Consultas</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" defaultChecked />
              <span className="text-sm font-medium text-gray-700">Procedimentos</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
              <span className="text-sm font-medium text-gray-700">Agenda da Equipe</span>
            </label>
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="flex-1 p-6 lg:p-8 bg-white relative">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-gray-900">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
          </div>

          <div className="relative">
            {/* Timeline Lines */}
            <div className="absolute top-0 bottom-0 left-16 w-px bg-gray-100"></div>

            <div className="space-y-6">
              {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((hour) => {
                const events = MOCK_EVENTS.filter(e => e.time.startsWith(hour.split(':')[0]));
                
                return (
                  <div key={hour} className="flex relative">
                    <div className="w-16 pt-2 text-xs font-bold tracking-wider text-gray-400">
                      {hour}
                    </div>
                    <div className="flex-1 pl-6 relative min-h-[4rem]">
                      <div className="absolute top-4 left-0 right-0 border-t border-dashed border-gray-100 -z-10"></div>
                      
                      {events.map((event, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={event.id}
                          className={`mt-2 p-4 rounded-2xl border flex flex-col gap-2 ${
                            event.status === 'confirmed' 
                              ? 'bg-blue-50 border-blue-100 text-blue-900' 
                              : 'bg-amber-50 border-amber-100 text-amber-900'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold">{event.patient}</span>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                              event.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {event.status === 'confirmed' ? 'Confirmado' : 'Aguardando'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs font-medium opacity-80">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              {event.time} ({event.duration}min)
                            </div>
                            <div className="flex items-center gap-1">
                              {event.location === 'Telemedicina' ? <Video size={14} /> : <MapPin size={14} />}
                              {event.location}
                            </div>
                            <div className="flex items-center gap-1 font-bold">
                              • {event.type}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {events.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 group transition-opacity">
                           <button className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2">
                             <Plus size={14} /> Adicionar Horário
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
