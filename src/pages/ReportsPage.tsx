import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart as BarChartIcon, Activity, Users, FileText, Calendar } from 'lucide-react';
import { collection, query, where, getDocs, collectionGroup, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ReportsPage() {
  const { tenantId } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    consultationsThisMonth: 0,
    evolutionsTotal: 0,
    updateRate: '100%',
  });
  
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    const fetchData = async () => {
      try {
        const patientsSnap = await getDocs(query(collection(db, 'pacientes'), where('userId', '==', tenantId), orderBy('createdAt', 'desc'), limit(200)));
        const consSnap = await getDocs(query(collectionGroup(db, 'consultas'), where('userId', '==', tenantId), orderBy('data', 'desc'), limit(200)));
        const anamSnap = await getDocs(query(collectionGroup(db, 'anamneses'), where('userId', '==', tenantId), orderBy('createdAt', 'desc'), limit(200)));
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let consThisMonth = 0;
        
        // Group by month
        const monthlyCounts: Record<string, number> = {};
        
        consSnap.forEach(doc => {
          const data = doc.data();
          const d = new Date(data.data || data.createdAt);
          if (d >= startOfMonth) consThisMonth++;
          
          const monthKey = d.toLocaleString('pt-BR', { month: 'short' });
          monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
        });

        // Format chart data (last 6 months dynamically or just existing keys)
        const formattedData = Object.keys(monthlyCounts).map(month => ({
          name: month,
          consultas: monthlyCounts[month]
        }));

        setStats({
          patients: patientsSnap.size,
          consultationsThisMonth: consThisMonth,
          evolutionsTotal: anamSnap.size + consSnap.size,
          updateRate: '98%'
        });
        
        // if empty
        if (formattedData.length === 0) {
          setChartData([
            { name: 'Jan', consultas: 0 },
            { name: 'Fev', consultas: 0 },
            { name: 'Mar', consultas: 0 },
          ]);
        } else {
          setChartData(formattedData);
        }

      } catch (err) {
        console.error("Error fetching reports", err);
      }
    };

    fetchData();
  }, [tenantId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios Gerenciais</h2>
          <p className="text-apple-gray-dark">Métricas e produtividade da clínica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="apple-card min-w-0">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-apple-gray-dark mb-1">Total de Pacientes</p>
                <h3 className="text-3xl font-bold">{stats.patients}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-apple-blue rounded-2xl">
                <Users size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="apple-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-apple-gray-dark mb-1">Consultas este Mês</p>
                <h3 className="text-3xl font-bold">{stats.consultationsThisMonth}</h3>
              </div>
              <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="apple-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-apple-gray-dark mb-1">Evoluções Registradas</p>
                <h3 className="text-3xl font-bold">{stats.evolutionsTotal}</h3>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileText size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="apple-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-apple-gray-dark mb-1">Taxa de Atualização</p>
                <h3 className="text-3xl font-bold">{stats.updateRate}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Activity size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg">Atendimentos por Mês</CardTitle>
          </CardHeader>
          <CardContent className="h-80 min-h-[320px] min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={320} minWidth={260} minHeight={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                />
                <Bar dataKey="consultas" fill="#1677FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="apple-card min-w-0">
          <CardHeader>
            <CardTitle className="text-lg">Progresso de Evoluções</CardTitle>
          </CardHeader>
          <CardContent className="h-80 min-h-[320px] min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height={320} minWidth={260} minHeight={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8E8E93', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                />
                <Line type="monotone" dataKey="consultas" stroke="#2563EB" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
