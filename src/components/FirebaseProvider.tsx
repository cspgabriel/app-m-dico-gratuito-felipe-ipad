import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  name?: string;
  crm?: string;
  clinicName?: string;
  logoUrl?: string;
  role?: string; /* 'admin' | 'staff' */
  tenantId?: string; 
  onboardingComplete?: boolean;
  plan?: 'basico' | 'profissional' | 'multi';
}

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
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
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
