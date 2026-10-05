import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MemberList = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchName, setSearchName] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const size = 10;
    const { user, logout } = useContext(AuthContext);

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
        fetchMembers(searchName, page);
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchMembers(searchName, 0);
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
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                        {searchName && (
                            <button type="button" className="clear-icon-btn" onClick={() => { setSearchName(''); setPage(0); fetchMembers('', 0); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                    <button type="submit" className="btn-secondary">검색</button>
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
                                <th>ID</th>
                                <th>이름</th>
                                <th>주소</th>
                                <th>생년월일</th>
                                <th>전화번호</th>
                                <th>권한</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">회원이 없습니다.</td>
                                </tr>
                            ) : (
                                members.map(member => (
                                    <tr key={member.id}>
                                        <td>{member.id}</td>
                                        <td>{member.name}</td>
                                        <td>{member.address}</td>
                                        <td>{member.birthDate}</td>
                                        <td>{member.phone}</td>
                                        <td>{member.role}</td>
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
        </div>
    );
};

export default MemberList;
