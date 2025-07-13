import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-4 text-primary-700 dark:text-white">Welcome, Admin!</h1>
    <p className="mb-8 text-gray-700 dark:text-gray-200">
      This is your admin dashboard. Here you can manage users, moderate content, and configure site settings.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* User Management */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-300">User Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">View, promote, or deactivate users.</p>
        <Link
          to="/admin/manage-users"
          className="inline-block px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Manage Users
        </Link>
      </div>
      {/* Content Moderation */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2 text-green-700 dark:text-green-300">Content Moderation</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Approve, edit, or delete blogs and sermons.</p>
        <Link
          to="/admin/manage-content"
          className="inline-block px-4 py-2 rounded bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          Moderate Content
        </Link>
      </div>
      
      {/* Analytics Dashboard */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">Analytics Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Track user engagement, content performance, and site activity.</p>
        <Link
          to="/admin/analytics"
          className="inline-block px-4 py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
        >
          View Analytics
        </Link>
      </div>
    </div>
    <div className="mt-12 text-center text-gray-400 text-sm">More admin features coming soon...</div>
  </div>
);

export default AdminDashboard;
