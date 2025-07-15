import React, { useEffect, useState, useRef } from 'react';
import { endpoints } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import { Download, Trash2, FilePlus, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const ExportContent = () => {
  const [options, setOptions] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [format, setFormat] = useState('json');
  const [filters, setFilters] = useState({ dateRange: 'all', status: 'all' });
  const [includeMedia, setIncludeMedia] = useState(false);
  const [compress, setCompress] = useState(true);
  const [customFileName, setCustomFileName] = useState('');
  const [exportJob, setExportJob] = useState(null);
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pollRef = useRef(null);

  // Fetch export options and history
  useEffect(() => {
    setLoading(true);
    Promise.all([
      endpoints.adminExport.getOptions(),
      endpoints.adminExport.getHistory()
    ])
      .then(([optRes, histRes]) => {
        setOptions(optRes.data.data);
        setHistory(histRes.data.data.exports);
      })
      .catch((err) => setError(err.message || 'Failed to load export options'))
      .finally(() => setLoading(false));
  }, []);

  // Poll export job status
  useEffect(() => {
    if (!exportJob || !exportJob.jobId) return;
    pollRef.current = setInterval(() => {
      endpoints.adminExport.getStatus(exportJob.jobId)
        .then((res) => {
          setProgress(res.data.data);
          if (res.data.data.status === 'completed' || res.data.data.status === 'failed') {
            clearInterval(pollRef.current);
            // Refresh history
            endpoints.adminExport.getHistory().then((histRes) => setHistory(histRes.data.data.exports));
          }
        })
        .catch(() => clearInterval(pollRef.current));
    }, 2000);
    return () => clearInterval(pollRef.current);
  }, [exportJob]);

  const handleTypeChange = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleExport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProgress(null);
    setLoading(true);
    try {
      const res = await endpoints.adminExport.create({
        contentTypes: selectedTypes,
        format,
        filters,
        includeMedia,
        compress,
        customFileName: customFileName.trim() || undefined
      });
      setExportJob(res.data.data);
      setSuccess('Export started. Progress will update below.');
    } catch (err) {
      setError(err.message || 'Failed to start export');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (jobId, fileName) => {
    setError('');
    setSuccess('');
    try {
      const res = await endpoints.adminExport.download(jobId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSuccess('Download started.');
    } catch (err) {
      setError('Failed to download export.');
    }
  };

  const handleDelete = async (jobId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await endpoints.adminExport.delete(jobId);
      setHistory((prev) => prev.filter((j) => j.id !== jobId));
      setSuccess('Export deleted.');
    } catch (err) {
      setError('Failed to delete export.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !options) return <LoadingSpinner label="Loading export options..." />;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Content Export & Backup</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-300">Export your church data for backup, migration, or analysis. Select content types, format, and filters. Exports are processed in the background and available for download below.</p>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">{success}</div>}
      <form onSubmit={handleExport} className="bg-white dark:bg-gray-900 rounded shadow p-6 mb-8">
        <div className="mb-4">
          <label className="block font-semibold mb-2">Content Types</label>
          <div className="flex flex-wrap gap-3">
            {options?.contentTypes.map((type) => (
              <label key={type.id} className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer ${selectedTypes.includes(type.id) ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-500' : 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-700'}`}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => handleTypeChange(type.id)}
                  className="accent-blue-600"
                />
                <span className="font-medium">{type.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Format</label>
          <div className="flex gap-4">
            {options?.formats.map((fmt) => (
              <label key={fmt.id} className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer ${format === fmt.id ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-500' : 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-700'}`}>
                <input
                  type="radio"
                  name="format"
                  value={fmt.id}
                  checked={format === fmt.id}
                  onChange={() => setFormat(fmt.id)}
                  className="accent-blue-600"
                />
                <span className="font-medium">{fmt.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 flex gap-4">
          <div>
            <label className="block font-semibold mb-2">Date Range</label>
            <select
              className="rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
              value={filters.dateRange}
              onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}
            >
              {options?.filters.dateRanges.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Status</label>
            <select
              className="rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              {options?.filters.statuses.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 flex gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeMedia} onChange={e => setIncludeMedia(e.target.checked)} className="accent-blue-600" />
            Include Media Files
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={compress} onChange={e => setCompress(e.target.checked)} className="accent-blue-600" />
            Compress as ZIP
          </label>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Custom File Name (optional)</label>
          <input
            type="text"
            className="rounded border px-3 py-2 w-full dark:bg-gray-800 dark:border-gray-700"
            value={customFileName}
            onChange={e => setCustomFileName(e.target.value)}
            placeholder="haven_word_church_export_YYYY-MM-DD"
          />
        </div>
        <Button type="submit" className="mt-2" disabled={loading || selectedTypes.length === 0}>
          <FilePlus className="inline w-5 h-5 mr-2" /> Start Export
        </Button>
      </form>

      {/* Export Progress */}
      {progress && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-800 rounded shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            {progress.status === 'completed' ? <CheckCircle className="text-green-500" /> : progress.status === 'failed' ? <XCircle className="text-red-500" /> : <RefreshCw className="animate-spin text-blue-500" />}
            <span className="font-semibold">Export Status:</span>
            <span className="capitalize">{progress.status}</span>
            {progress.status === 'completed' && progress.downloadUrl && (
              <Button size="sm" onClick={() => handleDownload(exportJob.jobId, progress.fileName || 'export.zip')} className="ml-4"><Download className="inline w-4 h-4 mr-1" /> Download</Button>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-3 mb-2">
            <div
              className={`h-3 rounded ${progress.status === 'completed' ? 'bg-green-500' : progress.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${progress.progress || 0}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{progress.processedItems} of {progress.totalItems} items processed.</div>
          {progress.status === 'failed' && <div className="text-red-600 mt-2">{progress.error}</div>}
        </div>
      )}

      {/* Export History */}
      <div className="bg-white dark:bg-gray-900 rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Export History</h2>
          <Button size="sm" onClick={async () => {
            setLoading(true);
            const histRes = await endpoints.adminExport.getHistory();
            setHistory(histRes.data.data.exports);
            setLoading(false);
          }}><RefreshCw className="inline w-4 h-4 mr-1" /> Refresh</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-3 py-2 text-left">File</th>
                <th className="px-3 py-2 text-left">Types</th>
                <th className="px-3 py-2 text-left">Format</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr><td colSpan={6} className="text-center py-4 text-gray-500">No exports yet.</td></tr>
              )}
              {history.map((job) => (
                <tr key={job.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-3 py-2 font-mono">{job.fileName || job.id}</td>
                  <td className="px-3 py-2">{job.contentTypes?.join(', ')}</td>
                  <td className="px-3 py-2 uppercase">{job.format}</td>
                  <td className="px-3 py-2 capitalize">{job.status}</td>
                  <td className="px-3 py-2">{new Date(job.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 flex gap-2">
                    {job.status === 'completed' && (
                      <Button size="sm" onClick={() => handleDownload(job.id, job.fileName || 'export.zip')}><Download className="inline w-4 h-4 mr-1" /> Download</Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(job.id)}><Trash2 className="inline w-4 h-4 mr-1" /> Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportContent; 