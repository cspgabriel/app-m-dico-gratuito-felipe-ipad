import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { TissGuide } from '../types';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '-';

const fmtBRL = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    : '-';

const guideTypeLabel: Record<TissGuide['tipoGuia'], string> = {
  consulta: 'Guia de Consulta',
  sp_sadt: 'Guia SP/SADT',
  honorario: 'Guia de Honorário Individual',
};

const statusLabel: Record<TissGuide['status'], string> = {
  draft: 'Rascunho',
  authorized: 'Autorizada',
  submitted: 'Enviada',
  paid: 'Paga',
  glossed: 'Glosada',
  cancelled: 'Cancelada',
};

export function generateGuideNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  return `GUIA-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function downloadTissGuidePDF(guide: TissGuide) {
  const doc = new jsPDF('p', 'mm', 'a4') as any;
  const blue = [13, 24, 61];
  const muted = [100, 116, 139];
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...blue);
  doc.text(guideTypeLabel[guide.tipoGuia], 105, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text(`Nº ${guide.numeroGuia}`, 105, y, { align: 'center' });
  y += 10;

  doc.autoTable({
    startY: y,
    head: [['Operadora', 'Registro ANS', 'Status', 'Data atendimento']],
    body: [[
      guide.operadora || '-',
      guide.registroAns || '-',
      statusLabel[guide.status],
      fmtDate(guide.dataAtendimento),
    ]],
    theme: 'grid',
    headStyles: { fillColor: blue, textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.autoTable({
    startY: y,
    head: [['Beneficiário', 'CPF', 'Carteira', 'Plano', 'Validade']],
    body: [[
      guide.pacienteNome,
      guide.pacienteCpf || '-',
      guide.numeroCarteira || '-',
      guide.planoSaude || '-',
      fmtDate(guide.validadeCarteira),
    ]],
    theme: 'grid',
    headStyles: { fillColor: [22, 119, 255], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.autoTable({
    startY: y,
    head: [['CID-10', 'TUSS', 'Caráter', 'Tipo consulta', 'Valor']],
    body: [[
      guide.cid10?.join(', ') || '-',
      guide.tuss?.join(', ') || '-',
      guide.caraterAtendimento === 'urgencia' ? 'Urgência/Emergência' : 'Eletivo',
      guide.tipoConsulta || '-',
      fmtBRL(guide.valorTotal),
    ]],
    theme: 'grid',
    headStyles: { fillColor: blue, textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.autoTable({
    startY: y,
    head: [['Autorização', 'Data autorização', 'Validade senha', 'Guia operadora', 'Guia principal']],
    body: [[
      guide.senhaAutorizacao || '-',
      fmtDate(guide.dataAutorizacao),
      fmtDate(guide.validadeSenha),
      guide.numeroGuiaOperadora || '-',
      guide.numeroGuiaPrincipal || '-',
    ]],
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...blue);
  doc.text('Indicação clínica / conduta', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  const text = doc.splitTextToSize([guide.indicacaoClinica, guide.conduta].filter(Boolean).join('\n\n') || '-', 180);
  doc.text(text, 14, y);

  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text('Documento operacional para apoio ao faturamento. XML/lote TISS deve seguir versão vigente da ANS e regras da operadora.', 14, 285);
  doc.save(`${guide.numeroGuia}.pdf`);
}

export function exportGuidesCsv(guides: TissGuide[]) {
  const header = [
    'Numero guia',
    'Tipo',
    'Status',
    'Operadora',
    'Registro ANS',
    'Paciente',
    'CPF',
    'Carteira',
    'Data atendimento',
    'CID-10',
    'TUSS',
    'Autorizacao',
    'Valor',
    'Protocolo',
    'Glosa',
  ];
  const csv = [
    header.join(';'),
    ...guides.map((guide) => [
      guide.numeroGuia,
      guideTypeLabel[guide.tipoGuia],
      statusLabel[guide.status],
      guide.operadora,
      guide.registroAns || '',
      guide.pacienteNome,
      guide.pacienteCpf || '',
      guide.numeroCarteira || '',
      fmtDate(guide.dataAtendimento),
      guide.cid10?.join(', ') || '',
      guide.tuss?.join(', ') || '',
      guide.senhaAutorizacao || '',
      guide.valorTotal || '',
      guide.protocolo || '',
      guide.motivoGlosa || '',
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';')),
  ].join('\n');

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `guias-tiss-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export { guideTypeLabel, statusLabel };
