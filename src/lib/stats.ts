import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

type StatField = 'patients' | 'consultations' | 'agendamentos' | 'anamneses' | 'exames';

export async function bumpStat(tenantId: string, field: StatField, delta: number = 1): Promise<void> {
  if (!tenantId) return;
  try {
    await setDoc(
      doc(db, `users/${tenantId}/stats/summary`),
      { [field]: increment(delta), updatedAt: serverTimestamp() },
      { merge: true },
    );
  } catch (err) {
    console.error('bumpStat', err);
  }
}
