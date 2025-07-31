/**
 * API Logger Utility
 * Simple logging system for API requests and responses, especially for debugging 400 errors
 */

interface LogEntry {
  timestamp: string;
  method: string;
  endpoint: string;
  requestData?: any;
  responseStatus: number;
  responseData?: any;
  error?: string;
  userAgent: string;
}

class ApiLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Keep last 500 logs

  /**
   * Log an API request and response
   */
  logApiCall(
    method: string,
    endpoint: string,
    requestData: any,
    responseStatus: number,
    responseData: any,
    error?: string
  ) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      requestData,
      responseStatus,
      responseData,
      error,
      userAgent: navigator.userAgent
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Save to sessionStorage for persistence
    this.saveToStorage();

    // Console log for immediate debugging
    if (responseStatus >= 400) {
      console.error(`API Error: ${method} ${endpoint}`, {
        status: responseStatus,
        request: requestData,
        response: responseData,
        error
      });
    }
  }

  /**
   * Get all logs
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs for user creation endpoint only
   */
  getUserCreationLogs(): LogEntry[] {
    return this.logs.filter(log => 
      log.endpoint === '/users/' && log.method === 'POST'
    );
  }

  /**
   * Get error logs only (status >= 400)
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.responseStatus >= 400);
  }

  /**
   * Get user creation error logs specifically
   */
  getUserCreationErrors(): LogEntry[] {
    return this.logs.filter(log => 
      log.endpoint === '/users/' && 
      log.method === 'POST' && 
      log.responseStatus >= 400
    );
  }

  /**
   * Get authentication error logs (401 Unauthorized, 403 Forbidden)
   */
  getAuthenticationErrors(): LogEntry[] {
    return this.logs.filter(log => 
      log.responseStatus === 401 || log.responseStatus === 403
    );
  }

  /**
   * Get payment endpoint error logs
   */
  getPaymentErrors(): LogEntry[] {
    return this.logs.filter(log => 
      log.endpoint.includes('/payments/') && 
      log.responseStatus >= 400
    );
  }

  /**
   * Get chit payment details error logs specifically
   */
  getChitPaymentDetailsErrors(): LogEntry[] {
    return this.logs.filter(log => 
      log.endpoint.includes('/payments/chit_users/') && 
      log.endpoint.includes('/pay_details/') &&
      log.responseStatus >= 400
    );
  }

  /**
   * Save logs to sessionStorage
   */
  private saveToStorage() {
    try {
      sessionStorage.setItem('api_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to save logs to sessionStorage:', error);
    }
  }

  /**
   * Load logs from sessionStorage
   */
  loadFromStorage() {
    try {
      const savedLogs = sessionStorage.getItem('api_logs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.warn('Failed to load logs from sessionStorage:', error);
      this.logs = [];
    }
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    sessionStorage.removeItem('api_logs');
  }

  /**
   * Export logs as JSON string
   */
  exportAsJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export logs as CSV string
   */
  exportAsCsv(): string {
    if (this.logs.length === 0) {
      return 'No logs available';
    }

    const headers = ['Timestamp', 'Method', 'Endpoint', 'Status', 'Request Data', 'Response Data', 'Error'];
    const csvRows = [headers.join(',')];

    this.logs.forEach(log => {
      const row = [
        log.timestamp,
        log.method,
        log.endpoint,
        log.responseStatus.toString(),
        `"${JSON.stringify(log.requestData || {}).replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.responseData || {}).replace(/"/g, '""')}"`,
        `"${(log.error || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Download logs as a file
   */
  downloadLogs(format: 'json' | 'csv' = 'json', filename?: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `api-logs-${timestamp}.${format}`;
    const finalFilename = filename || defaultFilename;

    let content: string;
    let mimeType: string;

    if (format === 'csv') {
      content = this.exportAsCsv();
      mimeType = 'text/csv';
    } else {
      content = this.exportAsJson();
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Get summary of user creation errors
   */
  getUserCreationErrorSummary() {
    const errors = this.getUserCreationErrors();
    const summary = {
      totalErrors: errors.length,
      errorsByStatus: {} as Record<number, number>,
      commonErrors: [] as string[],
      recentErrors: errors.slice(-10) // Last 10 errors
    };

    // Count errors by status code
    errors.forEach(error => {
      summary.errorsByStatus[error.responseStatus] = 
        (summary.errorsByStatus[error.responseStatus] || 0) + 1;
    });

    // Extract common error messages
    const errorMessages = errors
      .map(error => error.error || 'Unknown error')
      .filter((message, index, array) => array.indexOf(message) === index);
    
    summary.commonErrors = errorMessages.slice(0, 5); // Top 5 unique errors

    return summary;
  }
}

// Create singleton instance
const apiLogger = new ApiLogger();

// Load existing logs on initialization
apiLogger.loadFromStorage();

export default apiLogger;