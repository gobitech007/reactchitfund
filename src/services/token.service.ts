/**
 * Token Service
 * Handles JWT token management, including automatic token refresh
 */

// import { AuthService } from './auth.service';
import ApiService from './api.service';

// JWT token structure (partial)
interface DecodedToken {
  exp: number;  // Expiration timestamp
  sub: string;  // Subject (usually email)
  [key: string]: any;  // Other claims
}

class TokenService {
  private refreshTimeoutId: number | null = null;
  private tokenRefreshInProgress = false;
  
  /**
   * Initialize token management
   * Sets up automatic token refresh if a token exists
   */
  public init(): void {
    // Check if we have a token
    const token = sessionStorage.getItem('authToken');
    if (token) {
      this.setupTokenRefresh(token);
    }
    
    // Listen for storage events (in case token is updated in another tab)
    window.addEventListener('storage', (event) => {
      if (event.key === 'authToken' && event.newValue) {
        this.setupTokenRefresh(event.newValue);
      }
    });
  }
  
  /**
   * Decode a JWT token without verification
   * @param token - JWT token string
   * @returns Decoded token payload or null if invalid
   */
  public decodeToken(token: string): DecodedToken | null {
    try {
      // Split the token and get the payload part (second part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  
  /**
   * Get token expiration time in milliseconds
   * @param token - JWT token string
   * @returns Expiration time in milliseconds or 0 if invalid
   */
  public getTokenExpirationTime(token: string): number {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return 0;
    
    // exp is in seconds, convert to milliseconds
    return decoded.exp * 1000;
  }
  
  /**
   * Check if token is expired
   * @param token - JWT token string
   * @returns Boolean indicating if token is expired
   */
  public isTokenExpired(token: string): boolean {
    const expTime = this.getTokenExpirationTime(token);
    if (!expTime) return true;
    
    // Add a small buffer (10 seconds) to account for network latency
    return Date.now() >= expTime - 10000;
  }
  
  /**
   * Check if token will expire soon (within the specified minutes)
   * @param token - JWT token string
   * @param withinMinutes - Minutes threshold (default: 5)
   * @returns Boolean indicating if token will expire soon
   */
  public willTokenExpireSoon(token: string, withinMinutes: number = 5): boolean {
    const expTime = this.getTokenExpirationTime(token);
    if (!expTime) return true;
    
    // Check if token will expire within the specified minutes
    const expiresInMs = expTime - Date.now();
    const thresholdMs = withinMinutes * 60 * 1000;
    
    return expiresInMs <= thresholdMs;
  }
  
  /**
   * Set up automatic token refresh
   * @param token - JWT token string
   */
  public setupTokenRefresh(token: string): void {
    // Clear any existing refresh timeout
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
    
    // Get token expiration time
    const expTime = this.getTokenExpirationTime(token);
    if (!expTime) return;
    
    // Calculate when to refresh the token (5 minutes before expiration or half the token lifetime, whichever is smaller)
    const tokenLifetimeMs = expTime - Date.now();
    const refreshThresholdMs = Math.min(5 * 60 * 1000, tokenLifetimeMs / 2);
    const refreshTimeMs = tokenLifetimeMs - refreshThresholdMs;
    
    // Don't set up refresh if token is already expired or will expire very soon
    if (refreshTimeMs <= 0) {
      console.warn('Token is expired or will expire very soon. Not setting up refresh.');
      return;
    }
    
    console.log(`Token will be refreshed in ${Math.round(refreshTimeMs / 1000 / 60)} minutes`);
    
    // Set up timeout to refresh token
    this.refreshTimeoutId = window.setTimeout(() => {
      this.refreshToken();
    }, refreshTimeMs);
  }
  
  /**
   * Refresh the authentication token
   * @returns Promise resolving to boolean indicating success
   */
  public async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.tokenRefreshInProgress) {
      return false;
    }
    
    this.tokenRefreshInProgress = true;
    
    try {
      // Get current token
      const currentToken = sessionStorage.getItem('authToken');
      if (!currentToken) {
        this.tokenRefreshInProgress = false;
        return false;
      }
      
      // Check if token is still valid
      if (!this.isTokenExpired(currentToken)) {
        // Token is still valid, create a new token with the same data
        const decoded = this.decodeToken(currentToken);
        if (!decoded) {
          this.tokenRefreshInProgress = false;
          return false;
        }
        
        // Call the validate-token endpoint to check if the token is still valid on the server
        const validationResponse = await ApiService.get('/auth/validate-token');
        if (!validationResponse.data?.valid) {
          console.warn('Token is no longer valid on the server. User may need to log in again.');
          this.tokenRefreshInProgress = false;
          return false;
        }
        
        // Call the refresh-token endpoint to get a new token
        const response = await ApiService.post('/auth/refresh-token');
        
        if (response.data && response.data.access_token) {
          // Store the new token
          sessionStorage.setItem('authToken', response.data.access_token);
          
          // Set up refresh for the new token
          this.setupTokenRefresh(response.data.access_token);
          
          console.log('Token refreshed successfully');
          this.tokenRefreshInProgress = false;
          return true;
        }
      }
      
      // If we get here, token refresh failed
      console.warn('Token refresh failed. User may need to log in again.');
      this.tokenRefreshInProgress = false;
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.tokenRefreshInProgress = false;
      return false;
    }
  }
  
  /**
   * Clear token refresh timeout
   * Call this when logging out
   */
  public clearTokenRefresh(): void {
    if (this.refreshTimeoutId !== null) {
      window.clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }
}

// Create singleton instance
const tokenService = new TokenService();

export default tokenService;