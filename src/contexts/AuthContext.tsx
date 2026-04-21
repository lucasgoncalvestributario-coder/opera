import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserSettings, Sale, DEFAULT_SETTINGS } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  settings: UserSettings;
  sales: Sale[];
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    // Fallback security: ensure loading doesn't hang forever
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      clearTimeout(timeout);
      try {
        setUser(u);
        if (u) {
          // Listen to settings
          const settingsRef = doc(db, 'users', u.uid);
          const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
            if (docSnap.exists()) {
              setSettings(docSnap.data() as UserSettings);
            } else {
              setDoc(settingsRef, {
                 ...DEFAULT_SETTINGS,
                 name: u.displayName || u.email?.split('@')[0] || 'Novo Usuário',
                 photoURL: u.photoURL || DEFAULT_SETTINGS.photoURL,
                 userId: u.uid 
              }, { merge: true });
            }
          }, (err) => {
            console.error("Settings error:", err);
          });

          // Listen to sales
          const salesRef = collection(db, 'users', u.uid, 'sales');
          const q = query(salesRef, orderBy('createdAt', 'desc'));
          const unsubSales = onSnapshot(q, (querySnapshot) => {
            const salesData: Sale[] = [];
            querySnapshot.forEach((doc) => {
              salesData.push({ id: doc.id, ...doc.data() } as Sale);
            });
            setSales(salesData);
          }, (err) => {
            console.error("Sales error:", err);
          });

          // Store unsubscribers for cleanup if needed, but useEffect handles it via auth state
        } else {
          setSettings(DEFAULT_SETTINGS);
          setSales([]);
        }
      } catch (error) {
        console.error("Auth change error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const settingsRef = doc(db, 'users', user.uid);
    await setDoc(settingsRef, newSettings, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, loading, settings, sales, signIn, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
