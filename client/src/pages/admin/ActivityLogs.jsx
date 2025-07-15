import React, { useEffect, useState } from 'react';
import { endpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import { Download, Trash2, Search, RefreshCw } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await endpoints.adminActivityLogs.get({
        q,
        action,
        status,
        page,
        ...params
      });
      setLogs(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setError('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [q, action, status, page]);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await endpoints.adminActivityLogs.export({ q, action, status, format });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity_logs.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      setError('Failed to export logs');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log entry?')) return;
    setLoading(true);
    try {
      await endpoints.adminActivityLogs.delete(id);
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch {
      setError('Failed to delete log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">User Activity Logs</h1>
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          className="rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          placeholder="Search logs..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className="rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          value={action}
          onChange={e => setAction(e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="register">Register</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="export">Export</option>
          <option value="import">Import</option>
          <option value="bulk_action">Bulk Action</option>
          <option value="settings_change">Settings Change</option>
          <option value="password_change">Password Change</option>
          <option value="error">Error</option>
          <option value="other">Other</option>
        </select>
        <select
          className="rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
        </select>
        <Button onClick={() => fetchLogs()}><Search className="inline w-4 h-4 mr-1" /> Search</Button>
        <Button onClick={() => handleExport('csv')} disabled={exporting}><Download className="inline w-4 h-4 mr-1" /> Export CSV</Button>
        <Button onClick={() => handleExport('json')} disabled={exporting}><Download className="inline w-4 h-4 mr-1" /> Export JSON</Button>
        <Button onClick={() => fetchLogs()}><RefreshCw className="inline w-4 h-4 mr-1" /> Refresh</Button>
      </div>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {loading ? <LoadingSpinner label="Loading logs..." /> : (
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded shadow p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">User</th>
                <th className="px-3 py-2 text-left">Action</th>
                <th className="px-3 py-2 text-left">Target</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">IP</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={8} className="text-center py-4 text-gray-500">No logs found.</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2">{log.user ? `${log.user.name} (${log.user.email})` : 'Anonymous'}</td>
                  <td className="px-3 py-2 capitalize">{log.action}</td>
                  <td className="px-3 py-2">{log.targetType || ''} {log.targetId || ''}</td>
                  <td className={`px-3 py-2 capitalize ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{log.status}</td>
                  <td className="px-3 py-2">{log.ip}</td>
                  <td className="px-3 py-2">{log.description}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => handleDelete(log._id)}><Trash2 className="inline w-4 h-4 mr-1" /> Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <Button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
            <span>Page {page} of {totalPages}</span>
            <Button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs; 