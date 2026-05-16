import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../components/FirebaseProvider';
import { getDocs, collection, query, where, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, UserPlus, Shield, Mail, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export default function TeamManagement() {
  const { tenantId, user, userProfile } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('profissional');

  const fetchTeam = async () => {
    if (!tenantId) return;
    try {
      const q = query(collection(db, 'users'), where('tenantId', '==', tenantId));
      const snap = await getDocs(q);
      const members = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeam(members);
      
      const qInvites = query(collection(db, 'invites'), where('tenantId', '==', tenantId));
      const snapInvites = await getDocs(qInvites);
      const invs = snapInvites.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvites(invs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [tenantId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !tenantId) return;
    setLoading(true);
    try {
      if (invites.find(i => i.email === email) || team.find(t => t.email === email)) {
         throw new Error('E-mail já convidado ou faz parte da equipe.');
      }
      await addDoc(collection(db, 'invites'), {
        email,
        role,
        tenantId,
        invitedBy: user?.uid,
        createdAt: new Date().toISOString()
      });
      toast.success(`Convite enviado para ${email}`);
      setEmail('');
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar convite');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('Permissão atualizada!');
      fetchTeam();
    } catch (err) {
      toast.error('Erro ao atualizar permissão.');
    }
  };

  const handleRemoveInvite = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, 'invites', inviteId));
      toast.success('Convite cancelado.');
      fetchTeam();
    } catch (err) {
      toast.error('Erro ao cancelar convite.');
    }
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    medico: 'Médico',
    enfermeira: 'Enfermeira',
    recepcionista: 'Recepcionista',
    profissional: 'Profissional de Saúde' // leged or fallback
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h2>
          <p className="text-apple-gray-dark">Gerencie os acessos e permissões da sua clínica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="apple-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users size={20} className="text-apple-blue" />
              Membros da Equipe ({team.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {team.map(member => (
                <div key={member.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-apple-blue text-white flex items-center justify-center text-lg font-bold shadow-sm">
                      {member.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-base font-bold">{member.name || 'Usuário Pendente'}</p>
                      <p className="text-sm text-gray-500">{member.email || 'Email não disponível'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={member.role || 'profissional'}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      disabled={member.id === user?.uid && member.role === 'admin'}
                      className="text-xs font-bold text-gray-600 bg-white border outline-none rounded-xl p-2"
                    >
                      <option value="admin">Administrador</option>
                      <option value="medico">Médico</option>
                      <option value="enfermeira">Enfermeira</option>
                      <option value="recepcionista">Recepcionista</option>
                      <option value="profissional">Profissional de Saúde</option>
                    </select>
                  </div>
                </div>
              ))}

              {invites.length > 0 && (
                <>
                  <h4 className="text-sm font-bold text-gray-500 pt-4 uppercase">Convites Pendentes</h4>
                  {invites.map(invite => (
                    <div key={invite.id} className="flex justify-between items-center bg-gray-50/50 border border-dashed border-gray-200 p-4 rounded-2xl opacity-70">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-300 text-white flex items-center justify-center text-lg font-bold">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-base font-bold">{invite.email}</p>
                          <p className="text-sm text-gray-500">Aguardando aceite ({roleLabels[invite.role] || invite.role})</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveInvite(invite.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="apple-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus size={20} className="text-green-500" />
              Convidar Membro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-apple-gray-dark uppercase mb-1 block">E-mail do Profissional</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <Input 
                    required 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="dr.exemplo@clinica.com" 
                    className="pl-10 rounded-xl" 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-apple-gray-dark uppercase mb-1 block">Permissão</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border-gray-200 border bg-white focus:ring-apple-blue outline-none"
                >
                  <option value="medico">Médico</option>
                  <option value="enfermeira">Enfermeira</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="admin">Administrador</option>
                  <option value="profissional">Outro Profissional</option>
                </select>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-xl bg-apple-blue hover:bg-blue-600 font-bold">
                {loading ? 'Enviando...' : 'Enviar Convite'}
              </Button>
              <p className="text-[10px] text-gray-500 text-center">
                O usuário poderá entrar com o e-mail no login ou registrar-se na plataforma.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
