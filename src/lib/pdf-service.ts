import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Paciente, Consulta, Anamnese } from '../types';

export function generatePDF(patient: Paciente, consultations: Consulta[], anamneses: Anamnese[]) {
  const doc = new jsPDF() as any;
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 122, 255); // Apple Blue
  doc.text('MedSystem', margin, y);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Prontuário Médico Eletrônico', margin + 45, y - 1);
  
  y += 15;
  doc.setDrawColor(230, 230, 235);
  doc.line(margin, y, 190, y);
  y += 10;

  // Patient Info
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(patient.nome, margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`CPF: ${patient.cpf || '---'} | Nasc: ${patient.nascimento || '---'} | Sexo: ${patient.sexo || '---'}`, margin, y);
  y += 15;

  // Last Anamnesis
  if (anamneses.length > 0) {
    const ana = anamneses[0];
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('ANAMNESE MAIS RECENTE', margin, y);
    y += 7;
    
    doc.setFontSize(10);
    doc.autoTable({
      startY: y,
      head: [['Campo', 'Informação']],
      body: [
        ['Queixa Principal', ana.queixaPrincipal],
        ['História da Doença Atual', ana.hda],
        ['Antecedentes', ana.antecedentesPessoais || '---'],
      ],
      theme: 'striped',
      headStyles: { fillStyle: 'F', fillColor: [0, 122, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    y = (doc as any).lastAutoTable.finalY + 15;
  }

  // Consultations Table
  if (consultations.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('EVOLUÇÃO CLÍNICA', margin, y);
    y += 7;

    const body = consultations.map(c => [
      new Date(c.data).toLocaleDateString(),
      c.queixa || '---',
      c.cid10?.join(', ') || '---',
      c.conduta || '---'
    ]);

    doc.autoTable({
      startY: y,
      head: [['Data', 'Queixa', 'CID-10', 'Conduta']],
      body: body,
      theme: 'striped',
      headStyles: { fillStyle: 'F', fillColor: [0, 122, 255] },
      styles: { fontSize: 8, cellPadding: 3 },
    });
  }

  // Footer / Signature
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado via MedSystem em ${new Date().toLocaleString()}`, margin, 285);
    doc.text(`Página ${i} de ${pageCount}`, 170, 285);
  }

  doc.save(`Prontuario_${patient.nome.replace(/\s+/g, '_')}.pdf`);
}
