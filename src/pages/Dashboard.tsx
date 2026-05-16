import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot, collectionGroup } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Paciente } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Users, Calendar, Activity, TrendingUp, PlusCircle, Lock, Crown, ChevronRight, FileText, Sparkles, BrainCircuit, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function Dashboard() {
  const { user, userProfile, tenantId } = useAuth();
  const [stats, setStats] = useState({ patients: 0, appointments: 0 });
  const [recentPatients, setRecentPatients] = useState<Paciente[]>([]);
  const navigate = useNavigate();

  const plan = userProfile?.plan || 'basico';

  useEffect(() => {
    if (!tenantId) return;

    const patientsQuery = query(
      collection(db, 'pacientes'),
      where('userId', '==', tenantId)
    );

    const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentPatients(docs.slice(0, 5));
      setStats(prev => ({ ...prev, patients: docs.length }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pacientes');
    });

    const fetchAppointmentsStat = async () => {
      try {
        const q = query(collectionGroup(db, 'consultas'), where('userId', '==', tenantId));
        const snapshot = await getDocs(q);
        setStats(prev => ({ ...prev, appointments: snapshot.size }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppointmentsStat();

    return unsubscribe;
  }, [tenantId]);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 bg-gradient-to-r from-blue-50 to-indigo-50/50 p-6 md:p-8 rounded-[32px] border border-blue-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mb-32"></div>
        
        <div className="relative z-10 w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 truncate">Olá, Dr(a). {userProfile?.name?.split(' ')[0] || user?.email?.split('@')[0]}</h2>
            {plan === 'basico' ? (
               <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-max">
                 Plano Básico
               </span>
            ) : (
               <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm w-max">
                 <Crown size={14} /> {plan}
               </span>
            )}
          </div>
          <p className="text-base md:text-lg text-gray-600 font-medium">Aqui está o resumo da sua clínica hoje.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full md:w-auto">
          <Link to="/onboarding" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-2xl border-2 border-blue-200 bg-white/70 backdrop-blur text-blue-700 hover:bg-blue-50 h-12 px-6 font-bold flex gap-2 justify-center">
              <SettingsIcon size={18} />
              Personalizar Clínica
            </Button>
          </Link>
          {plan === 'basico' && (
             <Button variant="outline" className="w-full sm:w-auto rounded-2xl border-2 border-amber-400 text-amber-600 hover:bg-amber-50 h-12 px-6 font-bold flex gap-2 justify-center">
               <Crown size={18} />
               Fazer Upgrade
             </Button>
          )}
          <Link to="/patients" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-500/25 font-bold flex gap-2 justify-center transition-all hover:scale-105 active:scale-95">
              <PlusCircle size={20} />
              Novo Paciente
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Pacientes Ativos" 
          value={stats.patients.toString()} 
          color="blue" 
          trend="+12% este mês"
          limit={plan === 'basico' ? '50 max' : 'Ilimitado'}
        />
        <StatCard 
          icon={Calendar} 
          label="Consultas" 
          value={stats.appointments.toString()} 
          color="emerald" 
          trend="+5% nesta semana"
        />
        <StatCard 
          icon={Activity} 
          label="Prontuários" 
          value={stats.appointments.toString()} 
          color="purple" 
          trend="100% de adesão"
        />
        <div 
          onClick={() => navigate('/patients')}
          className="group relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex flex-col justify-between cursor-pointer shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
           <div className="absolute top-0 right-0 p-6 opacity-30 transform group-hover:scale-110 transition-transform">
             <PlusCircle size={64} className="text-white" />
           </div>
           <div></div>
           <div className="relative z-10 text-white">
             <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                <PlusCircle size={24} />
             </div>
             <p className="font-bold text-xl mb-1">Nova Consulta</p>
             <p className="text-blue-100 text-sm font-medium">Selecione um paciente para iniciar um atendimento.</p>
           </div>
        </div>
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

        <div className="space-y-8">
           <Card className="rounded-[32px] border-none shadow-sm bg-white h-[400px]">
             <CardHeader className="p-8">
               <CardTitle className="text-2xl font-black text-gray-900">Produtividade</CardTitle>
               <p className="text-gray-500 font-medium text-sm mt-1">Sua evolução semanal</p>
             </CardHeader>
             <CardContent className="flex items-center justify-center h-[250px] text-gray-400">
               <div className="flex flex-col items-center gap-4 text-center px-6">
                 <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                    <TrendingUp size={32} className="text-gray-400" />
                 </div>
                 <p className="text-sm font-medium">Os gráficos de desempenho estarão disponíveis em breve.</p>
               </div>
             </CardContent>
           </Card>
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
    <Card className="rounded-[32px] shadow-sm border border-gray-100 bg-white overflow-hidden relative group hover:shadow-md transition-shadow">
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
             <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center`}>
               <Icon size={24} className={iconColors[color]} />
             </div>
             {limit && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                  {limit}
                </span>
             )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</p>
            <div className="flex items-end justify-between mt-1">
              <p className="text-4xl font-black tracking-tight text-gray-900">{value}</p>
            </div>
            {trend && <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp size={12}/> {trend}</p>}
          </div>
        </div>
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

