import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Paciente } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  Database,
  Stethoscope,
  Microscope,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

// Mock CID data
const CID_MOCK = [
  { codigo: 'I10', descricao: 'Hipertensão essencial (primária)' },
  { codigo: 'E11', descricao: 'Diabetes mellitus não-insulino-dependente' },
  { codigo: 'J00', descricao: 'Nasofaringite aguda (resfriado comum)' },
  { codigo: 'K29', descricao: 'Gastrite e duodenite' },
  { codigo: 'M54.5', descricao: 'Dor lombar baixa' },
  { codigo: 'Z00', descricao: 'Exame médico geral' }
];

// Mock TUSS data
const TUSS_MOCK = [
  { codigo: '10101012', descricao: 'Consulta em consultório (no horário normal ou preestabelecido)' },
  { codigo: '10101020', descricao: 'Consulta em domicílio' },
  { codigo: '10101039', descricao: 'Consulta em pronto-socorro' },
  { codigo: '20104049', descricao: 'Avaliação clínica e eletroneuromiográfica' },
  { codigo: '20104235', descricao: 'Polissonografia de noite inteira' }
];

export default function ConsultationPage() {
  const { patientId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, tenantId } = useAuth();
  const [patient, setPatient] = useState<Paciente | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'evolution');

  // Form states
  const [queixa, setQueixa] = useState('');
  const [hda, setHda] = useState('');
  const [exameFisico, setExameFisico] = useState('');
  const [conduta, setConduta] = useState('');
  const [cidSearch, setCidSearch] = useState('');
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  
  const [tussSearch, setTussSearch] = useState('');
  const [selectedTuss, setSelectedTuss] = useState<string[]>([]);

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiInput, setAiInput] = useState('');

  useEffect(() => {
    if (!patientId) return;
    const fetchPatient = async () => {
      const docRef = doc(db, 'pacientes', patientId);
      const snap = await getDoc(docRef);
      if (snap.exists()) setPatient({ id: snap.id, ...snap.data() } as Paciente);
    };
    fetchPatient();
  }, [patientId]);

  const handleAiProcess = async () => {
    if (!aiInput) return;
    try {
      setIsAiProcessing(true);
      const res = await fetch('/api/ai/process-anamnesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiInput }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setQueixa(data.queixaPrincipal || '');
      setHda(data.hda || '');
      setExameFisico(data.exameFisico || '');
      setConduta(data.conduta || '');
      toast.success('Informações processadas e organizadas com sucesso!');
      setAiInput('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar as informações.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !patientId || !tenantId) return;
    try {
      const now = new Date().toISOString();
      if (activeTab === 'anamnese') {
        await addDoc(collection(db, `pacientes/${patientId}/anamneses`), {
          pacienteId: patientId,
          queixaPrincipal: queixa,
          hda,
          userId: tenantId,
          createdAt: now
        });
      } else {
        await addDoc(collection(db, `pacientes/${patientId}/consultas`), {
          pacienteId: patientId,
          data: now,
          queixa,
          exameFisico,
          conduta,
          cid10: selectedCids,
          tuss: selectedTuss,
          userId: tenantId
        });
      }
      toast.success('Registro salvo com sucesso!');
      navigate(`/patients/${patientId}`);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar registro.');
    }
  };

  if (!patient) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/60">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl hover:bg-white/50 shrink-0"><ArrowLeft size={20} /></Button>
          <div className="overflow-hidden">
            <h2 className="text-xl font-bold truncate">{activeTab === 'anamnese' ? 'Nova Anamnese' : 'Nova Consulta'}</h2>
            <p className="text-sm text-apple-gray-dark font-medium italic truncate">Paciente: {patient.nome}</p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-apple-blue hover:bg-blue-600 text-white rounded-xl gap-2 shadow-lg shadow-blue-500/20 px-8 w-full sm:w-auto">
          <Save size={18} />
          Salvar
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="apple-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-md flex items-center gap-2">
                <Sparkles size={18} className="text-apple-blue" />
                Anamnese Estruturada Automática
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Cole aqui o texto da consulta ou dite as observações para o sistema organizar..."
                className="min-h-[120px] rounded-xl bg-white/40 border border-white/20 focus-visible:ring-apple-blue resize-none"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
              />
              <Button 
                onClick={handleAiProcess} 
                className="w-full bg-white/60 hover:bg-white/80 text-[#007AFF] font-bold rounded-xl gap-2 border-none backdrop-blur-sm"
                disabled={isAiProcessing}
              >
                {isAiProcessing ? 'Processando...' : 'Organizar Automaticamente'}
              </Button>
            </CardContent>
          </Card>

          <Card className="apple-card">
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/40 backdrop-blur-md mb-6 w-fit rounded-xl p-1 border border-white/20">
                  <TabsTrigger value="evolution" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Evolução Clínica</TabsTrigger>
                  <TabsTrigger value="anamnese" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Anamnese Completa</TabsTrigger>
                </TabsList>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Queixa Principal / Motivo</label>
                    <Input 
                      placeholder="Principal motivo da consulta hoje" 
                      className="rounded-xl border-white/40 bg-white/40 focus-visible:ring-apple-blue"
                      value={queixa}
                      onChange={e => setQueixa(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">História / Evolução (HDA)</label>
                    <Textarea 
                      placeholder="Descrição detalhada do quadro clínico" 
                      className="min-h-[200px] rounded-xl border-white/40 bg-white/40 focus-visible:ring-apple-blue"
                      value={hda}
                      onChange={e => setHda(e.target.value)}
                    />
                  </div>

                  {activeTab === 'evolution' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Exame Físico</label>
                      <Textarea 
                        placeholder="Achados do exame físico" 
                        className="rounded-xl border-white/40 bg-white/40 focus-visible:ring-apple-blue"
                        value={exameFisico}
                        onChange={e => setExameFisico(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Conduta / Plano Terapêutico</label>
                    <Textarea 
                      placeholder="Próximas etapas, medicamentos, exames solicitados" 
                      className="min-h-[120px] rounded-xl border-white/40 bg-white/40 focus-visible:ring-apple-blue"
                      value={conduta}
                      onChange={e => setConduta(e.target.value)}
                    />
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="apple-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Database size={16} />
                Diagnóstico (CID-10)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 text-apple-gray-dark" size={16} />
                <Input 
                  placeholder="Pesquisar CID..." 
                  className="pl-8 h-9 rounded-lg text-sm apple-glass border-none"
                  value={cidSearch}
                  onChange={e => setCidSearch(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                {CID_MOCK.filter(c => c.descricao.toLowerCase().includes(cidSearch.toLowerCase()) || c.codigo.includes(cidSearch)).map(c => (
                  <div 
                    key={c.codigo} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-apple-gray cursor-pointer text-xs"
                    onClick={() => !selectedCids.includes(c.codigo) && setSelectedCids([...selectedCids, c.codigo])}
                  >
                    <span className="font-bold w-10">{c.codigo}</span>
                    <span className="text-apple-gray-dark truncate flex-1 ml-2">{c.descricao}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
                {selectedCids.map(code => (
                  <div key={code} className="bg-apple-blue/10 text-apple-blue px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                    {code}
                    <button onClick={() => setSelectedCids(selectedCids.filter(c => c !== code))}>×</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="apple-card">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                Procedimentos (TUSS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 text-apple-gray-dark" size={16} />
                <Input 
                  placeholder="Pesquisar procedimento TUSS..." 
                  className="pl-8 h-9 rounded-lg text-sm apple-glass border-none"
                  value={tussSearch}
                  onChange={e => setTussSearch(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                {TUSS_MOCK.filter(t => t.descricao.toLowerCase().includes(tussSearch.toLowerCase()) || t.codigo.includes(tussSearch)).map(t => (
                  <div 
                    key={t.codigo} 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-apple-gray cursor-pointer text-xs"
                    onClick={() => !selectedTuss.includes(t.codigo) && setSelectedTuss([...selectedTuss, t.codigo])}
                  >
                    <span className="font-bold w-16">{t.codigo}</span>
                    <span className="text-apple-gray-dark truncate flex-1 ml-2">{t.descricao}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
                {selectedTuss.map(code => (
                  <div key={code} className="bg-green-500/10 text-green-600 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                    {code}
                    <button onClick={() => setSelectedTuss(selectedTuss.filter(t => t !== code))}>×</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
