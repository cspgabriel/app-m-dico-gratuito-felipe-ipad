import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Paciente, Consulta } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Users, Calendar, Activity, TrendingUp, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, appointments: 0 });
  const [recentPatients, setRecentPatients] = useState<Paciente[]>([]);

  useEffect(() => {
    if (!user) return;

    const patientsQuery = query(
      collection(db, 'pacientes'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(patientsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
      setRecentPatients(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pacientes');
    });

    // Simple count (in production use metadata document or server-side count)
    const fetchStats = async () => {
      try {
        const q = query(collection(db, 'pacientes'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        setStats({ patients: snapshot.size, appointments: 0 }); // Placeholder for appointments
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();

    return unsubscribe;
  }, [user]);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo, Dr(a). {user?.displayName || user?.email?.split('@')[0]}</h2>
          <p className="text-apple-gray-dark">Resumo do seu consultório hoje</p>
        </div>
        <Link to="/patients">
          <Button className="bg-apple-blue hover:bg-blue-600 rounded-xl gap-2 shadow-lg shadow-blue-500/20">
            <PlusCircle size={20} />
            Novo Registro
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Users} 
          label="Total de Pacientes" 
          value={stats.patients.toString()} 
          color="bg-blue-500" 
          borderColorClass="border-l-blue-500"
        />
        <StatCard 
          icon={Calendar} 
          label="Consultas este mês" 
          value="12" 
          color="bg-green-500" 
          borderColorClass="border-l-green-500"
        />
        <StatCard 
          icon={Activity} 
          label="Prontuários Finalizados" 
          value="08" 
          color="bg-orange-500" 
          borderColorClass="border-l-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-2xl border-none shadow-sm apple-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pacientes Recentes</CardTitle>
            <Link to="/patients" className="text-apple-blue text-sm hover:underline">Ver tudo</Link>
          </CardHeader>
          <CardContent>
            {recentPatients.length > 0 ? (
              <div className="space-y-4">
                {recentPatients.map((p, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={p.id} 
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-apple-gray transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold">
                        {p.nome[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{p.nome}</p>
                        <p className="text-xs text-apple-gray-dark">Paciente desde {new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link to={`/patients/${p.id}`}>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Prontuário
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-apple-gray-dark italic">
                Nenhum paciente cadastrado ainda.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm apple-card">
          <CardHeader>
            <CardTitle className="text-lg">Produtividade Semanal</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center text-apple-gray-dark">
            <div className="flex flex-col items-center gap-2">
              <TrendingUp size={48} className="text-apple-gray/20" />
              <p className="text-sm">Gráfico de evolução em breve</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, borderColorClass }: { icon: any, label: string, value: string, color: string, borderColorClass: string }) {
  return (
    <Card className={`rounded-2xl shadow-sm apple-card border-none border-l-4 ${borderColorClass} overflow-hidden`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color} text-white`}>
            <Icon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-apple-gray-dark">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
