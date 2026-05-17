import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ReceiptData {
  numero: string;
  data: string; // ISO
  valor: number;
  servico: string;
  prestador: {
    nome: string;
    crm?: string;
    cpfCnpj?: string;
    endereco?: string;
    telefone?: string;
  };
  tomador: {
    nome: string;
    cpf?: string;
    endereco?: string;
  };
  formaPagamento?: string;
  observacoes?: string;
  retencaoINSS?: number; // percentage 0-100
  retencaoIR?: number;   // percentage 0-100
}

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

function numeroPorExtenso(value: number): string {
  // Compact pt-BR number to words for receipt — covers up to 9.999.999,99
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const ate999 = (n: number): string => {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const r = n % 100;
    const d = Math.floor(r / 10);
    const u = r % 10;
    const parts: string[] = [];
    if (c) parts.push(centenas[c]);
    if (r < 20) {
      if (r > 0) parts.push(unidades[r]);
    } else {
      parts.push(dezenas[d] + (u ? ' e ' + unidades[u] : ''));
    }
    return parts.join(' e ');
  };

  const inteiro = Math.floor(value);
  const centavos = Math.round((value - inteiro) * 100);
  const milhares = Math.floor(inteiro / 1000);
  const resto = inteiro % 1000;

  let texto = '';
  if (milhares > 0) {
    texto += (milhares === 1 ? 'mil' : ate999(milhares) + ' mil');
    if (resto > 0) texto += resto < 100 ? ' e ' : ', ';
  }
  if (resto > 0) texto += ate999(resto);
  if (inteiro === 0) texto = 'zero';

  texto += ' ' + (inteiro === 1 ? 'real' : 'reais');
  if (centavos > 0) {
    texto += ' e ' + ate999(centavos) + ' ' + (centavos === 1 ? 'centavo' : 'centavos');
  }
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function generateReceiptPDF(r: ReceiptData): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const M = 20;
  let y = 25;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 48, 135);
  doc.text('RECIBO DE PAGAMENTO DE SERVIÇOS', 105, y, { align: 'center' });
  y += 6;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${r.numero}`, 105, y, { align: 'center' });
  y += 10;

  doc.setDrawColor(0, 48, 135);
  doc.setLineWidth(0.4);
  doc.line(M, y, 190, y);
  y += 10;

  // Value box
  const liquido = r.valor - (r.retencaoINSS ? (r.valor * r.retencaoINSS) / 100 : 0) - (r.retencaoIR ? (r.valor * r.retencaoIR) / 100 : 0);

  doc.setFillColor(245, 248, 255);
  doc.rect(M, y, 170, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text('VALOR BRUTO', M + 5, y + 7);
  doc.setFontSize(16);
  doc.setTextColor(0, 48, 135);
  doc.text(fmtBRL(r.valor), 185, y + 9, { align: 'right' });
  if (r.retencaoINSS || r.retencaoIR) {
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Líquido: ${fmtBRL(liquido)}`, 185, y + 15, { align: 'right' });
  }
  y += 26;

  // Body — narrative receipt format (legal-style)
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'normal');
  const body =
    `Recebi de ${r.tomador.nome}` +
    (r.tomador.cpf ? `, CPF ${r.tomador.cpf}` : '') +
    (r.tomador.endereco ? `, residente em ${r.tomador.endereco}` : '') +
    `, a importância de ${fmtBRL(r.valor)} (${numeroPorExtenso(r.valor)}), ` +
    `referente a ${r.servico}, ` +
    `prestado(s) em ${fmtDate(r.data)}.`;
  const wrapped = doc.splitTextToSize(body, 170);
  doc.text(wrapped, M, y);
  y += wrapped.length * 6 + 4;

  if (r.retencaoINSS || r.retencaoIR) {
    const retParts: string[] = [];
    if (r.retencaoINSS) retParts.push(`INSS ${r.retencaoINSS}% (${fmtBRL((r.valor * r.retencaoINSS) / 100)})`);
    if (r.retencaoIR) retParts.push(`IRRF ${r.retencaoIR}% (${fmtBRL((r.valor * r.retencaoIR) / 100)})`);
    const ret = `Retenções: ${retParts.join(' | ')}.`;
    doc.text(doc.splitTextToSize(ret, 170), M, y);
    y += 8;
  }

  if (r.observacoes) {
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(doc.splitTextToSize(`Obs.: ${r.observacoes}`, 170), M, y);
    y += 8;
  }

  if (r.formaPagamento) {
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Forma de pagamento: ${r.formaPagamento}`, M, y);
    y += 7;
  }

  doc.setTextColor(40);
  doc.setFontSize(11);
  doc.text(`Para clareza, firmo o presente recibo.`, M, y);
  y += 20;

  // Signature
  doc.setDrawColor(80);
  doc.setLineWidth(0.3);
  doc.line(60, y, 150, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(r.prestador.nome, 105, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  const idLine = [r.prestador.crm && `CRM ${r.prestador.crm}`, r.prestador.cpfCnpj && `CPF/CNPJ ${r.prestador.cpfCnpj}`].filter(Boolean).join(' • ');
  if (idLine) doc.text(idLine, 105, y, { align: 'center' });
  y += 4;
  if (r.prestador.endereco) doc.text(r.prestador.endereco, 105, y, { align: 'center' });

  // Footer date
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Emitido em ${fmtDate(r.data)}`, 190, 285, { align: 'right' });

  return doc;
}

