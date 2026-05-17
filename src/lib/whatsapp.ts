// Zero-cost WhatsApp integration via wa.me deeplinks.
// Opens WhatsApp Web/app with the message pre-filled — user taps "send".
// Works on iOS, Android, desktop. No API, no servers, no per-message cost.

function digits(phone: string): string {
  return (phone || '').replace(/\D/g, '');
}

/** Normalizes a Brazilian phone number to wa.me format (55DDXXXXXXXXX). */
export function normalizeBR(phone: string): string {
  const d = digits(phone);
  if (!d) return '';
  if (d.startsWith('55') && d.length >= 12) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
}

export function waLink(phone: string, message: string): string {
  const p = normalizeBR(phone);
  const text = encodeURIComponent(message);
  return p ? `https://wa.me/${p}?text=${text}` : `https://wa.me/?text=${text}`;
}

export interface AppointmentLike {
  clinicName?: string;
  doctorName?: string;
  data?: string | Date;
  tipo?: string;
  local?: string;
  telemedicineUrl?: string;
}

export function formatDate(d?: string | Date): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function reminderMessage(patientName: string, a: AppointmentLike): string {
  const clinic = a.clinicName || 'sua clínica';
  const when = formatDate(a.data);
  const local = a.telemedicineUrl ? `Telemedicina: ${a.telemedicineUrl}` : `Local: ${a.local || 'presencial'}`;
  return [
    `Olá, ${patientName}! 👋`,
    ``,
    `Passando pra lembrar da sua consulta em *${clinic}*`,
    `📅 ${when}`,
    `📍 ${local}`,
    ``,
    `Por favor, confirme com *SIM* para confirmar ou *REMARCAR* se precisar de outro horário.`,
    ``,
    `Obrigado(a)!`,
  ].join('\n');
}

export function confirmationMessage(patientName: string, a: AppointmentLike): string {
  return [
    `Olá, ${patientName}! ✅`,
    ``,
    `Sua consulta está confirmada para *${formatDate(a.data)}*.`,
    a.telemedicineUrl ? `\n🎥 Link da consulta: ${a.telemedicineUrl}` : '',
    ``,
    `Nos vemos em breve!`,
  ].filter(Boolean).join('\n');
}

export function prescriptionMessage(patientName: string, doctorName?: string): string {
  return [
    `Olá, ${patientName}! 💊`,
    ``,
    `Aqui está sua prescrição. Em caso de dúvida sobre a medicação, fale comigo.`,
    ``,
    doctorName ? `Atenciosamente,\nDr(a). ${doctorName}` : '',
  ].filter(Boolean).join('\n');
}
