import React, { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, collectionGroup, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { Download, FileText, Search, Plus, FileCheck, AlertTriangle, Send, Ban, DollarSign } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { usePlan } from '../lib/entitlements';
import { Paciente, Consulta, TissGuide, TissGuideStatus, TissGuideType } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { downloadTissGuidePDF, exportGuidesCsv, generateGuideNumber, guideTypeLabel, statusLabel } from '../lib/tiss-guide-service';
import { toast } from 'sonner';

type ConsultationRow = Consulta & {
  patientName: string;
  patientCpf?: string;
  convenio?: string;
  registroAns?: string;
  planoSaude?: string;
  numeroCarteira?: string;
  validadeCarteira?: string;
};

const statusIcon: Record<TissGuideStatus, any> = {
  draft: FileText,
  authorized: FileCheck,
  submitted: Send,
  paid: DollarSign,
  glossed: AlertTriangle,
  cancelled: Ban,
};

export default function GuidesPage() {
  const { tenantId } = useAuth();
  const { planName, canUseTiss } = usePlan();
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [guides, setGuides] = useState<TissGuide[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRow | null>(null);
  const [form, setForm] = useState({
    tipoGuia: 'consulta' as TissGuideType,
    numeroGuia: '',
    numeroGuiaOperadora: '',
    numeroGuiaPrincipal: '',
    operadora: '',
    registroAns: '',
    planoSaude: '',
    numeroCarteira: '',
    validadeCarteira: '',
    caraterAtendimento: 'eletivo' as 'eletivo' | 'urgencia',
    tipoConsulta: 'primeira' as 'primeira' | 'seguimento' | 'pre_natal' | 'referencia',
    senhaAutorizacao: '',
    dataAutorizacao: '',
    validadeSenha: '',
    valorTotal: '',
  });

  useEffect(() => {
    if (!tenantId) return;
    const loadConsultations = async () => {
      setLoading(true);
      const patientsSnap = await getDocs(query(collection(db, 'pacientes'), where('userId', '==', tenantId)));
      const patients = new Map<string, Paciente>();
      patientsSnap.forEach((snap) => patients.set(snap.id, { id: snap.id, ...snap.data() } as Paciente));

      const consultationsSnap = await getDocs(query(collectionGroup(db, 'consultas'), where('userId', '==', tenantId)));
      const rows = consultationsSnap.docs
        .map((snap) => {
          const data = { id: snap.id, ...snap.data() } as Consulta;
          const patient = patients.get(data.pacienteId);
          return {
            ...data,
            patientName: patient?.nome || 'Paciente não localizado',
            patientCpf: patient?.cpf,
            convenio: patient?.convenio,
            registroAns: patient?.registroAns,
            planoSaude: patient?.planoSaude,
            numeroCarteira: patient?.numeroCarteira,
            validadeCarteira: patient?.validadeCarteira,
          };
        })
        .filter((row) => (row.tuss?.length || row.cid10?.length))
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setConsultations(rows);
      setLoading(false);
    };

    loadConsultations().catch((err) => {
      console.error(err);
      toast.error('Erro ao carregar consultas elegíveis.');
      setLoading(false);
    });
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) return;
    const q = query(collection(db, 'guias'), where('userId', '==', tenantId));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((item) => ({ id: item.id, ...item.data() } as TissGuide));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setGuides(data);
    });
  }, [tenantId]);

  const visibleGuides = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return guides;
    return guides.filter((guide) =>
      [
        guide.numeroGuia,
        guide.numeroGuiaOperadora,
        guide.operadora,
        guide.registroAns,
        guide.pacienteNome,
        guide.pacienteCpf,
        guide.numeroCarteira,
        guide.cid10?.join(' '),
        guide.tuss?.join(' '),
        guide.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [filter, guides]);

  const openCreateGuide = (row: ConsultationRow) => {
    setSelectedConsultation(row);
    setForm({
      tipoGuia: row.tuss?.length ? 'sp_sadt' : 'consulta',
      numeroGuia: generateGuideNumber(),
      numeroGuiaOperadora: '',
      numeroGuiaPrincipal: '',
      operadora: row.convenio || '',
      registroAns: row.registroAns || '',
      planoSaude: row.planoSaude || '',
      numeroCarteira: row.numeroCarteira || '',
      validadeCarteira: row.validadeCarteira || '',
      caraterAtendimento: 'eletivo',
      tipoConsulta: 'primeira',
      senhaAutorizacao: '',
      dataAutorizacao: '',
      validadeSenha: '',
      valorTotal: '',
    });
  };

  const createGuide = async () => {
    if (!tenantId || !selectedConsultation) return;
    if (!form.operadora.trim()) {
      toast.error('Informe a operadora/convênio.');
      return;
    }
    if (!form.numeroCarteira.trim()) {
      toast.error('Informe a carteirinha do beneficiário.');
      return;
    }

    const now = new Date().toISOString();
    const guide: Omit<TissGuide, 'id'> = {
      userId: tenantId,
      pacienteId: selectedConsultation.pacienteId,
      consultaId: selectedConsultation.id,
      tipoGuia: form.tipoGuia,
      status: form.senhaAutorizacao ? 'authorized' : 'draft',
      numeroGuia: form.numeroGuia,
      numeroGuiaOperadora: form.numeroGuiaOperadora.trim() || undefined,
      numeroGuiaPrincipal: form.numeroGuiaPrincipal.trim() || undefined,
      operadora: form.operadora.trim(),
      registroAns: form.registroAns.trim() || undefined,
      planoSaude: form.planoSaude.trim() || undefined,
      numeroCarteira: form.numeroCarteira.trim(),
      validadeCarteira: form.validadeCarteira || undefined,
      pacienteNome: selectedConsultation.patientName,
      pacienteCpf: selectedConsultation.patientCpf,
      dataAtendimento: selectedConsultation.data,
      cid10: selectedConsultation.cid10 || [],
      tuss: selectedConsultation.tuss || [],
      indicacaoClinica: selectedConsultation.queixa,
      conduta: selectedConsultation.conduta,
      caraterAtendimento: form.caraterAtendimento,
      tipoConsulta: form.tipoConsulta,
      senhaAutorizacao: form.senhaAutorizacao.trim() || undefined,
      dataAutorizacao: form.dataAutorizacao || undefined,
      validadeSenha: form.validadeSenha || undefined,
      valorTotal: form.valorTotal ? Number(form.valorTotal) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await addDoc(collection(db, 'guias'), guide);
      toast.success('Guia criada.');
      setSelectedConsultation(null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao criar guia.');
    }
  };

  const updateGuideStatus = async (guide: TissGuide, status: TissGuideStatus) => {
    try {
      await updateDoc(doc(db, 'guias', guide.id), {
        status,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Status atualizado.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar guia.');
    }
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
            Plano {planName}. Crie guias operacionais com beneficiário, operadora, autorização, status e PDF.
          </p>
        </div>
        <Button className="rounded-xl bg-apple-blue hover:bg-blue-600 text-white gap-2" onClick={() => exportGuidesCsv(visibleGuides)} disabled={!visibleGuides.length}>
          <Download size={18} /> Exportar guias CSV
        </Button>
      </div>

      <Card className="apple-card">
        <CardHeader className="gap-4">
          <CardTitle className="text-lg">Guias emitidas</CardTitle>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar guia, paciente, operadora, carteira, CID ou TUSS" className="pl-10 rounded-xl" />
          </div>
        </CardHeader>
        <CardContent>
          {visibleGuides.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-300 mb-3" size={42} />
              <p className="font-semibold text-gray-700">Nenhuma guia criada ainda.</p>
              <p className="text-sm text-gray-500">Use uma consulta elegível abaixo para gerar a primeira guia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleGuides.map((guide) => {
                const Icon = statusIcon[guide.status];
                return (
                  <Card key={guide.id} className="rounded-2xl border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-apple-blue flex items-center justify-center shrink-0">
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-black text-gray-900">{guide.numeroGuia}</p>
                              <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-0.5 rounded-md">{guideTypeLabel[guide.tipoGuia]}</span>
                              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">{statusLabel[guide.status]}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {guide.pacienteNome} • {guide.operadora} {guide.registroAns ? `• ANS ${guide.registroAns}` : ''}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Carteira {guide.numeroCarteira || '-'} • CID {guide.cid10?.join(', ') || '-'} • TUSS {guide.tuss?.join(', ') || '-'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <select
                            value={guide.status}
                            onChange={(e) => updateGuideStatus(guide, e.target.value as TissGuideStatus)}
                            className="h-10 rounded-xl border border-gray-200 px-3 bg-white text-sm font-semibold"
                          >
                            {Object.entries(statusLabel).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                          <Button variant="outline" className="rounded-xl gap-2" onClick={() => downloadTissGuidePDF(guide)}>
                            <Download size={16} /> PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="apple-card">
        <CardHeader>
          <CardTitle className="text-lg">Consultas elegíveis para guia</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-10 text-gray-500">Carregando consultas...</p>
          ) : consultations.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="mx-auto text-gray-300 mb-3" size={42} />
              <p className="font-semibold text-gray-700">Nenhuma consulta com CID/TUSS ainda.</p>
              <p className="text-sm text-gray-500">Cadastre CID-10 e TUSS na consulta para liberar criação de guia.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-3 pr-4">Data</th>
                    <th className="py-3 pr-4">Paciente</th>
                    <th className="py-3 pr-4">Operadora</th>
                    <th className="py-3 pr-4">CID-10</th>
                    <th className="py-3 pr-4">TUSS</th>
                    <th className="py-3 pr-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {consultations.map((row) => (
                    <tr key={row.id} className="border-b last:border-0 align-top">
                      <td className="py-4 pr-4 font-medium whitespace-nowrap">{new Date(row.data).toLocaleDateString('pt-BR')}</td>
                      <td className="py-4 pr-4">
                        <p className="font-bold">{row.patientName}</p>
                        <p className="text-xs text-gray-500">{row.patientCpf || 'CPF não informado'} • Carteira {row.numeroCarteira || '-'}</p>
                      </td>
                      <td className="py-4 pr-4">{row.convenio || 'Não informado'} {row.registroAns ? `(ANS ${row.registroAns})` : ''}</td>
                      <td className="py-4 pr-4">{row.cid10?.join(', ') || '-'}</td>
                      <td className="py-4 pr-4">{row.tuss?.join(', ') || '-'}</td>
                      <td className="py-4 pr-4 text-right">
                        <Button size="sm" className="rounded-xl gap-2 bg-apple-blue hover:bg-blue-600 text-white" onClick={() => openCreateGuide(row)}>
                          <Plus size={16} /> Criar guia
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedConsultation} onOpenChange={(open) => !open && setSelectedConsultation(null)}>
        <DialogContent className="rounded-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar guia TISS/TUSS</DialogTitle>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="font-bold text-gray-900">{selectedConsultation.patientName}</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedConsultation.data).toLocaleDateString('pt-BR')} • CID {selectedConsultation.cid10?.join(', ') || '-'} • TUSS {selectedConsultation.tuss?.join(', ') || '-'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Número da guia">
                  <Input value={form.numeroGuia} onChange={(e) => setForm({ ...form, numeroGuia: e.target.value })} />
                </Field>
                <Field label="Tipo de guia">
                  <select value={form.tipoGuia} onChange={(e) => setForm({ ...form, tipoGuia: e.target.value as TissGuideType })} className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white">
                    {Object.entries(guideTypeLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </Field>
                <Field label="Operadora / Convênio">
                  <Input value={form.operadora} onChange={(e) => setForm({ ...form, operadora: e.target.value })} placeholder="Unimed, Amil..." />
                </Field>
                <Field label="Registro ANS">
                  <Input value={form.registroAns} onChange={(e) => setForm({ ...form, registroAns: e.target.value })} placeholder="Registro da operadora" />
                </Field>
                <Field label="Plano">
                  <Input value={form.planoSaude} onChange={(e) => setForm({ ...form, planoSaude: e.target.value })} />
                </Field>
                <Field label="Carteirinha do beneficiário">
                  <Input value={form.numeroCarteira} onChange={(e) => setForm({ ...form, numeroCarteira: e.target.value })} />
                </Field>
                <Field label="Validade da carteira">
                  <Input type="date" value={form.validadeCarteira} onChange={(e) => setForm({ ...form, validadeCarteira: e.target.value })} />
                </Field>
                <Field label="Valor total">
                  <Input type="number" min="0" step="0.01" value={form.valorTotal} onChange={(e) => setForm({ ...form, valorTotal: e.target.value })} />
                </Field>
                <Field label="Caráter do atendimento">
                  <select value={form.caraterAtendimento} onChange={(e) => setForm({ ...form, caraterAtendimento: e.target.value as any })} className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white">
                    <option value="eletivo">Eletivo</option>
                    <option value="urgencia">Urgência/Emergência</option>
                  </select>
                </Field>
                <Field label="Tipo de consulta">
                  <select value={form.tipoConsulta} onChange={(e) => setForm({ ...form, tipoConsulta: e.target.value as any })} className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white">
                    <option value="primeira">Primeira consulta</option>
                    <option value="seguimento">Seguimento</option>
                    <option value="pre_natal">Pré-natal</option>
                    <option value="referencia">Referência</option>
                  </select>
                </Field>
                <Field label="Senha de autorização">
                  <Input value={form.senhaAutorizacao} onChange={(e) => setForm({ ...form, senhaAutorizacao: e.target.value })} />
                </Field>
                <Field label="Data da autorização">
                  <Input type="date" value={form.dataAutorizacao} onChange={(e) => setForm({ ...form, dataAutorizacao: e.target.value })} />
                </Field>
                <Field label="Validade da senha">
                  <Input type="date" value={form.validadeSenha} onChange={(e) => setForm({ ...form, validadeSenha: e.target.value })} />
                </Field>
                <Field label="Nº guia na operadora">
                  <Input value={form.numeroGuiaOperadora} onChange={(e) => setForm({ ...form, numeroGuiaOperadora: e.target.value })} />
                </Field>
                <Field label="Nº guia principal">
                  <Input value={form.numeroGuiaPrincipal} onChange={(e) => setForm({ ...form, numeroGuiaPrincipal: e.target.value })} />
                </Field>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedConsultation(null)}>Cancelar</Button>
            <Button className="rounded-xl bg-apple-blue hover:bg-blue-600 text-white" onClick={createGuide}>Salvar guia</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );
}
