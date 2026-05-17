import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './FirebaseProvider';
import { downloadReceipt } from '../lib/receipt-service';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, Receipt, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  patient: { id: string; nome: string; cpf?: string; endereco?: string };
}

const SERVICOS_SUGERIDOS = [
  'Consulta médica',
  'Consulta de retorno',
  'Telemedicina',
  'Procedimento ambulatorial',
  'Avaliação especializada',
  'Emissão de laudo',
];

export default function ReceiptDialog({ open, onClose, patient }: ReceiptDialogProps) {
  const { user, tenantId, userProfile } = useAuth();
  const [servico, setServico] = useState('Consulta médica');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [retencaoINSS, setRetencaoINSS] = useState('');
  const [retencaoIR, setRetencaoIR] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setServico('Consulta médica');
      setValor('');
      setObservacoes('');
      setRetencaoINSS('');
      setRetencaoIR('');
      setData(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  if (!open) return null;

  const parseValor = (raw: string): number => {
    const cleaned = raw.replace(/[^\d,.-]/g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const generateNumero = async (): Promise<string> => {
    if (!tenantId) return `${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const year = new Date().getFullYear();
    const q = query(
      collection(db, 'recibos'),
      where('userId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    try {
      const snap = await getDocs(q);
      let next = 1;
      if (!snap.empty) {
        const last = snap.docs[0].data();
        const match = String(last.numero || '').match(/(\d+)$/);
        if (match) next = parseInt(match[1], 10) + 1;
      }
      return `${year}-${String(next).padStart(4, '0')}`;
    } catch {
      return `${year}-${String(Date.now()).slice(-6)}`;
    }
  };

  const handleSave = async () => {
    const valorNum = parseValor(valor);
    if (valorNum <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }
    if (!servico.trim()) {
      toast.error('Descreva o serviço prestado.');
      return;
    }
    if (!user || !tenantId) return;

    setSaving(true);
    try {
      const numero = await generateNumero();
      const dataISO = new Date(`${data}T12:00:00`).toISOString();
      const inss = retencaoINSS ? parseFloat(retencaoINSS) : 0;
      const ir = retencaoIR ? parseFloat(retencaoIR) : 0;

      const receiptData = {
        numero,
        data: dataISO,
        valor: valorNum,
        servico: servico.trim(),
        prestador: {
          nome: userProfile?.name || 'Profissional',
          crm: userProfile?.crm || '',
          endereco: userProfile?.clinicAddress || '',
          telefone: userProfile?.clinicPhone || '',
          cpfCnpj: '',
        },
        tomador: {
          nome: patient.nome,
          cpf: patient.cpf || '',
          endereco: '',
        },
        observacoes: observacoes.trim() || undefined,
        retencaoINSS: inss > 0 ? inss : undefined,
        retencaoIR: ir > 0 ? ir : undefined,
      };

      await addDoc(collection(db, 'recibos'), {
        ...receiptData,
        pacienteId: patient.id,
        pacienteNome: patient.nome,
        userId: tenantId,
        createdAt: new Date().toISOString(),
      });

      downloadReceipt(receiptData);
      toast.success(`Recibo ${numero} emitido!`);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao emitir recibo.');
    } finally {
      setSaving(false);
    }
  };

  const valorNum = parseValor(valor);
  const inssVal = retencaoINSS ? (valorNum * parseFloat(retencaoINSS)) / 100 : 0;
  const irVal = retencaoIR ? (valorNum * parseFloat(retencaoIR)) / 100 : 0;
  const liquido = valorNum - inssVal - irVal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt size={18} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Emitir Recibo</h2>
              <p className="text-xs text-gray-500">{patient.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
              Serviço / Procedimento
            </label>
            <Input
              list="servicos-sugeridos"
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              placeholder="Ex: Consulta médica, Procedimento X..."
              className="h-11 rounded-xl"
            />
            <datalist id="servicos-sugeridos">
              {SERVICOS_SUGERIDOS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                Valor (R$)
              </label>
              <Input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="h-11 rounded-xl text-lg font-bold"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                Data
              </label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <details className="rounded-xl border border-gray-200 overflow-hidden">
            <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Retenções (opcional)
            </summary>
            <div className="grid grid-cols-2 gap-3 p-4 border-t border-gray-100 bg-gray-50/30">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                  INSS (%)
                </label>
                <Input
                  value={retencaoINSS}
                  onChange={(e) => setRetencaoINSS(e.target.value)}
                  placeholder="0"
                  className="h-10 rounded-xl"
                  inputMode="decimal"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                  IRRF (%)
                </label>
                <Input
                  value={retencaoIR}
                  onChange={(e) => setRetencaoIR(e.target.value)}
                  placeholder="0"
                  className="h-10 rounded-xl"
                  inputMode="decimal"
                />
              </div>
            </div>
          </details>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
              Observações (opcional)
            </label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Forma de pagamento, número de parcelas, etc."
              className="rounded-xl min-h-[60px]"
            />
          </div>

          {valorNum > 0 && (
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
              <div className="flex items-center justify-between text-sm text-emerald-900">
                <span>Bruto</span>
                <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorNum)}</span>
              </div>
              {(inssVal > 0 || irVal > 0) && (
                <>
                  {inssVal > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 mt-1">
                      <span>− INSS ({retencaoINSS}%)</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inssVal)}</span>
                    </div>
                  )}
                  {irVal > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-700 mt-1">
                      <span>− IRRF ({retencaoIR}%)</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(irVal)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-base text-emerald-900 mt-2 pt-2 border-t border-emerald-200">
                    <span className="font-bold">Líquido</span>
                    <span className="font-black">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(liquido)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {(!userProfile?.name || !userProfile?.crm) && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              ⚠ Complete seu perfil em <strong>Configurações</strong> (nome do profissional, CRM, endereço) para que apareçam no PDF do recibo.
            </p>
          )}
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex gap-2 rounded-b-3xl">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || valorNum <= 0}
            className="flex-1 rounded-xl bg-apple-blue hover:bg-blue-600 text-white font-bold gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {saving ? 'Emitindo…' : 'Emitir e baixar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