export function downloadReceipt(r: ReceiptData) {
  const doc = generateReceiptPDF(r);
  doc.save(`recibo-${r.numero}.pdf`);
}

type ExportableReceipt = ReceiptData & {
  pacienteNome?: string;
  status?: string;
  createdAt?: string;
  cancelledAt?: string;
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function exportReceiptsXls(receipts: ExportableReceipt[], filename = 'recibos.xls') {
  const rows = receipts.map((r) => ({
    Numero: r.numero,
    Data: fmtDate(r.data),
    Status: r.status === 'cancelled' ? 'Cancelado' : 'Emitido',
    Paciente: r.pacienteNome || r.tomador?.nome || '',
    CPF: r.tomador?.cpf || '',
    Servico: r.servico,
    FormaPagamento: r.formaPagamento || '',
    Valor: r.valor,
    Prestador: r.prestador?.nome || '',
    CRM: r.prestador?.crm || '',
    CpfCnpjPrestador: r.prestador?.cpfCnpj || '',
    Observacoes: r.observacoes || '',
    CriadoEm: r.createdAt ? fmtDate(r.createdAt) : '',
    CanceladoEm: r.cancelledAt ? fmtDate(r.cancelledAt) : '',
  }));

  const headers = Object.keys(rows[0] || {
    Numero: '',
    Data: '',
    Status: '',
    Paciente: '',
    CPF: '',
    Servico: '',
    FormaPagamento: '',
    Valor: '',
    Prestador: '',
    CRM: '',
    CpfCnpjPrestador: '',
    Observacoes: '',
    CriadoEm: '',
    CanceladoEm: '',
  });

  const table = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map(row => `<tr>${headers.map(h => `<td>${escapeHtml((row as any)[h])}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
    </html>`;

  const blob = new Blob([table], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadReceiptsPDF(receipts: ExportableReceipt[], filename = 'recibos.pdf') {
  const doc = new jsPDF('p', 'mm', 'a4');
  const total = receipts.reduce((sum, r) => sum + (r.status === 'cancelled' ? 0 : r.valor || 0), 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 48, 135);
  doc.text('RELATÓRIO DE RECIBOS', 105, 18, { align: 'center' });

  (doc as any).autoTable({
    startY: 28,
    head: [['Nº', 'Data', 'Paciente', 'Serviço', 'Status', 'Valor']],
    body: receipts.map(r => [
      r.numero,
      fmtDate(r.data),
      r.pacienteNome || r.tomador?.nome || '',
      r.servico,
      r.status === 'cancelled' ? 'Cancelado' : 'Emitido',
      fmtBRL(r.valor || 0),
    ]),
    foot: [['', '', '', '', 'Total válido', fmtBRL(total)]],
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 48, 135] },
    footStyles: { fillColor: [245, 248, 255], textColor: [0, 48, 135], fontStyle: 'bold' },
    margin: { left: 12, right: 12 },
  });

  doc.save(filename);
}
