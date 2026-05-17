import React, { useEffect, useMemo, useState } from 'react';
import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { Download, FileText, Printer, Search } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { usePlan } from '../lib/entitlements';
import { Paciente, Consulta } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

type GuideRow = Consulta & {
  patientName: string;
  patientCpf?: string;
  convenio?: string;
};

export default function GuidesPage() {
  const { tenantId } = useAuth();
  const { planName, canUseTiss } = usePlan();
  const [rows, setRows] = useState<GuideRow[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const loadGuides = async () => {
      setLoading(true);
      const patientsSnap = await getDocs(query(collection(db, 'pacientes'), where('userId', '==', tenantId)));
      const patients = new Map<string, Paciente>();
      patientsSnap.forEach((doc) => patients.set(doc.id, { id: doc.id, ...doc.data() } as Paciente));

      const consultationsSnap = await getDocs(query(collectionGroup(db, 'consultas'), where('userId', '==', tenantId)));
      const guides = consultationsSnap.docs
        .map((doc) => {
          const data = { id: doc.id, ...doc.data() } as Consulta;
          const patient = patients.get(data.pacienteId);
          return {
            ...data,
            patientName: patient?.nome || 'Paciente não localizado',
            patientCpf: patient?.cpf,
            convenio: patient?.convenio,
          };
        })
        .filter((guide) => (guide.tuss?.length || guide.cid10?.length))
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      setRows(guides);
      setLoading(false);
    };

    loadGuides().catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [tenantId]);

  const visibleRows = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.patientName, row.patientCpf, row.convenio, row.cid10?.join(' '), row.tuss?.join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [filter, rows]);

  const exportCsv = () => {
    const header = ['Data', 'Paciente', 'CPF', 'Convenio', 'CID-10', 'TUSS', 'Conduta'];
    const csv = [
      header.join(';'),
      ...visibleRows.map((row) =>
        [
          new Date(row.data).toLocaleDateString('pt-BR'),
          row.patientName,
          row.patientCpf || '',
          row.convenio || '',
          row.cid10?.join(', ') || '',
          row.tuss?.join(', ') || '',
          (row.conduta || '').replace(/\s+/g, ' '),
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(';')
      ),
    ].join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guias-tiss-tuss-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!canUseTiss) {
    return (
      <Card className="apple-card max-w-2xl mx-auto">
        <CardContent className="p-8 text-center space-y-3">
          <FileText className="mx-auto text-apple-blue" size={40} />
          <h2 className="text-2xl font-bold">Guias indisponíveis</h2>
          <p className="text-gray-600">Seu plano atual não libera guias TISS/TUSS.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Guias TISS/TUSS</h2>
          <p className="text-apple-gray-dark">
            Liberado no plano {planName}. Gere arquivos a partir das consultas com CID-10 e TUSS.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.print()}>
            <Printer size={18} /> Gerar PDF
          </Button>
          <Button className="rounded-xl bg-apple-blue hover:bg-blue-600 text-white gap-2" onClick={exportCsv} disabled={!visibleRows.length}>
            <Download size={18} /> Exportar CSV
          </Button>
        </div>
      </div>

      <Card className="apple-card">
        <CardHeader className="gap-4">
          <CardTitle className="text-lg">Consultas prontas para guia</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar paciente, convênio, CID ou TUSS"
              className="pl-10 rounded-xl"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-12 text-gray-500">Carregando guias...</p>
          ) : visibleRows.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-300 mb-3" size={42} />
              <p className="font-semibold text-gray-700">Nenhuma consulta com CID/TUSS ainda.</p>
              <p className="text-sm text-gray-500">Cadastre CID-10 e TUSS na consulta para a guia aparecer aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3 pr-4">Data</th>
                    <th className="py-3 pr-4">Paciente</th>
                    <th className="py-3 pr-4">Convênio</th>
                    <th className="py-3 pr-4">CID-10</th>
                    <th className="py-3 pr-4">TUSS</th>
                    <th className="py-3 pr-4">Conduta</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 align-top">
                      <td className="py-4 pr-4 font-medium whitespace-nowrap">{new Date(row.data).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 pr-4">
                        <p className="font-bold">{row.patientName}</p>
                        <p className="text-xs text-gray-500">{row.patientCpf || 'CPF não informado'}</p>
                      </td>
                      <td className="py-4 pr-4">{row.convenio || '-'}</td>
                      <td className="py-4 pr-4">{row.cid10?.join(', ') || '-'}</td>
                      <td className="py-4 pr-4">{row.tuss?.join(', ') || '-'}</td>
                      <td className="py-4 pr-4 max-w-xs text-gray-600">{row.conduta || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
