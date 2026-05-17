import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  name?: string;
  crm?: string;
  specialty?: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicAddress?: string;
  clinicCpfCnpj?: string;
  logoUrl?: string;
  primaryColor?: string;
  role?: string; /* 'admin' | 'staff' */
  tenantId?: string;
  onboardingComplete?: boolean;
  plan?: 'basico' | 'profissional' | 'vitalicio';
  subscriptionStatus?: 'free' | 'pending' | 'active' | 'authorized' | 'paused' | 'cancelled' | 'failed';
  calendarios?: string[]; // ex: ['Consultório', 'Telemedicina', 'Plantão']
}

export const DEFAULT_CALENDARIOS = ['Consultório', 'Telemedicina', 'Plantão'];

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  tenantId: string | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, userProfile: null, tenantId: null, loading: true, refreshProfile: async () => {} });

export const useAuth = () => useContext(AuthContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // Backfill: ensure plan/status set for legacy accounts already in production
        if (!data.plan || !data.subscriptionStatus) {
          await setDoc(docRef, { plan: data.plan || 'basico', subscriptionStatus: data.subscriptionStatus || 'free' }, { merge: true });
          data.plan = data.plan || 'basico';
          data.subscriptionStatus = data.subscriptionStatus || 'free';
        }
        setUserProfile(data);
      } else {
        setUserProfile(null);
      }
      await ensureFreeSubscriptionDoc(uid);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const ensureFreeSubscriptionDoc = async (uid: string) => {
    try {
      const subRef = doc(db, 'subscriptions', uid);
      const snap = await getDoc(subRef);
      if (!snap.exists()) {
        await setDoc(subRef, {
          userId: uid,
          plan: 'basico',
          status: 'free',
          amount: 0,
          currency: 'BRL',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      // Non-fatal: rules may reject if status already non-free; that's fine.
      console.warn('[subscriptions] ensure free failed:', (err as Error).message);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const tenantId = userProfile?.tenantId || user?.uid || null;

  return (
    <AuthContext.Provider value={{ user, userProfile, tenantId, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
