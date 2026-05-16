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
import { Search, UserPlus, FileText, MoreHorizontal } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pacientes'),
      where('userId', '==', user.uid),
      orderBy('nome', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Paciente));
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
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      });
      toast.success('Paciente cadastrado com sucesso!');
      setIsModalOpen(false);
      setNewName('');
      setNewCpf('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cadastrar paciente.');
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
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-apple-blue hover:bg-blue-600 rounded-xl gap-2 shadow-lg shadow-blue-500/20">
              <UserPlus size={20} />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastro de Paciente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePatient} className="space-y-4 pt-4">
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
                <label className="text-sm font-medium">CPF (Opcional)</label>
                <Input 
                  placeholder="000.000.000-00" 
                  value={newCpf} 
                  onChange={e => setNewCpf(e.target.value)}
                  className="rounded-xl border-apple-gray focus-visible:ring-apple-blue"
                />
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
