
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
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Making request to /api/admin/users');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Unknown error' };
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        if (response.status === 401) {
          throw new Error('Authentication failed. Please sign in again.');
        }
        
        throw new Error(errorData.error || `Failed to fetch users (${response.status})`);
      }

      const data = await response.json();
      console.log('Received users data:', data);
      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is admin
  if (user?.email !== 'admin@demo.com') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Access Denied</h2>
            <p className="text-neutral-600">You don't have permission to access the admin panel.</p>
          </div>
        </Card>
      </div>
    );
  }

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

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Environment:</span>
                  <span className="text-neutral-900 font-medium">Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Database:</span>
                  <span className="text-neutral-900 font-medium">PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Auth System:</span>
                  <span className="text-neutral-900 font-medium">JWT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Payments:</span>
                  <span className="text-neutral-900 font-medium">Stripe</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button onClick={fetchUsers} className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Refresh User Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  View System Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Settings
                </Button>
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
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
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
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.email === 'admin@demo.com' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.email === 'admin@demo.com' ? 'Admin' : 'Active'}
                          </span>
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
