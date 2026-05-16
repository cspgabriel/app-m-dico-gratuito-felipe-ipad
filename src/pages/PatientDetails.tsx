import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  addDoc 
} from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../components/FirebaseProvider';
import { Paciente, Anamnese, Consulta, Exame } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  FileText, 
  PlusCircle, 
  Calendar, 
  Activity, 
  Stethoscope,
  ChevronRight,
  Download,
  Phone
} from 'lucide-react';
import { motion } from 'motion/react';
import { generatePDF } from '../lib/pdf-service';
import { toast } from 'sonner';

export default function PatientDetails() {
  const { user, tenantId, userProfile } = useAuth();
  const { id } = useParams();
  const [patient, setPatient] = useState<Paciente | null>(null);
  const [consultations, setConsultations] = useState<Consulta[]>([]);
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [exams, setExams] = useState<Exame[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        const docRef = doc(db, 'pacientes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() } as Paciente);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const qConsultations = query(
      collection(db, `pacientes/${id}/consultas`),
      orderBy('data', 'desc')
    );
    const unsubConsultations = onSnapshot(qConsultations, (snap) => {
      setConsultations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Consulta)));
    });

    const qAnamneses = query(
      collection(db, `pacientes/${id}/anamneses`),
      orderBy('createdAt', 'desc')
    );
    const unsubAnamneses = onSnapshot(qAnamneses, (snap) => {
      setAnamneses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Anamnese)));
    });

    const qExams = query(
      collection(db, `pacientes/${id}/exames`),
      orderBy('dataUpload', 'desc')
    );
    const unsubExams = onSnapshot(qExams, (snap) => {
      setExams(snap.docs.map(d => ({ id: d.id, ...d.data() } as Exame)));
    });

    fetchPatient();
    return () => {
      unsubConsultations();
      unsubAnamneses();
      unsubExams();
    };
  }, [id]);

  const handleExportPDF = () => {
    if (!patient) return;
    try {
      generatePDF(patient, consultations, anamneses);
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !user) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `exames/${id}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error(error);
          toast.error('Erro ao fazer upload do arquivo.');
          setUploading(false);
          setUploadProgress(0);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, `pacientes/${id}/exames`), {
            pacienteId: id,
            nome: file.name,
            url: downloadURL,
            tipo: file.type,
            tamanho: file.size,
            userId: tenantId,
            dataUpload: new Date().toISOString()
          });
          toast.success('Exame salvo com sucesso!');
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (err) {
      console.error(err);
      toast.error('Erro ao iniciar upload.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!patient) return <div className="p-8 text-center">Paciente não encontrado.</div>;

  return (
    <div className="space-y-6">
      <Link to="/patients" className="inline-flex items-center gap-2 text-apple-gray-dark hover:text-apple-blue transition-colors">
        <ArrowLeft size={20} />
        <span>Voltar para lista</span>
      </Link>

      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#E5E5EA] shrink-0 overflow-hidden flex items-center justify-center text-apple-blue font-bold text-2xl shadow-inner">
            {patient.nome[0].toUpperCase()}
          </div>
          <div className="overflow-hidden w-full">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{patient.nome}</h2>
            <div className="flex flex-wrap gap-2 sm:gap-4 text-apple-gray-dark text-[10px] sm:text-xs font-medium mt-1 uppercase tracking-wide">
              <span>{patient.cpf || 'CPF: ---'}</span>
              <span className="hidden sm:inline">•</span>
              <span>ID: {patient.id.slice(0, 8).toUpperCase()}</span>
              {patient.alergias && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-[#FF3B30] w-full sm:w-auto truncate block sm:inline">Alergia: {patient.alergias}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl gap-2 apple-glass border-white/40 w-full sm:w-auto" onClick={handleExportPDF}>
            <Download size={18} />
            Exportar PDF
          </Button>
          <Link to={`/consultation/${patient.id}`} className="w-full sm:w-auto">
            <Button className="bg-apple-blue hover:bg-blue-600 text-white rounded-xl gap-2 shadow-lg shadow-blue-500/20 w-full sm:w-auto">
              <PlusCircle size={18} />
              Nova Consulta
            </Button>
          </Link>
        </div>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/40 backdrop-blur-md p-1 rounded-xl w-full max-w-2xl border border-white/20">
          <TabsTrigger value="overview" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="consultations" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Consultas ({consultations.length})</TabsTrigger>
          <TabsTrigger value="exams" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Exames</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="apple-card border-none shadow-sm md:col-span-1 border-t-4 border-t-apple-blue">
              <CardHeader className="pb-3 text-sm font-medium text-apple-gray-dark uppercase tracking-wider flex items-center justify-between">
                Informações de Contato
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="pt-4 border-t border-black/5 mt-4">
                  <h4 className="text-sm font-bold text-apple-gray-dark uppercase mb-2">Ações Rápidas</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      onClick={() => {
                        const eventTitle = encodeURIComponent(`Consulta - ${userProfile?.clinicName || 'Clínica'}`);
                        const details = encodeURIComponent(`Consulta agendada para ${patient.nome}`);
                        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${details}`, '_blank');
                      }}
                      variant="outline" size="sm" className="w-full rounded-xl justify-start gap-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold"
                    >
                      <Calendar size={14} /> Agendar em Calendário
                    </Button>
                    <Button 
                      onClick={() => toast.success('E-mail SMS de lembrete enviado (Simulação)')}
                      variant="outline" size="sm" className="w-full rounded-xl justify-start gap-2 font-semibold"
                    >
                      <Phone size={14} /> SMS Lembrete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="apple-card border-none shadow-sm md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-apple-gray-dark uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} />
                  Dados Clínicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-apple-gray-dark">Alergias</label>
                  <p className="text-sm mt-1">{patient.alergias || 'Nenhuma informada'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-apple-gray-dark">Medicações em uso</label>
                  <p className="text-sm mt-1">{patient.medicacoes || 'Nenhuma informada'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-apple-gray-dark">Histórico Familiar</label>
                  <p className="text-sm mt-1">{patient.historico || 'Nenhum informado'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="apple-card border-none shadow-sm">
              <CardHeader className="pb-3 text-sm font-medium text-apple-gray-dark uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Última Anamnese
                </div>
                {anamneses.length > 0 && <span className="text-[10px] bg-apple-gray px-2 py-0.5 rounded-full">{new Date(anamneses[0].createdAt).toLocaleDateString()}</span>}
              </CardHeader>
              <CardContent>
                {anamneses.length > 0 ? (
                  <div className="space-y-3">
                    <p className="font-semibold text-sm">{anamneses[0].queixaPrincipal}</p>
                    <p className="text-sm line-clamp-4 text-apple-gray-dark">{anamneses[0].hda}</p>
                    <Button variant="ghost" size="sm" className="text-apple-blue p-0 h-auto font-medium">Ver anamnese completa</Button>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-sm text-apple-gray-dark italic mb-4">Nenhuma anamnese registrada.</p>
                    <Link to={`/consultation/${patient.id}?type=anamnese`}>
                      <Button variant="outline" size="sm" className="rounded-xl border-apple-blue/20 text-apple-blue">Realizar Anamnese</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar size={20} />
              Consultas Recentes
            </h3>
            {consultations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultations.slice(0, 4).map(c => (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    key={c.id} 
                    className="apple-card p-4 flex gap-4 cursor-pointer hover:border-apple-blue/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-apple-gray flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-apple-gray-dark uppercase">{new Date(c.data).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-tight">{new Date(c.data).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{c.queixa || 'Consulta de Rotina'}</p>
                      <p className="text-xs text-apple-gray-dark line-clamp-1">{c.conduta}</p>
                    </div>
                    <ChevronRight className="text-apple-gray-dark self-center" size={16} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="apple-card p-12 text-center border-dashed border-2 border-apple-gray">
                <p className="text-apple-gray-dark mb-4">Ainda não há consultas registradas para este paciente.</p>
                <Link to={`/consultation/${patient.id}`}>
                  <Button className="bg-apple-blue rounded-xl">Iniciar Primeira Consulta</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="consultations" className="mt-6">
          <Card className="apple-card border-none shadow-sm p-4">
             {/* Full list of consultations here */}
             <div className="space-y-1">
               {consultations.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-4 hover:bg-apple-gray/50 rounded-xl transition-colors cursor-pointer border-b border-black/5 last:border-0">
                    <div className="flex items-center gap-4">
                      <Stethoscope className="text-apple-blue" size={20} />
                      <div>
                        <p className="font-medium">{new Date(c.data).toLocaleDateString()} - {c.queixa || 'Evolução Clínica'}</p>
                        <p className="text-xs text-apple-gray-dark">CID-10: {c.cid10?.join(', ') || 'Não informado'}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-apple-gray-dark" size={16} />
                  </div>
               ))}
               {consultations.length === 0 && <p className="text-center py-10 text-apple-gray-dark italic">Nenhuma consulta encontrada.</p>}
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="apple-card border-none shadow-sm p-8">
            <h3 className="font-bold mb-4">Informações Históricas</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-apple-gray-dark uppercase tracking-wider mb-2">Histórico Pessoal/Familiar</h4>
                <p>{patient.historico || 'Nenhuma informação disponível.'}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-apple-gray-dark uppercase tracking-wider mb-2">Alergias e Restrições</h4>
                <p className="text-red-500 font-medium">{patient.alergias || 'Nenhuma alergia conhecida.'}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-apple-gray-dark uppercase tracking-wider mb-2">Medicações em Uso</h4>
                <p>{patient.medicacoes || 'Nenhuma medicação informada.'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-6">
          <Card className="apple-card border-none shadow-sm p-8">
            <h3 className="font-bold mb-4">Exames e Uploads</h3>
            
            <div className="space-y-4">
              {exams.length > 0 ? exams.map(exame => (
                <div key={exame.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/80">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${exame.tipo.includes('pdf') ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                      <FileText className={exame.tipo.includes('pdf') ? 'text-red-500' : 'text-green-500'} size={24} />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{exame.nome}</span>
                      <span className="text-xs text-apple-gray-dark">
                        {exame.tipo.includes('pdf') ? 'PDF' : 'IMG'} • {(exame.tamanho / 1024 / 1024).toFixed(2)} MB • Enviado em {new Date(exame.dataUpload).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a href={exame.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="hover:bg-white/50 rounded-lg"><Download size={18} /></Button>
                  </a>
                </div>
              )) : (
                <div className="text-center py-6">
                  <p className="text-sm text-apple-gray-dark italic">Nenhum exame anexado.</p>
                </div>
              )}
            </div>

            <div className="mt-6 relative">
              <input 
                type="file" 
                id="examUpload" 
                className="hidden" 
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
              />
              <label 
                htmlFor="examUpload"
                className="block w-full text-center py-6 apple-glass border-2 border-dashed border-[#D1D1D6] text-apple-gray-dark hover:bg-white/60 hover:text-black hover:border-black/20 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl"
              >
                {uploading ? `Enviando... ${Math.round(uploadProgress)}%` : 'Clique ou arraste um arquivo para upload'}
              </label>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
