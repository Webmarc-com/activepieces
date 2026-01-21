import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { ApStorage } from './ap-browser-storage';

const tokenKey = 'token';
const TOKEN_PARAM = 'token';
const HIDE_SIDEBAR_PARAM = 'hideSidebar';

/**
 * Handles token authentication from URL query parameters.
 * This is used when ActivePieces is embedded in an iframe and the parent
 * application passes the authentication token via URL.
 *
 * The hideSidebar param is handled by EmbeddingProvider.
 *
 * Flow:
 * 1. Check if ?token=xxx exists in URL
 * 2. Validate it's a valid, non-expired JWT
 * 3. Store it in sessionStorage (for embedded mode)
 * 4. Remove sensitive params from URL to avoid exposure
 */
export function handleUrlToken(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get(TOKEN_PARAM);

  if (!token) {
    cleanUrlParams();
    return false;
  }

  // Validate the token is a valid JWT and not expired
  if (!isValidJwt(token)) {
    console.warn('[URL Token Handler] Invalid or expired token in URL');
    cleanUrlParams();
    return false;
  }

  // For embedded mode, use sessionStorage
  ApStorage.setInstanceToSessionStorage();

  // Store the token
  ApStorage.getInstance().setItem(tokenKey, token);

  // Dispatch storage event to notify other components
  window.dispatchEvent(new Event('storage'));

  // Clean up URL - remove sensitive params
  cleanUrlParams();

  console.log('[URL Token Handler] Token authenticated from URL');
  return true;
}

/**
 * Check if a string is a valid, non-expired JWT
 */
function isValidJwt(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  try {
    const decoded = jwtDecode<{ exp?: number }>(token);

    // Check if token has expiration and is not expired
    if (decoded && decoded.exp) {
      if (dayjs().isAfter(dayjs.unix(decoded.exp))) {
        console.warn('[URL Token Handler] Token is expired');
        return false;
      }
    }

    return true;
  } catch (e) {
    console.warn('[URL Token Handler] Failed to decode token:', e);
    return false;
  }
}

/**
 * Remove sensitive params from URL without page reload
 */
function cleanUrlParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(TOKEN_PARAM);
  url.searchParams.delete(HIDE_SIDEBAR_PARAM);

  // Use replaceState to update URL without reload and without adding history entry
  window.history.replaceState({}, '', url.toString());
}

/**
 * Check if current URL has a token parameter
 */
export function hasUrlToken(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(TOKEN_PARAM);
}
