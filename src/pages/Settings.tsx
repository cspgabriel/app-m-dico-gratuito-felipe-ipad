import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../components/FirebaseProvider';
import { User, Shield, CreditCard, Bell, Building, Users, Image as ImageIcon, Smartphone, CalendarDays, X } from 'lucide-react';
import { DEFAULT_CALENDARIOS } from '../components/FirebaseProvider';
import { PWAInstallButton } from '../components/PWAInstallPrompt';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Settings() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [logoUrl, setLogoUrl] = useState(userProfile?.logoUrl || '');
  const [clinicName, setClinicName] = useState(userProfile?.clinicName || '');
  const [calendarios, setCalendarios] = useState<string[]>(userProfile?.calendarios?.length ? userProfile.calendarios : DEFAULT_CALENDARIOS);
  const [newCalName, setNewCalName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingCals, setSavingCals] = useState(false);

  const saveCalendarios = async (next: string[]) => {
    if (!user) return;
    setSavingCals(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { calendarios: next }, { merge: true });
      await refreshProfile();
      toast.success('Agendas atualizadas!');
    } catch {
      toast.error('Erro ao salvar agendas.');
    } finally {
      setSavingCals(false);
    }
  };

  const addCalendario = () => {
    const name = newCalName.trim();
    if (!name) return;
    if (calendarios.includes(name)) {
      toast.error('Já existe uma agenda com esse nome.');
      return;
    }
    const next = [...calendarios, name];
    setCalendarios(next);
    setNewCalName('');
    saveCalendarios(next);
  };

  const removeCalendario = (name: string) => {
    if (calendarios.length <= 1) {
      toast.error('Você precisa ter pelo menos uma agenda.');
      return;
    }
    const next = calendarios.filter(c => c !== name);
    setCalendarios(next);
    saveCalendarios(next);
  };

  const handleSaveClinicSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        clinicName,
        logoUrl,
        tenantId: userProfile?.tenantId || user.uid // Ensure tenantId is maintained
      }, { merge: true });
      await refreshProfile();
      toast.success('Configurações atualizadas!');
    } catch (err) {
      toast.error('Erro ao atualizar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Configurações e Assinatura</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building size={20} />
              Personalização da Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-bold text-apple-gray-dark uppercase mb-1 block">Nome da Clínica</label>
              <input 
                value={clinicName} 
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full text-sm p-2 rounded-xl border-gray-200 border outline-none focus:ring-1 focus:ring-apple-blue font-bold" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-apple-gray-dark uppercase mb-1 block">Logo URL (Opcional)</label>
              <div className="flex gap-2">
                <input 
                  value={logoUrl} 
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full text-sm p-2 rounded-xl border-gray-200 border outline-none focus:ring-1 focus:ring-apple-blue" 
                />
              </div>
              {logoUrl && <img src={logoUrl} alt="Logo Preview" className="w-12 h-12 mt-2 rounded-lg object-cover shadow-sm border border-gray-100" />}
            </div>
            <Button onClick={handleSaveClinicSettings} disabled={saving} className="w-full rounded-xl bg-apple-blue hover:bg-blue-600 font-bold text-white">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users size={20} />
              Equipe da Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-apple-blue text-white flex items-center justify-center text-xs font-bold">
                    {userProfile?.name?.[0] || 'V'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{userProfile?.name}</p>
                    <p className="text-[10px] text-gray-500">Administrador</p>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl gap-2 font-bold text-apple-blue border-apple-blue/20 hover:bg-apple-blue/5">
              + Convidar Membro
            </Button>
          </CardContent>
        </Card>

        <Card className="apple-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays size={20} />
              Agendas da Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Organize sua rotina com várias agendas (ex: consultório, telemedicina, plantão). Cada agendamento é vinculado a uma agenda.
            </p>
            <div className="flex flex-wrap gap-2">
              {calendarios.map(c => (
                <span key={c} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-apple-blue text-sm font-semibold">
                  {c}
                  <button
                    onClick={() => removeCalendario(c)}
                    disabled={savingCals}
                    className="hover:bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center"
                    title="Remover"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newCalName}
                onChange={(e) => setNewCalName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCalendario()}
                placeholder="Nova agenda (ex: Domicílio)"
                className="flex-1 text-sm p-2 rounded-xl border-gray-200 border outline-none focus:ring-1 focus:ring-apple-blue"
              />
              <Button onClick={addCalendario} disabled={savingCals || !newCalName.trim()} className="rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold">
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone size={20} />
              Instalar como App
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-apple-gray-dark">
              <p className="font-bold text-gray-800">Acesse o MedSystem como um aplicativo nativo.</p>
              <p className="mt-1">Funciona offline, abre em tela cheia e tem ícone próprio na home.</p>
            </div>
            <PWAInstallButton
              variant="default"
              className="rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold h-11 px-6 shadow-lg shadow-blue-500/20"
            />
          </CardContent>
        </Card>

        <Card className="apple-card md:col-span-2 border-apple-blue border-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20"></div>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard size={24} className="text-apple-blue" />
              Sua Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 border rounded-2xl bg-gray-50">
                <h3 className="text-apple-gray-dark font-bold mb-1">Básico</h3>
                <p className="text-3xl font-black mb-4">R$ 0<span className="text-sm font-normal text-gray-500">/mês</span></p>
                <ul className="text-sm space-y-2 mb-6">
                  <li>✅ 1 Profissional</li>
                  <li>✅ 50 Pacientes</li>
                  <li>❌ Relatórios</li>
                </ul>
                <Button variant="outline" className="w-full rounded-xl" disabled>Plano Atual</Button>
              </div>

              <div className="p-6 border-2 border-apple-blue rounded-2xl bg-white shadow-xl relative">
                <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-3 bg-apple-blue text-white text-[10px] uppercase font-bold py-1 px-3 rounded-full">Recomendado</div>
                <h3 className="text-apple-blue font-bold mb-1">Clínica Pro</h3>
                <p className="text-3xl font-black mb-4">R$ 149<span className="text-sm font-normal text-gray-500">/mês</span></p>
                <ul className="text-sm space-y-2 mb-6">
                  <li>✅ Até 5 Profissionais</li>
                  <li>✅ Pacientes Ilimitados</li>
                  <li>✅ Relatórios Inteligentes</li>
                </ul>
                <Button className="w-full rounded-xl bg-apple-blue hover:bg-blue-600 font-bold">Fazer Upgrade</Button>
              </div>

              <div className="p-6 border rounded-2xl bg-gray-50">
                <h3 className="text-apple-gray-dark font-bold mb-1">Corporate</h3>
                <p className="text-3xl font-black mb-4">R$ 399<span className="text-sm font-normal text-gray-500">/mês</span></p>
                <ul className="text-sm space-y-2 mb-6">
                  <li>✅ Profissionais Ilimitados</li>
                  <li>✅ Filiais e Unidades</li>
                  <li>✅ API de Integração</li>
                </ul>
                <Button variant="outline" className="w-full rounded-xl">Falar com Consultor</Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
