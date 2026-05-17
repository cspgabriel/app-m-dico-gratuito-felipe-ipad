import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }
  } catch (err) {
    console.warn('[firebase-admin] init failed:', (err as Error).message);
  }
}

export const firestore = admin.apps.length
  ? (firebaseConfig.firestoreDatabaseId
      ? getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId)
      : getFirestore(admin.app()))
  : null;

export { admin };
