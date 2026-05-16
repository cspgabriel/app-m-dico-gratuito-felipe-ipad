import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../components/FirebaseProvider';
import { User, Shield, CreditCard, Bell } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User size={20} />
              Perfil Profissional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-bold text-apple-gray-dark uppercase">E-mail</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-apple-gray-dark uppercase">Especialidade</label>
              <p className="text-sm">Clínico Geral</p>
            </div>
            <Button variant="outline" className="w-full rounded-xl">Editar Perfil</Button>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield size={20} />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-apple-gray-dark">Sua conta está protegida por criptografia de ponta a ponta.</p>
            <Button variant="outline" className="w-full rounded-xl">Alterar Senha</Button>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell size={20} />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
             <div className="flex justify-between items-center py-2 border-b border-black/5">
               <span className="text-sm">Lembretes de Consulta</span>
               <div className="w-10 h-5 bg-apple-blue rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
             </div>
             <div className="flex justify-between items-center py-2">
               <span className="text-sm">Alertas de Exames</span>
               <div className="w-10 h-5 bg-apple-gray rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
             </div>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard size={20} />
              Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-apple-blue/10 p-4 rounded-xl">
              <p className="text-apple-blue font-bold">Plano Profissional</p>
              <p className="text-xs text-apple-blue/70">Ativo até 20/12/2026</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
