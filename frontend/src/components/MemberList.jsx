import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DaumPostcode from 'react-daum-postcode';

const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const size = 10;
    const { user, logout } = useContext(AuthContext);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ id: null, name: '', address: '', birthDate: '', phone: '' });
    const [saving, setSaving] = useState(false);
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
    const [mouseDownOnOverlay, setMouseDownOnOverlay] = useState(false);

    const fetchMembers = async (nameQuery = '', pageNum = 0) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (nameQuery) queryParams.append('name', nameQuery);
            queryParams.append('page', pageNum);
            queryParams.append('size', size);
            
            const response = await axios.get(`/api/members?${queryParams.toString()}`);
            
            if (response.data && response.data.content) {
                setMembers(response.data.content);
                setTotalPages(response.data.totalPages);
            } else {
                setMembers(response.data);
                setTotalPages(1);
            }
            setError(null);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                alert('세션이 만료되었거나 다른 기기에서 로그인되었습니다. 다시 로그인해주세요.');
                logout();
            } else {
                setError('회원 목록을 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMembers(searchName, page);
        }, 300); // 0.3초 대기 후 검색 (타이핑 중 API 과도 호출 방지)
        
        return () => clearTimeout(delayDebounceFn);
    }, [searchName, page]);

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const handleEditClick = (member) => {
        setEditForm({ 
            id: member.id,
            name: member.name || '',
            address: member.address || '', 
            birthDate: member.birthDate || '',
            phone: member.phone || '' 
        });
        setIsPostcodeOpen(false);
        setIsEditModalOpen(true);
    };

    const handleCompletePostcode = (data) => {
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

        setEditForm({...editForm, address: fullAddress});
        setIsPostcodeOpen(false);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();

        if (!editForm.address || !editForm.address.trim()) {
            alert('주소를 입력해주세요.');
            return;
        }

        if (!editForm.phone || !editForm.phone.trim()) {
            alert('전화번호를 입력해주세요.');
            return;
        }

        if (!/^010[0-9]{8}$/.test(editForm.phone)) {
            alert('올바른 휴대폰 번호 형식을 입력해주세요. (예: 01012345678)');
            return;
        }

        setSaving(true);
        try {
            await axios.put(`/api/members/${editForm.id}`, editForm);
            setIsEditModalOpen(false);
            fetchMembers(searchName, page);
            alert('정보가 성공적으로 수정되었습니다.');
        } catch (err) {
            alert('정보 수정에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="member-list-container">
            <div className="header-actions">
                <h2>{user.role === 'ADMIN' ? '전체 회원 목록' : '내 프로필'}</h2>
            </div>
            
            {user.role === 'ADMIN' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <input 
                            type="text" 
                            placeholder="이름으로 검색..." 
                            value={searchName}
                            onChange={(e) => {
                                setSearchName(e.target.value);
                                setPage(0);
                            }}
                        />
                        {searchName && (
                            <button type="button" className="clear-icon-btn" onClick={() => { setSearchName(''); setPage(0); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                </form>
            )}

            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading">불러오는 중...</div>
            ) : (
                <div className="table-responsive">
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th style={{ whiteSpace: 'nowrap' }}>이름</th>
                                <th>주소</th>
                                <th style={{ whiteSpace: 'nowrap' }}>생년월일</th>
                                <th style={{ whiteSpace: 'nowrap' }}>전화번호</th>
                                {user.role === 'ADMIN' && <th style={{ whiteSpace: 'nowrap' }}>권한</th>}
                                <th style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={user.role === 'ADMIN' ? "6" : "5"} className="empty-state">회원이 없습니다.</td>
                                </tr>
                            ) : (
                                members.map(member => (
                                    <tr key={member.id}>
                                        <td style={{ whiteSpace: 'nowrap' }}>{member.name}</td>
                                        <td style={{ minWidth: '250px' }}>{member.address}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{member.birthDate}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{member.phone}</td>
                                        {user.role === 'ADMIN' && <td style={{ whiteSpace: 'nowrap' }}>{member.role}</td>}
                                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                            {(user.role === 'ADMIN' || member.name === user.name) && (
                                                <button className="btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}} onClick={() => handleEditClick(member)}>수정</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setPage(p => Math.max(0, p - 1))} 
                                disabled={page === 0}
                                className="btn-secondary"
                            >
                                이전
                            </button>
                            <span className="page-info">{page + 1} / {totalPages}</span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                                disabled={page === totalPages - 1}
                                className="btn-secondary"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div 
                    className="modal-overlay" 
                    onMouseDown={(e) => {
                        if (e.target.classList.contains('modal-overlay')) {
                            setMouseDownOnOverlay(true);
                        } else {
                            setMouseDownOnOverlay(false);
                        }
                    }}
                    onMouseUp={(e) => {
                        if (e.target.classList.contains('modal-overlay') && mouseDownOnOverlay) {
                            setIsEditModalOpen(false);
                        }
                        setMouseDownOnOverlay(false);
                    }}
                >
                    <div className="modal-content glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>{editForm.name === user.name ? '내 프로필 수정' : '프로필 수정'}</h3>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}>&times;</button>
                        </div>
                        <form onSubmit={handleEditSave}>
                            <div className="form-group">
                                <label>이름</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    disabled
                                    style={{ fontSize: '1.05rem', padding: '0.8rem', backgroundColor: '#f1f5f9', color: '#64748b' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label>생년월일</label>
                                <input 
                                    type={user.role === 'ADMIN' ? "date" : "text"} 
                                    value={editForm.birthDate} 
                                    onChange={e => setEditForm({...editForm, birthDate: e.target.value})} 
                                    disabled={user.role !== 'ADMIN'}
                                    style={{ fontSize: '1.05rem', padding: '0.8rem', backgroundColor: user.role !== 'ADMIN' ? '#f1f5f9' : 'white', color: user.role !== 'ADMIN' ? '#64748b' : 'var(--dark)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label>주소</label>
                                <div className="address-input-group">
                                    <input 
                                        type="text" 
                                        value={editForm.address} 
                                        readOnly 
                                        placeholder="검색 버튼을 눌러 주소를 찾으세요" 
                                        required 
                                        style={{ fontSize: '1.05rem', padding: '0.8rem' }}
                                    />
                                    <button type="button" onClick={() => setIsPostcodeOpen(!isPostcodeOpen)} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                                        주소 검색
                                    </button>
                                </div>
                                {isPostcodeOpen && (
                                    <div className="postcode-container">
                                        <DaumPostcode onComplete={handleCompletePostcode} />
                                    </div>
                                )}
                            </div>
                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label>전화번호</label>
                                <input 
                                    type="text" 
                                    value={editForm.phone} 
                                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                                    required
                                    style={{ fontSize: '1.05rem', padding: '0.8rem' }}
                                />
                            </div>
                            <div className="modal-actions" style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, whiteSpace: 'nowrap' }}>취소</button>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 2, whiteSpace: 'nowrap', width: 'auto' }}>{saving ? '저장 중...' : '저장 완료'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberList;
