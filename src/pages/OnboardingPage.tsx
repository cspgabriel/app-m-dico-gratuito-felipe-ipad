import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, UserProfile } from '../components/FirebaseProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Building, Stethoscope, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    crm: '',
    clinicName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const profile: UserProfile = {
        name: formData.name,
        crm: formData.crm,
        clinicName: formData.clinicName,
        role: 'admin',
        tenantId: user.uid,
        onboardingComplete: true,
      };
      
      await setDoc(doc(db, 'users', user.uid), profile);
      await refreshProfile();
      toast.success('Perfil configurado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-gray p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl border border-black/5">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2">Bem-vindo à Nova Era</h1>
        <p className="text-apple-gray-dark text-center mb-8">Vamos configurar o ambiente da sua clínica.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <UserCircle size={16} className="text-apple-blue" />
              Seu Nome Completo
            </label>
            <Input 
              required
              placeholder="Dr(a). Fulano de Tal"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl h-12"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Stethoscope size={16} className="text-apple-blue" />
              Seu CRM (Opcional)
            </label>
            <Input 
              placeholder="Ex: 123456/SP"
              value={formData.crm}
              onChange={e => setFormData({ ...formData, crm: e.target.value })}
              className="rounded-xl h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Building size={16} className="text-apple-blue" />
              Nome da Clínica / Empresa
            </label>
            <Input 
              required
              placeholder="Clínica Saúde & Vida"
              value={formData.clinicName}
              onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
              className="rounded-xl h-12"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl bg-apple-blue hover:bg-blue-600 font-bold text-lg shadow-lg shadow-blue-500/30">
            {loading ? 'Salvando...' : 'Acessar meu sistema'}
          </Button>
        </form>
      </div>
    </div>
  );
}
