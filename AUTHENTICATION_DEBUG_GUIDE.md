# Authentication Error Debugging Guide

## Problem: "Could not validate credentials" Error

You're getting this error when accessing: `api/payments/chit_users/1/pay_details/`

This indicates an authentication/authorization issue after user login.

## Quick Debugging Steps

### 1. Check Token Status (Browser Console)
```javascript
// Open browser dev tools (F12) and run:
debugApi.checkTokenStatus()
```

This will show:
- ✅ Whether you have a token
- ✅ If the token is expired
- ✅ Token expiration time
- ✅ User data availability

### 2. Check Authentication Errors
```javascript
// Show all authentication errors:
debugApi.getAuthErrors()

// Show chit payment specific errors:
debugApi.getChitPaymentErrors()

// Check what headers are being sent:
debugApi.debugAuthHeaders()
```

### 3. Use the Visual Log Viewer
- Click the red floating button (📋) in the bottom-right corner
- Select "Chit Payment Errors" or "Authentication Errors" from the filter dropdown
- Look for 401/403 status codes

## Common Causes & Solutions

### 1. **Token Expired**
**Symptoms:** Token exists but is expired
**Solution:** 
- User needs to log in again
- Check if token refresh is working properly

### 2. **No Token Present**
**Symptoms:** No authToken in localStorage
**Solution:**
- User was never properly logged in
- Token was cleared/lost
- Check login process

### 3. **Invalid Token Format**
**Symptoms:** Token exists but server rejects it
**Solution:**
- Check if token is properly formatted JWT
- Verify token hasn't been corrupted

### 4. **Wrong Authorization Header**
**Symptoms:** Token is valid but server still rejects
**Solution:**
- Verify Authorization header format: `Bearer <token>`
- Check for extra spaces or characters

### 5. **Server-Side Token Validation Issues**
**Symptoms:** Token appears valid on client but server rejects
**Solution:**
- Token might be blacklisted on server
- Server JWT secret might have changed
- User permissions might have been revoked

## Detailed Debugging Process

### Step 1: Verify Login State
```javascript
// Check if user appears to be logged in
const token = localStorage.getItem('authToken');
const user = localStorage.getItem('user');
console.log('Has token:', !!token);
console.log('Has user:', !!user);
```

### Step 2: Inspect Token Details
```javascript
// Get detailed token information
debugApi.checkTokenStatus()
```

Look for:
- Token expiration time
- Token payload (user ID, permissions, etc.)
- Whether token is expired

### Step 3: Check Recent Authentication Errors
```javascript
// See all recent auth errors
debugApi.getAuthErrors()
```

Look for:
- 401 Unauthorized errors
- 403 Forbidden errors
- Patterns in when errors occur

### Step 4: Test Token Manually
```javascript
// Check what headers would be sent
debugApi.debugAuthHeaders()
```

### Step 5: Check Specific Endpoint Errors
```javascript
// Check chit payment endpoint specifically
debugApi.getChitPaymentErrors()
```

## Expected Log Output for This Error

When you get "Could not validate credentials", you should see a log entry like:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "GET",
  "endpoint": "/payments/chit_users/1/pay_details/",
  "requestData": null,
  "responseStatus": 401,
  "responseData": {
    "detail": "Could not validate credentials"
  },
  "error": "Could not validate credentials"
}
```

## Troubleshooting Checklist

- [ ] Token exists in localStorage (`debugApi.checkTokenStatus()`)
- [ ] Token is not expired
- [ ] User data exists in localStorage
- [ ] Authorization header is properly formatted
- [ ] No recent authentication errors (`debugApi.getAuthErrors()`)
- [ ] Login process completed successfully
- [ ] Token refresh is working (if applicable)

## Common Solutions

### Force Re-login
```javascript
// Clear all auth data and force re-login
localStorage.removeItem('authToken');
localStorage.removeItem('user');
localStorage.removeItem('refreshToken');
// Then redirect to login page
```

### Check Network Tab
1. Open browser dev tools (F12)
2. Go to Network tab
3. Try the failing request again
4. Look at the request headers
5. Verify Authorization header is present and correct

### Manual Token Test
```javascript
// Test if token works with a simple endpoint
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Token test result:', data))
.catch(error => console.error('Token test failed:', error));
```

## Prevention

1. **Implement proper token refresh logic**
2. **Handle 401 errors gracefully** (redirect to login)
3. **Monitor token expiration** and refresh before expiry
4. **Clear invalid tokens** from localStorage
5. **Provide clear error messages** to users

## Getting Help

If the issue persists:

1. Run `debugApi.getChitPaymentErrors()` and save the output
2. Run `debugApi.checkTokenStatus()` and save the output
3. Check browser Network tab for the failing request
4. Note the exact timing of when the error occurs (immediately after login, after some time, etc.)

The logging system will capture all the details needed to diagnose the authentication issue.