import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, SUPER_ADMIN_EMAIL } from '@/services/firebase';
import { UserProfile } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to fetch or create user document in Firestore
  const syncUserProfile = async (user: FirebaseUser) => {
    try {
      const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        if (isSuperAdmin && data.role !== 'admin') {
          await setDoc(userRef, { role: 'admin' }, { merge: true });
          data.role = 'admin';
        }
        setUserProfile(data);
        setIsAdmin(data.role === 'admin' || isSuperAdmin);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'Customer',
          photoURL: user.photoURL || undefined,
          role: isSuperAdmin ? 'admin' : 'customer',
          phone: user.phoneNumber || undefined,
          addresses: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        setIsAdmin(isSuperAdmin);
      }
    } catch (err) {
      console.warn('Firestore offline or fallback active:', err);
      const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
      setIsAdmin(isSuperAdmin);
      setUserProfile({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        role: isSuperAdmin ? 'admin' : 'customer',
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(result.user);
      toast.success(`Welcome back, ${result.user.displayName || 'User'}!`);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  // Email & Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(result.user);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Email Login Error:', error);
      toast.error(error.message || 'Invalid email or password');
      throw error;
    }
  };

  // Email & Password Registration
  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
      }
      await syncUserProfile(result.user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Registration Error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('gen_touch_admin_override');
      setUserProfile(null);
      setIsAdmin(false);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};