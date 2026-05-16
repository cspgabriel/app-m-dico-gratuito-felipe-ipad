import React, { useEffect, useState } from 'react';
import { collection, query, where, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../components/FirebaseProvider';
import { Paciente } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, UserPlus, FileText, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

export default function PatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New patient state
  const [newName, setNewName] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newTelefone, setNewTelefone] = useState('');
  const [newNascimento, setNewNascimento] = useState('');
  const [newSexo, setNewSexo] = useState<'M' | 'F' | 'Outro'>('M');
  const [newConvenio, setNewConvenio] = useState('');
  const [newAlergias, setNewAlergias] = useState('');
  const [newMedicacoes, setNewMedicacoes] = useState('');
  const [newHistorico, setNewHistorico] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pacientes'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      setPatients(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pacientes');
    });

    return unsubscribe;
  }, [user]);

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.cpf?.includes(searchTerm)
  );

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName) return;

    try {
      setLoading(true);
      const now = new Date().toISOString();
      await addDoc(collection(db, 'pacientes'), {
        nome: newName,
        cpf: newCpf,
        telefone: newTelefone,
        nascimento: newNascimento,
        sexo: newSexo,
        convenio: newConvenio,
        alergias: newAlergias,
        medicacoes: newMedicacoes,
        historico: newHistorico,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      });
      toast.success('Paciente cadastrado com sucesso!');
      setIsModalOpen(false);
      setNewName('');
      setNewCpf('');
      setNewTelefone('');
      setNewNascimento('');
      setNewSexo('M');
      setNewConvenio('');
      setNewAlergias('');
      setNewMedicacoes('');
      setNewHistorico('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cadastrar paciente.');
    } finally {
      setLoading(false);
    }
  };

  const seedMockData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const mocks = [
        {
          nome: "Maria das Graças Oliveira",
          cpf: "123.456.789-00",
          telefone: "(11) 98765-4321",
          nascimento: "1965-04-12",
          sexo: "F" as const,
          convenio: "Unimed",
          alergias: "Iodo, Dipirona",
          medicacoes: "Losartana 50mg, AAS 100mg",
          historico: "Hipertensa há 10 anos. HAS bem controlada.",
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          nome: "Roberto Carlos Santos",
          cpf: "987.654.321-11",
          telefone: "(21) 91234-5678",
          nascimento: "1980-11-20",
          sexo: "M" as const,
          convenio: "Amil",
          alergias: "",
          medicacoes: "Omeprazol 20mg",
          historico: "Gastrite esporádica. Sem comorbidades graves.",
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          nome: "Aline Ferreira Lima",
          cpf: "456.123.789-22",
          telefone: "(31) 99999-8888",
          nascimento: "1995-08-05",
          sexo: "F" as const,
          convenio: "Particular",
          alergias: "Penicilina",
          medicacoes: "Nenhuma",
          historico: "Paciente hígida.",
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      for (const mock of mocks) {
        await addDoc(collection(db, 'pacientes'), mock);
      }
      toast.success('Pacientes de teste gerados com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar pacientes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-apple-gray-dark">Gerencie seus pacientes e prontuários</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={seedMockData} 
            disabled={loading}
            className="rounded-xl gap-2"
          >
            <Database size={20} />
            Gerar Exemplos
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-apple-blue hover:bg-blue-600 rounded-xl gap-2 shadow-lg shadow-blue-500/20">
                <UserPlus size={20} />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastro de Paciente</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePatient} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input 
                    placeholder="Ex: João da Silva" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="rounded-xl border-apple-gray focus-visible:ring-apple-blue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CPF</label>
                  <Input 
                    placeholder="000.000.000-00" 
                    value={newCpf} 
                    onChange={e => setNewCpf(e.target.value)}
                    className="rounded-xl border-apple-gray focus-visible:ring-apple-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Nascimento</label>
                  <Input 
                    type="date"
                    value={newNascimento} 
                    onChange={e => setNewNascimento(e.target.value)}
                    className="rounded-xl border-apple-gray focus-visible:ring-apple-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sexo</label>
                  <select 
                    value={newSexo}
                    onChange={e => setNewSexo(e.target.value as any)}
                    className="w-full flex h-10 w-full items-center justify-between rounded-xl border border-apple-gray bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    value={newTelefone} 
                    onChange={e => setNewTelefone(e.target.value)}
                    className="rounded-xl border-apple-gray focus-visible:ring-apple-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Convênio</label>
                  <Input 
                    placeholder="Ex: Unimed, Amil..." 
                    value={newConvenio} 
                    onChange={e => setNewConvenio(e.target.value)}
                    className="rounded-xl border-apple-gray focus-visible:ring-apple-blue"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium">Alergias</label>
                  <Input 
                    placeholder="Ex: Penicilina, Dipirona..." 
                    value={newAlergias} 
                    onChange={e => setNewAlergias(e.target.value)}
                    className="rounded-xl border-apple-gray focus-visible:ring-apple-blue text-red-500"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium">Medicações em uso</label>
                  <Input 
                    placeholder="Ex: Losartana 50mg..." 
                    value={newMedicacoes} 
                    onChange={e => setNewMedicacoes(e.target.value)}
                    className="rounded-xl border-apple-gray focus-visible:ring-apple-blue"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-apple-blue hover:bg-blue-600 rounded-xl">
                  {loading ? 'Salvando...' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-apple-gray-dark" size={20} />
        <Input 
          placeholder="Buscar pacientes por nome ou CPF..." 
          className="pl-10 h-12 apple-glass rounded-xl shadow-sm border-none focus-visible:ring-apple-blue"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="rounded-2xl border-none shadow-sm apple-card p-0 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/40 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-[100px]">Iniciais</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cadastrado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map(p => (
                <TableRow key={p.id} className="hover:bg-apple-gray/50 transition-colors">
                  <TableCell>
                    <div className="w-10 h-10 rounded-full bg-apple-blue/10 flex items-center justify-center text-apple-blue font-bold">
                      {p.nome[0].toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell>{p.cpf || '---'}</TableCell>
                  <TableCell className="text-apple-gray-dark text-sm">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/patients/${p.id}`}>
                      <Button variant="ghost" size="sm" className="text-apple-blue hover:bg-apple-blue/5 rounded-lg gap-2">
                        <FileText size={16} />
                        Prontuário
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-apple-gray-dark italic">
                  {searchTerm ? 'Nenhum paciente encontrado para esta busca.' : 'Nenhum paciente cadastrado.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
