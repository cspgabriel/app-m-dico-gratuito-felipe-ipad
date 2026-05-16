import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Consulta, Paciente } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, User, Search, Stethoscope } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function ConsultationsList() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consulta[]>([]);
  const [patients, setPatients] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'consultas'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consulta));
      data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setConsultations(data);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'pacientes'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const pats: Record<string, string> = {};
      snapshot.forEach(doc => {
        pats[doc.id] = doc.data().nome;
      });
      setPatients(pats);
    });
    return unsub;
  }, [user]);

  const filtered = consultations.filter(c => {
    const pName = patients[c.pacienteId] || 'Desconhecido';
    return pName.toLowerCase().includes(searchTerm.toLowerCase()) || c.queixa.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consultas</h2>
          <p className="text-apple-gray-dark">Histórico de todos os prontuários e evoluções</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3 text-apple-gray-dark" size={20} />
        <Input 
          className="pl-12 py-6 rounded-2xl border-apple-gray focus-visible:ring-apple-blue bg-white/50 backdrop-blur-sm"
          placeholder="Pesquisar por paciente ou queixa..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white/40 rounded-3xl border border-white/60">
            <Stethoscope className="mx-auto h-12 w-12 text-apple-gray-dark opacity-50 mb-4" />
            <p className="text-lg font-medium text-apple-gray-dark">Nenhuma consulta encontrada.</p>
          </div>
        ) : (
          filtered.map(c => (
            <Link key={c.id} to={`/patients/${c.pacienteId}`}>
              <Card className="hover:shadow-lg transition-all border-white/80 bg-white/60 backdrop-blur-md rounded-2xl group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-apple-blue font-bold mb-1">
                        <User size={16} />
                        {patients[c.pacienteId] || 'Paciente Removido'}
                      </div>
                      <p className="text-sm font-medium">{c.queixa || 'Sem queixa principal relatada'}</p>
                      {c.cid10 && c.cid10.length > 0 && <p className="text-xs text-apple-gray-dark mt-2">CID: {c.cid10.join(', ')}</p>}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-blue-50 text-apple-blue px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(c.data).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
