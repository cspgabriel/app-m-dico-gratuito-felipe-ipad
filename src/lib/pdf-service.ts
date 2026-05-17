import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Paciente, Consulta, Anamnese } from '../types';

export function generatePDF(patient: Paciente, consultations: Consulta[], anamneses: Anamnese[]) {
  const doc = new jsPDF('p', 'mm', 'a4') as any;
  const marginX = 20;
  let y = 25;

  // Colors
  const headerColor = [0, 48, 135]; // Deep hospital blue
  const textColor = [60, 60, 60];
  const lightGray = [220, 220, 225];

  // Global Styles
  doc.setFont('helvetica');

  // --- HEADER ---
  doc.setFontSize(24);
  doc.setTextColor(...headerColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Clinicafy', marginX, y);
  
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Prontuário Médico Eletrônico', 140, y);
  
  y += 10;
  doc.setDrawColor(...headerColor);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, 190, y);
  y += 15;

  // --- PATIENT DATA ---
  doc.setFillColor(248, 248, 250);
  doc.rect(marginX, y - 5, 170, 30, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(`Paciente: ${patient.nome}`, marginX + 5, y + 2);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`CPF: ${patient.cpf || 'Não informado'} | Nasc: ${patient.nascimento ? new Date(patient.nascimento).toLocaleDateString() : 'Não inf.'} | Sexo: ${patient.sexo || 'Não inf.'}`, marginX + 5, y + 10);
  doc.text(`Convênio: ${patient.convenio || 'Particular'} | Telefone: ${patient.telefone || 'Não inf.'}`, marginX + 5, y + 16);
  if (patient.alergias) {
    doc.setTextColor(200, 0, 0); // Red for allergies
    doc.setFont('helvetica', 'bold');
    doc.text(`ALERGIAS: ${patient.alergias}`, marginX + 5, y + 22);
  }
  
  y += 35;

  // --- LAST ANAMNESIS ---
  if (anamneses.length > 0) {
    const ana = anamneses[0];
    doc.setFontSize(12);
    doc.setTextColor(...headerColor);
    doc.setFont('helvetica', 'bold');
    doc.text('ANAMNESE / HISTÓRICO RECENTE', marginX, y);
    y += 5;
    
    doc.autoTable({
      startY: y,
      head: [],
      body: [
        [{ content: 'Queixa Principal', styles: { fontStyle: 'bold', cellWidth: 40 } }, ana.queixaPrincipal],
        [{ content: 'HDA', styles: { fontStyle: 'bold' } }, ana.hda],
        [{ content: 'Antecedentes', styles: { fontStyle: 'bold' } }, ana.antecedentesPessoais || '---'],
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, textColor: [60,60,60], lineColor: lightGray },
      columnStyles: { 0: { fillColor: [245, 245, 245] } }
    });
    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // --- CLINICAL EVOLUTION ---
  if (consultations.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(...headerColor);
    doc.setFont('helvetica', 'bold');
    doc.text('EVOLUÇÃO CLÍNICA / CONSULTAS', marginX, y);
    y += 5;

    const body = consultations.map(c => [
      new Date(c.data).toLocaleDateString(),
      c.queixa || '-',
      c.exameFisico || '-',
      c.conduta || '-',
      c.cid10?.join(', ') || '-',
      c.tuss?.join(', ') || '-' // Added TUSS to export
    ]);

    doc.autoTable({
      startY: y,
      head: [['Data', 'Queixa/Motivo', 'Exame Físico', 'Conduta', 'CID', 'TUSS']],
      body: body,
      theme: 'striped',
      headStyles: { fillColor: headerColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 4, textColor: [60, 60, 60] },
      alternateRowStyles: { fillColor: [248, 248, 250] }
    });
    y = (doc as any).lastAutoTable.finalY + 30;
  }

  // --- SIGNATURE AREA ---
  // Ensure we don't draw it too close to the bottom
  if (y > 250) {
    doc.addPage();
    y = 30;
  }
  
  doc.setDrawColor(...headerColor);
  doc.setLineWidth(0.5);
  doc.line(70, y, 140, y);
  
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Assinatura do Médico(a)', 105, y + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('CRM:', 105, y + 12, { align: 'center' });


  // --- FOOTER AND PAGINATION ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}`, marginX, 285);
    doc.text(`Página ${i} de ${pageCount}`, 180, 285, { align: 'right' });
  }

  doc.save(`Prontuario_${patient.nome.replace(/\s+/g, '_')}.pdf`);
}
