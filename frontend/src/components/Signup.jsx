import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';

const Signup = () => {
    const currentYear = new Date().getFullYear();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [address, setAddress] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('USER');
    
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const [isNameChecked, setIsNameChecked] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNameChange = (e) => {
        setName(e.target.value);
        setIsNameChecked(false);
    };

    const handleCheckName = async () => {
        if (!name.trim()) {
            alert('아이디를 입력해주세요.');
            return;
        }
        try {
            const response = await axios.get(`/api/auth/check-name?name=${name}`);
            if (response.data) {
                alert('사용 가능한 아이디입니다.');
                setIsNameChecked(true);
            } else {
                alert('이미 사용 중인 아이디입니다.');
                setIsNameChecked(false);
            }
        } catch (err) {
            alert('중복 확인 중 오류가 발생했습니다.');
        }
    };

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setAddress(fullAddress);
        setIsPostcodeOpen(false);
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim() || !password || !passwordRepeat || !address || !birthYear || !birthMonth || !birthDay || !phone.trim()) {
            alert('모든 입력란을 빠짐없이 채워주세요.');
            return;
        }

        if (!isNameChecked) {
            alert('아이디 중복 확인을 해주세요.');
            return;
        }

        if (!/^010[0-9]{8}$/.test(phone)) {
            alert('올바른 휴대폰 번호 형식을 입력해주세요. (예: 01012345678)');
            return;
        }

        if (password.length < 8 || password.length > 15) {
            setError('비밀번호는 8자 이상 15자 이하로 입력해주세요.');
            return;
        }

        if (password !== passwordRepeat) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const formattedDate = `${birthYear}-${birthMonth}-${birthDay}`;
            await axios.post('/api/auth/signup', {
                name,
                password,
                address,
                birthDate: formattedDate,
                phone,
                role
            });
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || '회원가입에 실패했습니다.');
        }
    };

    return (
        <div className="form-container">
            <h2>회원가입</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="glass-panel form-panel signup-form">
                <div className="form-group">
                    <label>이름 (아이디)</label>
                    <div className="address-input-group">
                        <input 
                            type="text" 
                            value={name} 
                            onChange={handleNameChange} 
                            maxLength={20}
                            required 
                        />
                        <button type="button" onClick={handleCheckName} className="btn-secondary">
                            중복 확인
                        </button>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>비밀번호 (8~15자)</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className={password.length > 0 ? (password.length >= 8 && password.length <= 15 ? 'input-valid' : 'input-invalid') : ''}
                        maxLength={15}
                        required 
                    />
                    {password.length > 0 && (password.length < 8 || password.length > 15) && (
                        <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>
                            비밀번호는 8자 이상 15자 이하로 입력해주세요.
                        </small>
                    )}
                </div>

                <div className="form-group">
                    <label>비밀번호 확인</label>
                    <input 
                        type="password" 
                        value={passwordRepeat} 
                        onChange={(e) => setPasswordRepeat(e.target.value)} 
                        className={passwordRepeat.length > 0 ? (password === passwordRepeat && password.length >= 8 && password.length <= 15 ? 'input-valid' : 'input-invalid') : ''}
                        maxLength={15}
                        required 
                    />
                    {passwordRepeat.length > 0 && password !== passwordRepeat && (
                        <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>
                            비밀번호가 일치하지 않습니다.
                        </small>
                    )}
                </div>

                <div className="form-group">
                    <label>생년월일</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} required>
                            <option value="">년도</option>
                            {Array.from({ length: 100 }, (_, i) => currentYear - i).map(year => (
                                <option key={year} value={year}>{year}년</option>
                            ))}
                        </select>
                        <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} required>
                            <option value="">월</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={String(month).padStart(2, '0')}>{month}월</option>
                            ))}
                        </select>
                        <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} required>
                            <option value="">일</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <option key={day} value={String(day).padStart(2, '0')}>{day}일</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>주소</label>
                    <div className="address-input-group">
                        <input 
                            type="text" 
                            value={address} 
                            readOnly 
                            placeholder="검색 버튼을 눌러 주소를 찾으세요" 
                            required 
                        />
                        <button type="button" onClick={() => setIsPostcodeOpen(!isPostcodeOpen)} className="btn-secondary">
                            주소 검색
                        </button>
                    </div>
                    {isPostcodeOpen && (
                        <div className="postcode-container">
                            <DaumPostcode onComplete={handleComplete} />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>전화번호 (- 없이 숫자만 입력)</label>
                    <input 
                        type="text" 
                        value={phone} 
                        onChange={handlePhoneChange} 
                        placeholder="예: 01012345678"
                        maxLength={20}
                        required 
                    />
                </div>

                <button type="submit" className="primary-btn">가입하기</button>
                <p className="form-footer">
                    이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;
