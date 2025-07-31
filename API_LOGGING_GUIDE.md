# API Logging System for User Creation Debugging

This guide explains how to use the API logging system to debug "POST /api/users/ HTTP/1.1" 400 Bad Request errors.

## Features

- **Automatic Logging**: All API requests and responses are automatically logged
- **User Creation Focus**: Special focus on `/users/` POST requests
- **Detailed Error Analysis**: Captures request data, response data, and error messages
- **Validation Error Parsing**: Automatically parses FastAPI validation errors
- **Export Capabilities**: Download logs as JSON or CSV files
- **Browser Console Integration**: Debug commands available in browser console

## How to Access Logs

### 1. Visual Interface (Development Mode Only)

When running in development mode, you'll see a red floating button (📋) in the bottom-right corner of the screen.

- **Click the button** to open the log viewer
- **Red badge** shows the number of user creation errors
- **Filter options**: View all logs, errors only, or user creation logs only

### 2. Browser Console Commands

Open browser developer tools (F12) and use these commands:

```javascript
// Show all user creation errors
debugApi.getUserCreationErrors()

// Show detailed analysis of the last error
debugApi.showLastError()

// Get error summary with statistics
debugApi.getErrorSummary()

// Download user creation logs as JSON file
debugApi.downloadUserCreationLogs()

// Clear all logs
debugApi.clearLogs()

// Export all logs to console
debugApi.exportLogsToConsole()
```

## Understanding the Logs

### Log Entry Structure

Each log entry contains:
- **Timestamp**: When the request was made
- **Method**: HTTP method (POST for user creation)
- **Endpoint**: API endpoint (/users/)
- **Request Data**: Data sent to the server
- **Response Status**: HTTP status code (400 for Bad Request)
- **Response Data**: Server response including error details
- **Error Message**: Parsed error message

### Common 400 Bad Request Causes

1. **Missing Required Fields**
   - `fullname` is required
   - `phone` is required
   - `dob` is required
   - `pin` is required

2. **Invalid Data Format**
   - `dob` must be in YYYY-MM-DD format
   - `phone` should be 10 digits
   - `pin` should be numeric
   - `aadhar` should be 12 digits (if provided)

3. **Validation Errors**
   - Email format validation
   - Phone number format validation
   - Date of birth validation (age requirements)
   - PIN format validation

## Example Error Analysis

When you see a 400 error, the log will show:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "POST",
  "endpoint": "/users/",
  "requestData": {
    "fullname": "John Doe",
    "phone": "invalid-phone",
    "dob": "invalid-date",
    "pin": 1234,
    "role": "customer"
  },
  "responseStatus": 400,
  "responseData": {
    "detail": [
      {
        "loc": ["body", "phone"],
        "msg": "Invalid phone number format",
        "type": "value_error"
      },
      {
        "loc": ["body", "dob"],
        "msg": "Invalid date format, expected YYYY-MM-DD",
        "type": "value_error"
      }
    ]
  },
  "error": "phone: Invalid phone number format, dob: Invalid date format, expected YYYY-MM-DD"
}
```

## Troubleshooting Steps

1. **Check the Debug Button**: Look for the red floating button in development mode
2. **Open Browser Console**: Use F12 and run `debugApi.showLastError()`
3. **Review Request Data**: Check if all required fields are present and correctly formatted
4. **Check Response Details**: Look for validation errors in the response
5. **Download Logs**: Use the download feature to save logs for further analysis

## File Locations

- **Logger**: `src/utils/api-logger.ts`
- **Log Viewer**: `src/components/ApiLogViewer.tsx`
- **Debug Button**: `src/components/DebugButton.tsx`
- **Debug Helpers**: `src/utils/debug-helpers.ts`

## Data Storage

- Logs are stored in browser's localStorage
- Maximum 500 log entries are kept
- Logs persist between browser sessions
- Can be cleared manually using the interface or console commands

## Production Notes

- Debug button and console commands are only available in development mode
- Logging still occurs in production but without the visual interface
- Logs are stored locally and never sent to external servers
- Consider the storage impact of keeping logs in production

## Getting Help

If you're still experiencing issues:

1. Download the logs using `debugApi.downloadUserCreationLogs()`
2. Check the browser network tab for additional details
3. Verify the backend server is running and accessible
4. Check CORS configuration if seeing network errors

The logging system will help you identify exactly what data is being sent and what errors are being returned, making it much easier to debug user creation issues.