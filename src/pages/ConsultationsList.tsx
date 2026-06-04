import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, collectionGroup, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Consulta, Paciente } from '../types';
import { Card, CardContent } from '../components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Search, Stethoscope, PlusCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function ConsultationsList() {
  const { tenantId } = useAuth();
  const [consultations, setConsultations] = useState<Consulta[]>([]);
  const [patientsList, setPatientsList] = useState<{id: string, nome: string}[]>([]);
  const [patientsMap, setPatientsMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tenantId) return;
    const q = query(
      collectionGroup(db, 'consultas'),
      where('userId', '==', tenantId),
      orderBy('data', 'desc'),
      limit(50)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consulta));
      setConsultations(data);
    });
    return unsub;
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    const q = query(
      collection(db, 'pacientes'),
      where('userId', '==', tenantId),
      orderBy('nome'),
      limit(200)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const patsMap: Record<string, string> = {};
      const patsList: {id: string, nome: string}[] = [];
      snapshot.forEach(doc => {
        patsMap[doc.id] = doc.data().nome;
        patsList.push({ id: doc.id, nome: doc.data().nome });
      });
      setPatientsMap(patsMap);
      setPatientsList(patsList.sort((a,b) => a.nome.localeCompare(b.nome)));
    });
    return unsub;
  }, [tenantId]);

  const filtered = consultations.filter(c => {
    const pName = patientsMap[c.pacienteId] || 'Desconhecido';
    return pName.toLowerCase().includes(searchTerm.toLowerCase()) || c.queixa.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consultas</h2>
          <p className="text-apple-gray-dark">Histórico de todos os prontuários e evoluções</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-apple-blue hover:bg-blue-600 rounded-xl h-12 px-6 shadow-lg shadow-blue-500/20 font-bold gap-2 w-full sm:w-auto text-white">
          <PlusCircle size={20} />
          Nova Consulta
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Selecionar Paciente</h3>
            <p className="text-sm text-gray-500 mb-4">Escolha um paciente cadastrado para iniciar a consulta:</p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {patientsList.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">Nenhum paciente cadastrado.</p>
                  <Button variant="outline" onClick={() => navigate('/patients')} className="rounded-xl">
                    Ir para Cadastro de Pacientes
                  </Button>
                </div>
              ) : (
                patientsList.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => navigate(`/consultation/${p.id}`)}
                    className="w-full text-left p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center justify-between group"
                  >
                    <span className="font-bold text-gray-700 group-hover:text-apple-blue">{p.nome}</span>
                    <Stethoscope size={16} className="text-gray-300 group-hover:text-apple-blue" />
                  </button>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

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
            <button
              key={c.id}
              onClick={() => navigate(`/consultation/${c.pacienteId}/${c.id}`)}
              className="w-full text-left"
            >
              <Card className="hover:shadow-lg hover:border-blue-200 transition-all border-gray-100 bg-white rounded-2xl group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-apple-blue font-bold mb-1">
                        <User size={16} />
                        <span className="truncate">{patientsMap[c.pacienteId] || 'Paciente Removido'}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 line-clamp-2">{c.queixa || 'Sem queixa principal relatada'}</p>
                      {c.cid10 && c.cid10.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">CID: {c.cid10.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="bg-blue-50 text-apple-blue px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(c.data).toLocaleDateString('pt-BR')}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-apple-blue transition-colors">
                        Abrir →
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
