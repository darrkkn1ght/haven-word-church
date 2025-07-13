import React, { useEffect, useState } from 'react';
import axios from 'axios';

const getRoleAction = (user, currentUser) => {
  if (user.role === 'admin') return 'Demote to Member';
  if (user.role === 'member') return 'Promote to Pastor';
  if (user.role === 'pastor') return 'Promote to Admin';
  return '';
};

const getNextRole = (user) => {
  if (user.role === 'admin') return 'member';
  if (user.role === 'member') return 'pastor';
  if (user.role === 'pastor') return 'admin';
  return user.role;
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        // Get current user from token (assumes JWT payload has id)
        const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
        setCurrentUser(payload);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const nextRole = getNextRole(user);
      const res = await axios.patch(`/api/users/${user._id}/role`, { role: nextRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusChange = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`/api/users/${user._id}/status`, { active: !user.active }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6 text-primary-700 dark:text-white">User Management</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading users...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-900 rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                  <td className="px-4 py-2">
                    {user.active ? (
                      <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Active</span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-700 text-xs">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'} ${currentUser && currentUser.id === user._id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'}`}
                      disabled={currentUser && currentUser.id === user._id}
                      onClick={() => handleRoleChange(user)}
                    >
                      {getRoleAction(user, currentUser)}
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold ${user.active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} ${currentUser && currentUser.id === user._id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-200 hover:bg-green-200'}`}
                      disabled={currentUser && currentUser.id === user._id}
                      onClick={() => handleStatusChange(user)}
                    >
                      {user.active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
