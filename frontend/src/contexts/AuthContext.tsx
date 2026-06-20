import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string; // auto-generated from name, used internally
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    || 'user';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('endroll_mock_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('endroll_mock_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const derivedName = email.split('@')[0];
    const mockUser: User = {
      id: 'mock-uuid-1234',
      email,
      name: derivedName,
      username: generateUsername(derivedName),
      avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`,
    };
    setUser(mockUser);
    localStorage.setItem('endroll_mock_user', JSON.stringify(mockUser));
  };

  const register = async (email: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser: User = {
      id: 'mock-uuid-5678',
      email,
      name,
      username: generateUsername(name),
      avatar_url: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`,
    };
    setUser(mockUser);
    localStorage.setItem('endroll_mock_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('endroll_mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
