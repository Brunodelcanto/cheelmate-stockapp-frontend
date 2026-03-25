import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types/index';
import api from '../api/axiosConfig';

interface AuthContextType {
    user: User | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) return null;

        try {
            return JSON.parse(savedUser);
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            return null;
        }
    });

    const [loading] = useState(false);

    const login = (userData: User, token: string) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post(`/users/logout`, {});
        } catch (error) {
            console.error("Error al cerrar sesión en el servidor", error);
        } finally {
            localStorage.clear();
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};


