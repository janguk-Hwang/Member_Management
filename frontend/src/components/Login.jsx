import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', { name, password });
            login(response.data);
            navigate('/');
        } catch (err) {
            setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        }
    };

    return (
        <div className="form-container">
            <h2>로그인</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="glass-panel form-panel">
                <div className="form-group">
                    <label>이름 (아이디)</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>비밀번호</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="primary-btn">로그인</button>
                <p className="form-footer">
                    계정이 없으신가요? <Link to="/signup">회원가입</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
