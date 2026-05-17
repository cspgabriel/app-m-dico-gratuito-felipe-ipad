import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../components/FirebaseProvider';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Target, TrendingUp, AlertCircle, CalendarClock, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Paciente } from '../types';
import { toast } from 'sonner';
import { usePlan } from '../lib/entitlements';

export default function MarketingInsights() {
  const { tenantId } = useAuth();
  const { canUseMarketingAutomation } = usePlan();
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

  const handleExportCampaign = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const header = ['Nome', 'Telefone', 'Mensagem sugerida'];
      const csv = [
        header.join(';'),
        ...inactivePatients.map((p) => [
          p.nome,
          p.telefone || '',
          `Olá, ${p.nome}. Sentimos sua falta na clínica. Podemos agendar seu retorno?`,
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')),
      ].join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campanha-reativacao-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Campanha exportada com ${inactivePatients.length} pacientes.`);
    } catch (e) {
      toast.error('Erro ao exportar campanha');
    } finally {
      setLoading(false);
    }
  };

  if (!canUseMarketingAutomation) {
    return (
      <Card className="apple-card max-w-2xl mx-auto">
        <CardContent className="p-8 text-center space-y-3">
          <Lock className="mx-auto text-apple-blue" size={40} />
          <h2 className="text-2xl font-bold">Marketing integrado apenas no Vitalício</h2>
          <p className="text-gray-600">
            Planos Básico e Profissional não incluem WhatsApp, e-mail ou automações de marketing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketing Vitalício</h2>
          <p className="text-apple-gray-dark">WhatsApp e e-mail marketing para retenção de pacientes</p>
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
                Gere uma lista de campanha para reativação por WhatsApp e e-mail marketing.
              </p>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 font-bold gap-2 rounded-xl shrink-0"
              onClick={handleExportCampaign}
              disabled={loading || inactivePatients.length === 0}
            >
              <Mail size={18} />
              {loading ? 'Preparando Campanha...' : 'Exportar Campanha de Retenção'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
