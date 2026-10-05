import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        // 서버에 로그아웃 요청을 보내지만 완료를 기다리지 않고 즉시 로컬 상태를 지움
        axios.post('/api/auth/logout').catch(error => console.error('Logout API failed:', error));
        
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('role');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    const login = (userData) => {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('name', userData.name);
        localStorage.setItem('role', userData.role);
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const name = localStorage.getItem('name');
        const role = localStorage.getItem('role');
        
        if (token && name && role) {
            setUser({ name, role, token });
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);

        // Axios 응답 인터셉터 설정 (401 에러 발생 시 자동 로그아웃)
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // 로그인/로그아웃 요청 중 발생한 에러는 인터셉터에서 처리하지 않고 넘김
                const isAuthRequest = error.config && error.config.url && (error.config.url.includes('/api/auth/login') || error.config.url.includes('/api/auth/logout'));
                
                // 이미 로그아웃 처리되어 토큰이 없는 상태에서 날아온 지연된 응답의 401 에러라면 무시
                const hasToken = !!localStorage.getItem('token');

                if (!isAuthRequest && hasToken && error.response && (error.response.status === 401 || error.response.status === 403)) {
                    logout();
                    alert("세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.");
                    window.location.href = '/login'; 
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
