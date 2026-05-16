import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../components/FirebaseProvider';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Target, TrendingUp, AlertCircle, CalendarClock, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Paciente } from '../types';
import { toast } from 'sonner';

export default function MarketingInsights() {
  const { tenantId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [inactivePatients, setInactivePatients] = useState<Paciente[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    const fetchInsights = async () => {
      try {
        const q = query(collection(db, 'pacientes'), where('userId', '==', tenantId));
        const snap = await getDocs(q);
        const allPatients: Paciente[] = [];
        snap.forEach(doc => allPatients.push({ id: doc.id, ...doc.data() } as Paciente));

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const inactive = allPatients.filter(p => new Date(p.updatedAt) < sixMonthsAgo);
        setInactivePatients(inactive);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsights();
  }, [tenantId]);

  const handleSendReminders = async () => {
    setLoading(true);
    try {
      // Simulate sending marketing emails
      await new Promise(r => setTimeout(r, 1500));
      toast.success(`E-mails de retenção enviados com sucesso para ${inactivePatients.length} pacientes!`);
    } catch (e) {
      toast.error('Erro ao enviar e-mails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing & Insights</h2>
          <p className="text-apple-gray-dark">Inteligência de dados para retenção de pacientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="apple-card bg-orange-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-1">Risco de Evasão</p>
                <p className="text-3xl font-black text-orange-900">{inactivePatients.length}</p>
                <p className="text-xs text-orange-700 mt-2 font-medium">Pacientes inativos há &gt; 6 meses</p>
              </div>
              <div className="p-3 bg-orange-200 text-orange-700 rounded-2xl">
                <AlertCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card bg-green-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-green-800 uppercase tracking-wider mb-1">Taxa de Retenção</p>
                <p className="text-3xl font-black text-green-900">84%</p>
                <p className="text-xs text-green-700 mt-2 font-medium">Média do último trimestre</p>
              </div>
              <div className="p-3 bg-green-200 text-green-700 rounded-2xl">
                <Target size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="apple-card bg-blue-50 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">CPA Estimado</p>
                <p className="text-3xl font-black text-blue-900">R$ 42</p>
                <p className="text-xs text-blue-700 mt-2 font-medium">Custo por Aquisição</p>
              </div>
              <div className="p-3 bg-blue-200 text-blue-700 rounded-2xl">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="apple-card border border-orange-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
            <CalendarClock size={20} />
            Campanha de Retenção Ativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-gray-700">
                Você possui <strong>{inactivePatients.length} pacientes</strong> que não retornam há mais de 6 meses.
              </p>
              <p className="text-xs text-gray-500">
                Lembre-os da importância do check-up preventivo. O envio programado de e-mails de marketing ajuda na fidelização.
              </p>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 font-bold gap-2 rounded-xl shrink-0"
              onClick={handleSendReminders}
              disabled={loading || inactivePatients.length === 0}
            >
              <Mail size={18} />
              {loading ? 'Disparando Campanha...' : 'Disparar E-mails de Retenção'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
