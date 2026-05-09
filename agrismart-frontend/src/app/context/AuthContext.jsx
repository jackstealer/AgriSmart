import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('agrismart_token');
        const storedUser = localStorage.getItem('agrismart_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);
    const login = async (email, password) => {
        try {
            const response = await authService.login({ email, password });
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('agrismart_token', token);
            localStorage.setItem('agrismart_user', JSON.stringify(user));
        }
        catch (error) {
            throw error;
        }
    };
    const register = async (data) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('role', data.role);
            if (data.profileImage) {
                formData.append('profileImage', data.profileImage);
            }
            const response = await authService.register(formData);
            const { token, user } = response.data;
            setToken(token);
            setUser(user);
            localStorage.setItem('agrismart_token', token);
            localStorage.setItem('agrismart_user', JSON.stringify(user));
        }
        catch (error) {
            throw error;
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('agrismart_token');
        localStorage.removeItem('agrismart_user');
    };
    return (<AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!user && !!token,
            login,
            register,
            logout,
            isLoading,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
