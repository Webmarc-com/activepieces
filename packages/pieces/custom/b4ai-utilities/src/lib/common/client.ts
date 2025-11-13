import {
  httpClient,
  HttpMethod,
  HttpRequest,
  QueryParams,
} from '@activepieces/pieces-common';
import { B4AIUtilitiesAuth } from './types';

export interface UploadApiCallParams {
  method: HttpMethod;
  endpoint: string;
  auth: B4AIUtilitiesAuth;
  body?: any;
  query?: Record<string, string | number | boolean | undefined>;
  isMultipart?: boolean;
}

/**
 * Makes an HTTP request to the B4AI Upload API
 * @param params Request parameters including method, endpoint, auth, etc.
 * @returns API response body
 * @throws Error with descriptive message if request fails
 */
export async function uploadApiCall<T = any>({
  method,
  endpoint,
  auth,
  body,
  query,
  isMultipart = false,
}: UploadApiCallParams): Promise<T> {
  const { baseUrl, apiKey, apiSecret } = auth;

  if (!baseUrl || !apiKey || !apiSecret) {
    throw new Error('Base URL, API Key, and API Secret are all required');
  }

  // Clean up base URL (remove trailing slash if present)
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  // Build query parameters
  const queryParams: QueryParams = {};
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        queryParams[key] = String(value);
      }
    }
  }

  // Build headers
  const headers: Record<string, string> = {
    'x-api-key': apiKey,
    'x-api-secret': apiSecret,
  };

  // Only add Content-Type for non-multipart requests
  // For multipart, the browser/httpClient will set it automatically with boundary
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  // Build the request
  const request: HttpRequest = {
    method,
    url: `${cleanBaseUrl}/api/upload${endpoint}`,
    headers,
    queryParams,
    body,
  };

  try {
    const response = await httpClient.sendRequest<T>(request);
    return response.body;
  } catch (error: any) {
    // Handle HTTP errors with specific status codes
    const statusCode = error.response?.status;
    const errorData = error.response?.data;

    // API returns {success: false, message: string} on errors
    const errorMessage = errorData?.message || errorData?.error || error.message || '';

    switch (statusCode) {
      case 400:
        throw new Error(`Bad Request: ${errorMessage || 'Invalid request parameters or no file provided'}`);
      case 401:
        throw new Error('Authentication Failed: Invalid API credentials');
      case 403:
        throw new Error(`Access Forbidden: ${errorMessage || 'You do not have permission to access this resource'}`);
      case 404:
        throw new Error(`Not Found: ${errorMessage || 'The requested file does not exist'}`);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error(`Server Error: ${errorMessage || 'Internal server error occurred'}`);
      default:
        if (errorMessage) {
          throw new Error(`Upload API Error (${statusCode}): ${errorMessage}`);
        }
        throw new Error(`Upload API Error: ${error.message || 'Unknown error occurred'}`);
    }
  }
}

/**
 * Helper function to build query parameters from an object
 */
export function buildQueryParams(
  params?: Record<string, string | number | boolean | undefined>
): QueryParams {
  const queryParams: QueryParams = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        queryParams[key] = String(value);
      }
    }
  }
  return queryParams;
}
