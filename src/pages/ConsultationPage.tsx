import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Paciente } from '../types';
import { SPECIALTY_TEMPLATES, templatesForSpecialty } from '../lib/specialty-templates';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  ArrowLeft,
  Save,
  Search,
  X,
  FileText,
  Stethoscope,
  Activity,
  ClipboardCheck,
  TestTube,
  ChevronDown,
  Sparkles,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

const CID_MOCK = [
  { codigo: 'I10', descricao: 'Hipertensão essencial (primária)' },
  { codigo: 'E11', descricao: 'Diabetes mellitus não-insulino-dependente' },
  { codigo: 'J00', descricao: 'Nasofaringite aguda (resfriado comum)' },
  { codigo: 'K29', descricao: 'Gastrite e duodenite' },
  { codigo: 'M54.5', descricao: 'Dor lombar baixa' },
  { codigo: 'Z00', descricao: 'Exame médico geral' },
  { codigo: 'F32', descricao: 'Episódio depressivo' },
  { codigo: 'F41', descricao: 'Transtornos ansiosos' },
];

const TUSS_MOCK = [
  { codigo: '10101012', descricao: 'Consulta em consultório' },
  { codigo: '10101020', descricao: 'Consulta em domicílio' },
  { codigo: '10101039', descricao: 'Consulta em pronto-socorro' },
  { codigo: '20104049', descricao: 'Avaliação clínica e eletroneuromiográfica' },
  { codigo: '20104235', descricao: 'Polissonografia de noite inteira' },
];

type TabKey = 'evolution' | 'anamnese';

