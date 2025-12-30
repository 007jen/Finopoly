import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '@clerk/clerk-react';

/**
 * Interface matching the backend response
 */
export interface AdminUser {
    id: string;
    name: string | null;
    email: string;
    role: 'STUDENT' | 'ADMIN';
    status: 'ACTIVE' | 'SUSPENDED';
    xp: number;
    progress: {
        audit: number;
        tax: number;
        law: number;
    };
    lastActive: string | null;
}

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalStudents: number;
    totalAdmins: number;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const useAdminUsers = () => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Dashboard Statistics
    const fetchStats = useCallback(async () => {
        try {
            const token = await getToken();
            const data = await api.get<DashboardStats>('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(data);
        } catch (err: any) {
            console.error("Failed to fetch admin stats:", err);
        }
    }, [getToken]);

    // Fetch User List (with search, filter, pagination)
    const fetchUsers = useCallback(async (params: { search?: string, role?: string, status?: string, page?: number, limit?: number } = {}) => {
        setLoading(true);
        try {
            const token = await getToken();
            const query = new URLSearchParams(params as any).toString();
            const data = await api.get<{ users: AdminUser[], pagination: PaginationInfo }>(`/api/admin/users?${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(data.users);
            setPagination(data.pagination);
            setError(null);
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    /**
     * Toggles a user's status between ACTIVE and SUSPENDED.
     * Implements Optimistic UI update for immediate feedback.
     */
    const banUser = async (id: string) => {
        const userToToggle = users.find(u => u.id === id);
        if (!userToToggle) return;

        // 1. Optimistic Update
        const originalUsers = [...users];
        const newStatus = userToToggle.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

        setUsers(prev => prev.map(user =>
            user.id === id ? { ...user, status: newStatus } : user
        ));

        try {
            // 2. Network Request
            const token = await getToken();
            await api.patch(`/api/admin/users/${id}/toggle-status`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 3. Refresh stats to keep counts accurate
            fetchStats();
        } catch (err: any) {
            // 4. Revert on failure
            setUsers(originalUsers);
            console.error("Failed to toggle status:", err);
            alert("Error: Could not update user status. Please try again.");
        }
    };

    // Initial Load
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchStats();
            fetchUsers();
        }
    }, [isLoaded, isSignedIn, fetchStats, fetchUsers]);

    return {
        users,
        stats,
        pagination,
        loading,
        error,
        fetchUsers,
        fetchStats,
        banUser
    };
};
