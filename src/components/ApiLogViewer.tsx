/**
 * API Log Viewer Component
 * Simple component to view and download API logs, especially for debugging user creation errors
 */

import React, { useState, useEffect } from 'react';
import apiLogger from '../utils/api-logger';

interface ApiLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiLogViewer: React.FC<ApiLogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'errors' | 'user-creation' | 'auth-errors' | 'payment-errors' | 'chit-errors'>('chit-errors');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }
  }, [isOpen, filter]);

  const refreshLogs = () => {
    let filteredLogs;
    switch (filter) {
      case 'errors':
        filteredLogs = apiLogger.getErrorLogs();
        break;
      case 'user-creation':
        filteredLogs = apiLogger.getUserCreationLogs();
        break;
      case 'auth-errors':
        filteredLogs = apiLogger.getAuthenticationErrors();
        break;
      case 'payment-errors':
        filteredLogs = apiLogger.getPaymentErrors();
        break;
      case 'chit-errors':
        filteredLogs = apiLogger.getChitPaymentDetailsErrors();
        break;
      default:
        filteredLogs = apiLogger.getAllLogs();
    }
    
    setLogs(filteredLogs.reverse()); // Show newest first
    setSummary(apiLogger.getUserCreationErrorSummary());
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: number) => {
    if (status >= 500) return 'text-red-700 bg-red-100';
    if (status >= 400) return 'text-red-600 bg-red-50';
    if (status >= 300) return 'text-yellow-600 bg-yellow-50';
    if (status >= 200) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleDownload = (format: 'json' | 'csv') => {
    const filename = filter === 'user-creation' 
      ? `user-creation-logs-${new Date().toISOString().split('T')[0]}.${format}`
      : `api-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    
    apiLogger.downloadLogs(format, filename);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      apiLogger.clearLogs();
      refreshLogs();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">API Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="chit-errors">Chit Payment Errors</option>
                <option value="auth-errors">Authentication Errors</option>
                <option value="payment-errors">All Payment Errors</option>
                <option value="user-creation">User Creation Errors</option>
                <option value="errors">All Errors</option>
                <option value="all">All Logs</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={refreshLogs}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Refresh
              </button>
              <button
                onClick={() => handleDownload('json')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Download JSON
              </button>
              <button
                onClick={() => handleDownload('csv')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Download CSV
              </button>
              <button
                onClick={handleClearLogs}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Summary for User Creation Errors */}
          {filter === 'user-creation' && summary && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <h4 className="font-medium text-yellow-800 mb-2">User Creation Error Summary</h4>
              <div className="text-sm text-yellow-700">
                <p>Total Errors: {summary.totalErrors}</p>
                {Object.keys(summary.errorsByStatus).length > 0 && (
                  <p>
                    Status Codes: {Object.entries(summary.errorsByStatus)
                      .map(([status, count]) => `${status} (${count})`)
                      .join(', ')}
                  </p>
                )}
                {summary.commonErrors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Common Errors:</p>
                    <ul className="list-disc list-inside ml-2">
                      {summary.commonErrors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logs Display */}
        <div className="flex-1 overflow-auto p-4">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No logs found for the selected filter.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="border rounded-lg">
                  {/* Log Header */}
                  <div className="p-3 bg-gray-50 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-gray-600">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <span className="font-medium">
                          {log.method} {log.endpoint}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(log.responseStatus)}`}>
                          {log.responseStatus}
                        </span>
                      </div>
                    </div>
                    {log.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {log.error}
                      </div>
                    )}
                  </div>

                  {/* Log Details */}
                  <div className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Request Data */}
                      {log.requestData && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Request Data:</h5>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.requestData, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Response Data */}
                      {log.responseData && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Response Data:</h5>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.responseData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Full width sections */}
                    {log.responseStatus >= 400 && log.responseData && (
                      <div className="mt-4">
                        <h5 className="font-medium text-red-700 mb-2">Error Analysis:</h5>
                        <div className="bg-red-50 p-3 rounded">
                          {/* Parse validation errors if present */}
                          {log.responseData.detail && Array.isArray(log.responseData.detail) && (
                            <div>
                              <p className="font-medium text-red-800 mb-2">Validation Errors:</p>
                              <ul className="list-disc list-inside text-red-700 text-sm">
                                {log.responseData.detail.map((error: any, idx: number) => (
                                  <li key={idx}>
                                    <strong>{error.loc ? error.loc[error.loc.length - 1] : 'Field'}:</strong> {error.msg}
                                    {error.type && <span className="text-red-600"> (Type: {error.type})</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Show raw error if not validation error */}
                          {(!log.responseData.detail || !Array.isArray(log.responseData.detail)) && (
                            <p className="text-red-700 text-sm">
                              {log.responseData.message || log.responseData.detail || 'Unknown error'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          Showing {logs.length} logs
          {filter === 'user-creation' && summary && summary.totalErrors > 0 && (
            <span className="ml-4 text-red-600">
              ({summary.totalErrors} errors found)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiLogViewer;