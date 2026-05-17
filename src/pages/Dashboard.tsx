import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot, collectionGroup } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Paciente } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Users, Calendar, Activity, TrendingUp, PlusCircle, Lock, Crown, ChevronRight, FileText, Sparkles, BrainCircuit, CalendarCheck, CalendarX, CalendarClock, Clock, MapPin, Video } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function Dashboard() {
  const { user, userProfile, tenantId } = useAuth();
  const [recentPatients, setRecentPatients] = useState<Paciente[]>([]);
  const [allPatients, setAllPatients] = useState<Paciente[]>([]);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const navigate = useNavigate();

  const plan = userProfile?.plan || 'basico';

  useEffect(() => {
    if (!tenantId) return;

    const patientsQuery = query(
      collection(db, 'pacientes'),
      where('userId', '==', tenantId)
    );
    const unsubP = onSnapshot(patientsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAllPatients(docs);
      setRecentPatients(docs.slice(0, 5));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pacientes');
    });

    const unsubC = onSnapshot(
      query(collectionGroup(db, 'consultas'), where('userId', '==', tenantId)),
      (snap) => setConsultas(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))),
      (err) => console.error(err)
    );

    const unsubA = onSnapshot(
      query(collection(db, 'agendamentos'), where('userId', '==', tenantId)),
      (snap) => setAgendamentos(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))),
      (err) => console.error(err)
    );

    return () => { unsubP(); unsubC(); unsubA(); };
  }, [tenantId]);

  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);

  const inMonth = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    return d >= monthStart && d < monthEnd;
  };

  const realizadasMes = consultas.filter(c => inMonth(c.data)).length;
  const agendadasMes = agendamentos.filter(a => inMonth(a.data) && a.status !== 'cancelled').length;
  const desmarcadasMes = agendamentos.filter(a => inMonth(a.data) && a.status === 'cancelled').length;
  const totalPacientes = allPatients.length;

  const patientName = (id: string) => allPatients.find(p => p.id === id)?.nome || 'Paciente';

  const now = new Date();
  const upcoming = [
    ...agendamentos
      .filter(a => a.data && new Date(a.data) >= new Date(now.toDateString()) && a.status !== 'cancelled')
      .map(a => ({
        id: a.id,
        pacienteId: a.pacienteId,
        start: new Date(a.data),
        duracao: a.duracao ?? 30,
        tipo: a.tipo || 'Consulta',
        local: a.local || 'Presencial',
        source: 'agendamento' as const,
      })),
    ...consultas
      .filter(c => c.data && new Date(c.data) >= new Date(now.toDateString()))
      .map(c => ({
        id: c.id,
        pacienteId: c.pacienteId,
        start: new Date(c.data),
        duracao: 30,
        tipo: 'Consulta realizada',
        local: 'Presencial' as const,
        source: 'consulta' as const,
      })),
  ]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const monthLabel = monthStart
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

  return (
    <div className="space-y-4 lg:space-y-8 pb-10">
      <header className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-3 xl:gap-6 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 md:p-6 xl:p-8 rounded-2xl md:rounded-[28px] xl:rounded-[32px] border border-blue-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mb-32"></div>

        <div className="relative z-10 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl xl:text-4xl font-black tracking-tight text-gray-900 break-words">Olá, Dr(a). {userProfile?.name?.split(' ')[0] || user?.email?.split('@')[0]}</h2>
            {plan === 'basico' ? (
               <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-max">
                 Plano Básico
               </span>
            ) : (
               <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm w-max">
                 <Crown size={12} /> {plan}
               </span>
            )}
          </div>
          <p className="hidden xl:block text-base xl:text-lg text-gray-600 font-medium">Aqui está o resumo da sua clínica hoje.</p>
        </div>
        <div className="grid grid-cols-2 xl:flex xl:flex-row gap-2 relative z-10 w-full xl:w-auto">
          {plan === 'basico' && (
            <Button variant="outline" className="w-full rounded-xl border-2 border-amber-400 text-amber-600 hover:bg-amber-50 h-10 xl:h-12 px-2 xl:px-6 font-bold flex flex-col xl:flex-row gap-0.5 xl:gap-2 justify-center items-center text-[11px] xl:text-sm">
              <Crown size={16} />
              <span>Upgrade</span>
            </Button>
          )}
          <Link to="/patients">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 xl:h-12 px-2 xl:px-6 shadow-lg shadow-blue-500/25 font-bold flex flex-col xl:flex-row gap-0.5 xl:gap-2 justify-center items-center text-[11px] xl:text-sm">
              <PlusCircle size={16} />
              <span className="truncate">Paciente</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Quick access */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/patients">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 active:scale-[0.98] transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 leading-tight">Pacientes</p>
              <p className="text-[11px] text-gray-500 font-medium">Ver lista</p>
            </div>
          </div>
        </Link>
        <Link to="/consultations">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3 active:scale-[0.98] transition shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 leading-tight">Consultas</p>
              <p className="text-[11px] text-gray-500 font-medium">Ver histórico</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Agenda — mobile-first (above stats) */}
      <div className="lg:hidden">
        <AgendaBlock
          monthLabel={monthLabel}
          upcoming={upcoming}
          patientName={patientName}
          onOpen={() => navigate('/agenda')}
        />
      </div>

      <div className="flex items-end justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">
          Visão de {monthLabel}
        </h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <StatCard
          icon={Users}
          label="Total Pacientes"
          value={totalPacientes.toString()}
          color="blue"
          limit={plan === 'basico' ? '50 max' : 'Ilimitado'}
        />
        <StatCard
          icon={CalendarCheck}
          label="Realizadas"
          value={realizadasMes.toString()}
          color="emerald"
        />
        <StatCard
          icon={CalendarX}
          label="Desmarcadas"
          value={desmarcadasMes.toString()}
          color="amber"
        />
        <StatCard
          icon={CalendarClock}
          label="Agendadas"
          value={agendadasMes.toString()}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Section Produtividade & IA */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <PremiumFeatureCard 
                 title="Anamnese com IA"
                 description="Deixe a inteligência artificial gerar resumos perfeitos a partir da sua voz."
                 icon={BrainCircuit}
                 isLocked={plan === 'basico'}
                 color="indigo"
                 onClick={() => navigate('/patients')}
              />
              <PremiumFeatureCard 
                 title="Faturamento Automático"
                 description="Gere guias TISS/TUSS com um clique."
                 icon={FileText}
                 isLocked={plan === 'basico'}
                 color="emerald"
                 onClick={() => navigate('/billing')}
              />
           </div>

           <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
             <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
               <CardTitle className="text-2xl font-black text-gray-900">Pacientes Recentes</CardTitle>
               <Link to="/patients" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">Ver todos <ChevronRight size={16}/></Link>
             </CardHeader>
             <CardContent className="p-0">
               {recentPatients.length > 0 ? (
                 <div className="divide-y divide-gray-100">
                   {recentPatients.map((p, i) => (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.05 }}
                       key={p.id} 
                       className="flex items-center justify-between p-6 hover:bg-gray-50/80 transition-colors group cursor-pointer"
                       onClick={() => navigate(`/patients/${p.id}`)}
                     >
                       <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                         <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-100 text-blue-600 flex shrink-0 items-center justify-center font-black text-lg md:text-xl">
                           {p.nome[0].toUpperCase()}
                         </div>
                         <div className="overflow-hidden">
                           <p className="font-bold text-gray-900 text-base md:text-lg truncate">{p.nome}</p>
                           <p className="text-xs md:text-sm text-gray-500 font-medium truncate">Cadastrado em {new Date(p.createdAt).toLocaleDateString()}</p>
                         </div>
                       </div>
                       <Button variant="ghost" className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-blue-50 text-blue-600 rounded-xl font-bold shrink-0">
                         Abrir Prontuário
                       </Button>
                       <ChevronRight size={20} className="sm:hidden text-gray-400 shrink-0" />
                     </motion.div>
                   ))}
                 </div>
               ) : (
                 <div className="py-16 text-center text-gray-500 font-medium italic">
                   Você ainda não cadastrou pacientes.
                 </div>
               )}
             </CardContent>
           </Card>
        </div>

        <div className="hidden lg:block space-y-8">
           <AgendaBlock
             monthLabel={monthLabel}
             upcoming={upcoming}
             patientName={patientName}
             onOpen={() => navigate('/agenda')}
           />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend, limit }: { icon: any, label: string, value: string, color: 'blue' | 'emerald' | 'purple' | 'amber', trend?: string, limit?: string }) {
  const colors = {
     blue: 'bg-blue-50 text-blue-600 border-blue-100',
     emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
     purple: 'bg-purple-50 text-purple-600 border-purple-100',
     amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  const iconColors = {
     blue: 'text-blue-600',
     emerald: 'text-emerald-600',
     purple: 'text-purple-600',
     amber: 'text-amber-600',
  };

  return (
    <Card className="rounded-2xl lg:rounded-[32px] shadow-sm border border-gray-100 bg-white overflow-hidden relative group hover:shadow-md transition-shadow">
      <CardContent className="p-3 lg:p-6 relative z-10">
        <div className="flex flex-col gap-2 lg:gap-4">
          <div className="flex items-start justify-between">
             <div className={`w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl ${colors[color]} flex items-center justify-center`}>
               <Icon size={18} className={`${iconColors[color]} lg:hidden`} />
               <Icon size={24} className={`${iconColors[color]} hidden lg:block`} />
             </div>
             {limit && (
                <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                  {limit}
                </span>
             )}
          </div>
          <div>
            <p className="text-[10px] lg:text-sm font-bold text-gray-500 uppercase tracking-wider lg:tracking-widest">{label}</p>
            <div className="flex items-end justify-between mt-0.5 lg:mt-1">
              <p className="text-2xl lg:text-4xl font-black tracking-tight text-gray-900">{value}</p>
            </div>
            {trend && <p className="text-[10px] lg:text-xs font-bold text-emerald-600 mt-1 lg:mt-2 flex items-center gap-1"><TrendingUp size={12}/> {trend}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaBlock({
  monthLabel,
  upcoming,
  patientName,
  onOpen,
}: {
  monthLabel: string;
  upcoming: Array<{ id: string; pacienteId: string; start: Date; duracao: number; tipo: string; local: 'Presencial' | 'Telemedicina'; source: 'agendamento' | 'consulta' }>;
  patientName: (id: string) => string;
  onOpen: () => void;
}) {
  const fmtTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  const today = new Date();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  return (
    <Card className="rounded-2xl lg:rounded-[32px] border border-gray-100 lg:border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="p-4 lg:p-8 pb-2 flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base lg:text-2xl font-black text-gray-900">Agenda</CardTitle>
          <p className="text-gray-500 font-medium text-[11px] lg:text-sm mt-0.5 lg:mt-1">
            Próximos · {monthLabel}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={onOpen}
          className="text-blue-600 font-bold text-xs lg:text-sm hover:bg-blue-50 rounded-xl shrink-0 h-8 px-2"
        >
          Abrir <ChevronRight size={14} />
        </Button>
      </CardHeader>
      <CardContent className="p-3 lg:p-4 pt-0 lg:pt-0">
        {upcoming.length === 0 ? (
          <div className="py-4 lg:py-10 text-center text-gray-400 flex flex-col items-center gap-2 lg:gap-3">
            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-gray-50 flex items-center justify-center">
              <Calendar size={20} className="text-gray-300 lg:hidden" />
              <Calendar size={26} className="text-gray-300 hidden lg:block" />
            </div>
            <p className="text-xs lg:text-sm font-medium">Nenhum compromisso.</p>
            <Button
              onClick={onOpen}
              size="sm"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 h-8 lg:h-10 text-xs lg:text-sm"
            >
              <PlusCircle size={14} /> Novo agendamento
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((e) => (
              <li
                key={e.id}
                onClick={onOpen}
                className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition hover:shadow-sm ${
                  e.source === 'consulta'
                    ? 'bg-emerald-50/60 border-emerald-100'
                    : 'bg-blue-50/60 border-blue-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center w-14 shrink-0 rounded-xl bg-white border border-black/5 py-1.5 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {e.start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                  </span>
                  <span className="text-lg font-black text-gray-900 leading-none">
                    {e.start.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-900 truncate">
                    {patientName(e.pacienteId)}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {fmtTime(e.start)}
                    </span>
                    <span className="flex items-center gap-1">
                      {e.local === 'Telemedicina' ? <Video size={11} /> : <MapPin size={11} />}
                      {e.local}
                    </span>
                    {isToday(e.start) && (
                      <span className="text-blue-600 font-bold uppercase tracking-wider">Hoje</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PremiumFeatureCard({ title, description, icon: Icon, isLocked, color, onClick }: any) {
   const colorMap: any = {
      indigo: 'from-indigo-500 to-indigo-700 shadow-indigo-500/20',
      emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-500/20',
   };

   return (
      <div 
         onClick={!isLocked ? onClick : undefined}
         className={`relative rounded-[32px] p-6 overflow-hidden ${isLocked ? 'bg-gray-100 cursor-not-allowed border border-gray-200' : 'bg-gradient-to-br ' + colorMap[color] + ' cursor-pointer shadow-lg hover:scale-[1.02] transition-transform'}`}
      >
         <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLocked ? 'bg-gray-200 text-gray-400' : 'bg-white/20 text-white backdrop-blur-md'}`}>
               <Icon size={24} />
            </div>
            {isLocked && (
               <div className="bg-gray-200 p-2 rounded-full text-gray-500" title="Exclusivo Plano Profissional">
                  <Lock size={16} />
               </div>
            )}
            {!isLocked && (
               <div className="bg-white/20 px-3 py-1 text-white rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md">
                 <Sparkles size={14} /> Liberado
               </div>
            )}
         </div>
         <h4 className={`text-xl font-bold mb-2 ${isLocked ? 'text-gray-900' : 'text-white'}`}>{title}</h4>
         <p className={`text-sm font-medium ${isLocked ? 'text-gray-500' : 'text-white/80'}`}>{description}</p>
         
         {isLocked && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <span className="bg-gray-900 text-white font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-xl">
                  <Crown size={16} className="text-amber-400" />
                  Upgrade Necessário
               </span>
            </div>
         )}
      </div>
   )
}

