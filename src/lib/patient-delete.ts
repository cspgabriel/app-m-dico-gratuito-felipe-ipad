import { collection, deleteDoc, doc, getDocs, query, limit } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

const SUBCOLLECTIONS = ['consultas', 'anamneses', 'prescricoes', 'exames'] as const;

async function deleteSubcollection(pacienteId: string, name: string) {
  while (true) {
    const snap = await getDocs(query(collection(db, `pacientes/${pacienteId}/${name}`), limit(50)));
    if (snap.empty) return;
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    if (snap.size < 50) return;
  }
}

async function deleteStorageFolder(tenantId: string, pacienteId: string) {
  try {
    const folderRef = ref(storage, `pacientes/${tenantId}/${pacienteId}`);
    const res = await listAll(folderRef);
    await Promise.all(res.items.map((item) => deleteObject(item).catch(() => undefined)));
  } catch (err) {
    console.error('storage cleanup', err);
  }
}

export async function cascadeDeletePatient(tenantId: string, pacienteId: string): Promise<void> {
  await Promise.all(SUBCOLLECTIONS.map((c) => deleteSubcollection(pacienteId, c)));
  await deleteStorageFolder(tenantId, pacienteId);
  await deleteDoc(doc(db, 'pacientes', pacienteId));
}
