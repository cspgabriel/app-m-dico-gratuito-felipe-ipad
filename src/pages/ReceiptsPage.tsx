import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Receipt, Search, Download, Calendar, TrendingUp, User } from 'lucide-react';
import { downloadReceipt, type ReceiptData } from '../lib/receipt-service';
import { Link } from 'react-router-dom';

interface ReciboDoc extends ReceiptData {
  id: string;
  pacienteId?: string;
  pacienteNome?: string;
  createdAt: string;
}

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ReceiptsPage() {
  const { tenantId } = useAuth();
  const [recibos, setRecibos] = useState<ReciboDoc[]>([]);
  const [search, setSearch] = useState('');
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (!tenantId) return;
    const q = query(collection(db, 'recibos'), where('userId', '==', tenantId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as ReciboDoc));
      data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setRecibos(data);
    });
    return unsub;
  }, [tenantId]);

  const filtered = useMemo(() => {
    return recibos.filter(r => {
      const matchesSearch =
        !search ||
        (r.pacienteNome || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.servico || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.numero || '').toLowerCase().includes(search.toLowerCase());
      const matchesMonth = !mes || r.data.startsWith(mes);
      return matchesSearch && matchesMonth;
    });
  }, [recibos, search, mes]);

  const totalMes = filtered.reduce((sum, r) => sum + (r.valor || 0), 0);
  const totalAno = useMemo(() => {
    const year = mes.slice(0, 4);
    return recibos
      .filter(r => r.data.startsWith(year))
      .reduce((sum, r) => sum + (r.valor || 0), 0);
  }, [recibos, mes]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recibos</h2>
          <p className="text-apple-gray-dark">Histórico de recibos emitidos e carnê para IR</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Calendar} label={`Total em ${mes.slice(5, 7)}/${mes.slice(0, 4)}`} value={fmtBRL(totalMes)} color="blue" />
        <StatCard icon={TrendingUp} label={`Acumulado em ${mes.slice(0, 4)}`} value={fmtBRL(totalAno)} color="emerald" />
        <StatCard icon={Receipt} label="Recibos emitidos" value={filtered.length.toString()} color="indigo" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Buscar por paciente, serviço ou número…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <Input
          type="month"
          value={mes}
          onChange={e => setMes(e.target.value)}
          className="h-11 rounded-xl sm:w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/40">
          <CardContent className="p-12 text-center">
            <Receipt className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-lg font-bold text-gray-700">Nenhum recibo neste período.</p>
            <p className="text-sm text-gray-500 mt-1">Emita recibos pela tela do paciente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <Card key={r.id} className="rounded-2xl border-gray-100 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Receipt size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 truncate">{r.pacienteNome || r.tomador?.nome || 'Paciente'}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                          Nº {r.numero}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {r.servico} • {new Date(r.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-black text-emerald-600 text-lg">{fmtBRL(r.valor)}</span>
                    <Button
                      onClick={() => downloadReceipt(r)}
                      variant="ghost"
                      size="sm"
                      className="rounded-lg hover:bg-blue-50"
                      title="Baixar PDF"
                    >
                      <Download size={16} className="text-apple-blue" />
                    </Button>
                    {r.pacienteId && (
                      <Link to={`/patients/${r.pacienteId}`}>
                        <Button variant="ghost" size="sm" className="rounded-lg hover:bg-gray-100" title="Ver paciente">
                          <User size={16} className="text-gray-500" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: 'blue' | 'emerald' | 'indigo' }) {
  const map = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    indigo: 'from-indigo-500 to-indigo-600',
  } as const;
  return (
    <Card className={`bg-gradient-to-br ${map[color]} border-none text-white shadow-lg rounded-2xl`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-white/80 mb-2">
          <Icon size={16} />
          <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
        </div>
        <p className="text-2xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}
