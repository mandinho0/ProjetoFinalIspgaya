import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, getAuth, UserMetadata, UserInfo, IdTokenResult } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

interface ExtendedUser extends User {
  enterpriseId: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: UserMetadata;
  providerData: UserInfo[];
  refreshToken: string;
  tenantId: string | null;
  delete: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  getIdTokenResult: (forceRefresh?: boolean) => Promise<IdTokenResult>;
  reload: () => Promise<void>;
  toJSON: () => object;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
  uid: string;
}

interface AuthContextProps {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser | null) => void;
  loading: boolean;
  signOut: () => void;
  updateUser: (user: ExtendedUser) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  loading: true,
  signOut: () => {},
  updateUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(FIREBASE_DB, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const extendedUser: ExtendedUser = {
              ...firebaseUser, ...userData, emailVerified: firebaseUser.emailVerified, isAnonymous: firebaseUser.isAnonymous, metadata: firebaseUser.metadata, providerData: firebaseUser.providerData, refreshToken: firebaseUser.refreshToken, tenantId: firebaseUser.tenantId, delete: firebaseUser.delete, getIdToken: firebaseUser.getIdToken, getIdTokenResult: firebaseUser.getIdTokenResult, reload: firebaseUser.reload, toJSON: firebaseUser.toJSON, displayName: firebaseUser.displayName, email: firebaseUser.email, phoneNumber: firebaseUser.phoneNumber, photoURL: firebaseUser.photoURL, providerId: firebaseUser.providerId, uid: firebaseUser.uid,
              enterpriseId: ''
            };
            setUser(extendedUser);
          } else {
            const extendedUser: ExtendedUser = {
              ...firebaseUser, emailVerified: firebaseUser.emailVerified, isAnonymous: firebaseUser.isAnonymous, metadata: firebaseUser.metadata, providerData: firebaseUser.providerData, refreshToken: firebaseUser.refreshToken, tenantId: firebaseUser.tenantId, delete: firebaseUser.delete, getIdToken: firebaseUser.getIdToken, getIdTokenResult: firebaseUser.getIdTokenResult, reload: firebaseUser.reload, toJSON: firebaseUser.toJSON, displayName: firebaseUser.displayName, email: firebaseUser.email, phoneNumber: firebaseUser.phoneNumber, photoURL: firebaseUser.photoURL, providerId: firebaseUser.providerId, uid: firebaseUser.uid,
              enterpriseId: ''
            };
            setUser(extendedUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const navigation = useNavigation();
  const signOut = () => {
    firebaseSignOut(FIREBASE_AUTH)
      .then(() => {
        setUser(null);
        navigation.navigate('Login' as never);
      })
      .catch((error) => console.error(error));
  };

  const updateUser = async (updatedUser: ExtendedUser) => {
    if (!updatedUser.uid) return;

    try {
      const userDocRef = doc(FIREBASE_DB, 'users', updatedUser.uid);
      await updateDoc(userDocRef, {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      });

      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
