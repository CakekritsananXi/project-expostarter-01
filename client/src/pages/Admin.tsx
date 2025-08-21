
import React, { useState, useEffect } from 'react';
import { Users, Database, Activity, Settings } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

const Admin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sage border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-sage/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-sage" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-600">Total Users</p>
                <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-600">Database</p>
                <p className="text-2xl font-bold text-neutral-900">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-600">Status</p>
                <p className="text-2xl font-bold text-neutral-900">Online</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-600">System</p>
                <p className="text-2xl font-bold text-neutral-900">Healthy</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">Users</h2>
              <Button onClick={fetchUsers} variant="outline">
                Refresh
              </Button>
            </div>

            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4 text-neutral-600">{user.id}</td>
                        <td className="py-3 px-4 text-neutral-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                        <td className="py-3 px-4 text-neutral-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