export default function ConsultationPage() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, tenantId, userProfile } = useAuth();
  const [patient, setPatient] = useState<Paciente | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>((searchParams.get('type') as TabKey) || 'evolution');
  const [saving, setSaving] = useState(false);

  // Form
  const [queixa, setQueixa] = useState('');
  const [hda, setHda] = useState('');
  const [exameFisico, setExameFisico] = useState('');
  const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState('');
  const [conduta, setConduta] = useState('');

  // Catalogs
  const [cidSearch, setCidSearch] = useState('');
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const [tussSearch, setTussSearch] = useState('');
  const [selectedTuss, setSelectedTuss] = useState<string[]>([]);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  const specialtyTemplates = templatesForSpecialty(userProfile?.specialty);
  const availableTemplates = specialtyTemplates.length > 0 ? specialtyTemplates : SPECIALTY_TEMPLATES;

  const applyTemplate = (templateId: string) => {
    const tpl = SPECIALTY_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    if (tpl.fields.queixa) setQueixa(tpl.fields.queixa);
    if (tpl.fields.hda) setHda(tpl.fields.hda);
    if (tpl.fields.exameFisico) setExameFisico(tpl.fields.exameFisico);
    if (tpl.fields.conduta) setConduta(tpl.fields.conduta);
    if (tpl.fields.hipoteseDiagnostica) setHipoteseDiagnostica(tpl.fields.hipoteseDiagnostica);
    setShowTemplateMenu(false);
    toast.success(`Template "${tpl.name}" aplicado`);
  };

  useEffect(() => {
    if (!patientId) return;
    const fetchPatient = async () => {
      const docRef = doc(db, 'pacientes', patientId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setPatient({ id: snap.id, ...snap.data() } as Paciente);
    };
    fetchPatient();
  }, [patientId]);

  const handleSave = async () => {
    if (!user || !patientId || !tenantId) return;
    if (!queixa.trim()) {
      toast.error('Informe ao menos a queixa principal.');
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (activeTab === 'anamnese') {
        await addDoc(collection(db, `pacientes/${patientId}/anamneses`), {
          pacienteId: patientId, queixaPrincipal: queixa, hda,
          userId: tenantId, createdAt: now,
        });
      } else {
        await addDoc(collection(db, `pacientes/${patientId}/consultas`), {
          pacienteId: patientId, data: now, queixa, exameFisico,
          hipoteseDiagnostica, conduta,
          cid10: selectedCids, tuss: selectedTuss, userId: tenantId,
        });
      }
      toast.success('Registro salvo com sucesso!');
      navigate(`/patients/${patientId}`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar registro.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCids = useMemo(
    () => CID_MOCK.filter(c =>
      c.descricao.toLowerCase().includes(cidSearch.toLowerCase()) ||
      c.codigo.toLowerCase().includes(cidSearch.toLowerCase())
    ),
    [cidSearch]
  );
  const filteredTuss = useMemo(
    () => TUSS_MOCK.filter(t =>
      t.descricao.toLowerCase().includes(tussSearch.toLowerCase()) ||
      t.codigo.toLowerCase().includes(tussSearch.toLowerCase())
    ),
    [tussSearch]
  );

  const today = useMemo(
    () => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
    []
  );

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">Carregando…</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <header className="sticky top-0 lg:top-0 z-30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-6 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-apple-blue">
                  {activeTab === 'anamnese' ? 'Anamnese' : 'Evolução Clínica'}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-[11px] text-gray-500 capitalize truncate">{today}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 truncate">
                {patient.nome}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Template dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTemplateMenu(v => !v)}
                className="h-11 px-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-sm font-semibold text-gray-700 flex items-center gap-2 transition-colors shadow-sm"
              >
                <Sparkles size={16} className="text-apple-blue" />
                <span className="hidden sm:inline">Templates</span>
                <ChevronDown size={14} className={`transition-transform ${showTemplateMenu ? 'rotate-180' : ''}`} />
              </button>
              {showTemplateMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowTemplateMenu(false)} />
                  <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-2">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Templates por especialidade</p>
                    </div>
                    {availableTemplates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t.id)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-apple-blue mt-2 shrink-0"></div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{t.specialty}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-11 px-6 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold gap-2 shadow-lg shadow-blue-500/25"
            >
              <Save size={16} />
              {saving ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-4 inline-flex p-1 bg-gray-100 rounded-xl">
          {[
            { key: 'evolution' as TabKey, label: 'Evolução Clínica', icon: Stethoscope },
            { key: 'anamnese' as TabKey, label: 'Anamnese Completa', icon: ClipboardCheck },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-5">
          <Section icon={Activity} title="Queixa Principal" subtitle="Motivo da consulta hoje">
            <Input
              placeholder="Ex: Cefaleia há 3 dias, dor torácica…"
              value={queixa}
              onChange={e => setQueixa(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-white text-base focus-visible:ring-apple-blue/30"
            />
          </Section>

          <Section icon={FileText} title="HDA / Evolução" subtitle="História da doença atual">
            <Textarea
              placeholder="Descrição detalhada do quadro clínico: início, evolução, fatores de melhora/piora, sintomas associados…"
              value={hda}
              onChange={e => setHda(e.target.value)}
              className="min-h-[200px] rounded-xl border-gray-200 bg-white text-base leading-relaxed focus-visible:ring-apple-blue/30 resize-y"
            />
          </Section>

          {activeTab === 'evolution' && (
            <>
              <Section icon={Stethoscope} title="Exame Físico" subtitle="Achados objetivos">
                <Textarea
                  placeholder="BEG, LOTE, hidratado, corado, afebril. PA, FC, FR, SatO2. Ausculta CR, abdome…"
                  value={exameFisico}
                  onChange={e => setExameFisico(e.target.value)}
                  className="min-h-[160px] rounded-xl border-gray-200 bg-white text-base leading-relaxed focus-visible:ring-apple-blue/30 resize-y"
                />
              </Section>

              <Section icon={TestTube} title="Hipótese Diagnóstica" subtitle="Diagnóstico provável">
                <Textarea
                  placeholder="Diagnóstico provável e diagnósticos diferenciais…"
                  value={hipoteseDiagnostica}
                  onChange={e => setHipoteseDiagnostica(e.target.value)}
                  className="min-h-[100px] rounded-xl border-gray-200 bg-white text-base leading-relaxed focus-visible:ring-apple-blue/30 resize-y"
                />
              </Section>
            </>
          )}

          <Section icon={ClipboardCheck} title="Conduta" subtitle="Plano terapêutico e próximas etapas">
            <Textarea
              placeholder="Prescrição, exames solicitados, orientações, retorno…"
              value={conduta}
              onChange={e => setConduta(e.target.value)}
              className="min-h-[140px] rounded-xl border-gray-200 bg-white text-base leading-relaxed focus-visible:ring-apple-blue/30 resize-y"
            />
          </Section>
        </div>

        {/* SIDE COLUMN */}
        <aside className="space-y-5">
          {activeTab === 'evolution' && (
            <>
              <CatalogCard
                title="Diagnóstico"
                badge="CID-10"
                badgeColor="blue"
                searchValue={cidSearch}
                onSearchChange={setCidSearch}
                items={filteredCids}
                selected={selectedCids}
                onToggle={(code) =>
                  setSelectedCids(selectedCids.includes(code)
                    ? selectedCids.filter(c => c !== code)
                    : [...selectedCids, code])
                }
              />
              <CatalogCard
                title="Procedimentos"
                badge="TUSS"
                badgeColor="emerald"
                searchValue={tussSearch}
                onSearchChange={setTussSearch}
                items={filteredTuss}
                selected={selectedTuss}
                onToggle={(code) =>
                  setSelectedTuss(selectedTuss.includes(code)
                    ? selectedTuss.filter(c => c !== code)
                    : [...selectedTuss, code])
                }
              />
            </>
          )}

          {/* Patient quick info */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">Paciente</p>
            <p className="text-lg font-bold mb-3">{patient.nome}</p>
            <div className="space-y-2 text-sm">
              {patient.nascimento && (
                <div className="flex justify-between">
                  <span className="text-white/60">Nascimento</span>
                  <span className="font-semibold">{new Date(patient.nascimento).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {patient.sexo && (
                <div className="flex justify-between">
                  <span className="text-white/60">Sexo</span>
                  <span className="font-semibold">{patient.sexo}</span>
                </div>
              )}
              {patient.convenio && (
                <div className="flex justify-between">
                  <span className="text-white/60">Convênio</span>
                  <span className="font-semibold truncate ml-2">{patient.convenio}</span>
                </div>
              )}
              {patient.alergias && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1">⚠ Alergias</p>
                  <p className="text-xs text-white/90">{patient.alergias}</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  icon: Icon, title, subtitle, children,
}: {
  icon: any; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-apple-blue flex items-center justify-center">
          <Icon size={16} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function CatalogCard({
  title, badge, badgeColor, searchValue, onSearchChange, items, selected, onToggle,
}: {
  title: string;
  badge: string;
  badgeColor: 'blue' | 'emerald';
  searchValue: string;
  onSearchChange: (v: string) => void;
  items: { codigo: string; descricao: string }[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-apple-blue', pillBg: 'bg-blue-100', pillText: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', pillBg: 'bg-emerald-100', pillText: 'text-emerald-700' },
  }[badgeColor];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${colorMap.bg} ${colorMap.text} flex items-center justify-center`}>
            <Tag size={14} />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${colorMap.pillBg} ${colorMap.pillText}`}>
          {badge}
        </span>
      </div>

      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <Input
            placeholder={`Pesquisar ${badge}…`}
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 h-10 rounded-xl border-gray-200 bg-gray-50 text-sm focus-visible:ring-apple-blue/30 focus-visible:bg-white"
          />
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto px-2 pb-2 space-y-0.5">
        {items.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">Nenhum resultado</p>
        ) : items.map(item => {
          const isSelected = selected.includes(item.codigo);
          return (
            <button
              key={item.codigo}
              onClick={() => onToggle(item.codigo)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isSelected ? `${colorMap.bg} ${colorMap.text}` : 'hover:bg-gray-50'
              }`}
            >
              <span className={`text-[11px] font-bold tabular-nums w-16 shrink-0 ${isSelected ? colorMap.text : 'text-gray-700'}`}>
                {item.codigo}
              </span>
              <span className={`text-xs truncate flex-1 ${isSelected ? colorMap.text : 'text-gray-600'}`}>
                {item.descricao}
              </span>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
          <div className="flex flex-wrap gap-1.5">
            {selected.map(code => (
              <span
                key={code}
                className={`inline-flex items-center gap-1 ${colorMap.pillBg} ${colorMap.pillText} px-2 py-1 rounded-md text-[11px] font-bold`}
              >
                {code}
                <button onClick={() => onToggle(code)} className="hover:opacity-70">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
