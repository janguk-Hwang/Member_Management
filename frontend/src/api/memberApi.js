const API_BASE_URL = 'http://localhost:8080/api/members';

export const memberApi = {
    getAllMembers: async () => {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch members');
        return response.json();
    },

    getMemberById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch member');
        return response.json();
    },

    createMember: async (memberData) => {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData),
        });
        if (!response.ok) throw new Error('Failed to create member');
        return response.json();
    },

    updateMember: async (id, memberData) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData),
        });
        if (!response.ok) throw new Error('Failed to update member');
        return response.json();
    },

    deleteMember: async (id) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete member');
    }
};
