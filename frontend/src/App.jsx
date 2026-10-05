import React, { useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MemberList from './components/MemberList';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthContext } from './context/AuthContext';
import './index.css';

function App() {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="app-container">
            <header className="app-header glass-panel">
                <div className="logo">
                    <h1>Member<span className="highlight">Flow</span></h1>
                </div>
                <div className="auth-nav">
                    {user ? (
                        <>
                            <span className="user-greeting">환영합니다, {user.name}님 ({user.role === 'ADMIN' ? '관리자' : '일반회원'})</span>
                            <button onClick={handleLogout} className="btn-secondary">로그아웃</button>
                        </>
                    ) : (
                        <p className="subtitle">회원을 관리하세요.</p>
                    )}
                </div>
            </header>

            <main className="app-main">
                <Routes>
                    <Route
                        path="/"
                        element={user ? <MemberList /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/login"
                        element={!user ? <Login /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/signup"
                        element={!user ? <Signup /> : <Navigate to="/" />}
                    />
                </Routes>
            </main>

            <footer className="app-footer">
                <p>&copy; {new Date().getFullYear()} MemberFlow. React & Spring Boot.</p>
            </footer>
        </div>
    );
}

export default App;
