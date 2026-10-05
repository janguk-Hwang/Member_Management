import React, { useState } from 'react';
import { memberApi } from '../api/memberApi';

const MemberForm = ({ member, onClose }) => {
    const isEditMode = !!member;
    const [formData, setFormData] = useState({
        name: member?.name || '',
        email: member?.email || '',
        phone: member?.phone || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isEditMode) {
                await memberApi.updateMember(member.id, formData);
            } else {
                await memberApi.createMember(formData);
            }
            onClose(true); // Close and refresh list
        } catch (err) {
            setError(err.message || 'An error occurred while saving the member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="member-form-container glass-panel">
            <div className="form-header">
                <h2>{isEditMode ? 'Edit Member' : 'Add New Member'}</h2>
                <button className="btn-close" onClick={() => onClose(false)}>&times;</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="member-form">
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. John Doe"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="e.g. john@example.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 123-456-7890"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => onClose(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : (isEditMode ? 'Update Member' : 'Save Member')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MemberForm;
