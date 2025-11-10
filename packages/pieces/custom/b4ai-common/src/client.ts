import {
  httpClient,
  HttpMethod,
  HttpRequest,
  HttpMessageBody,
  QueryParams,
} from '@activepieces/pieces-common';
import { SURFSITE_API_BASE_URL, API_HEADERS, ERROR_MESSAGES } from './constants';
import { SurfsiteAuthProps, SurfsiteApiResponse } from './models';

export interface SurfsiteApiCallParams {
  method: HttpMethod;
  resourceUri: string;
  query?: Record<string, string | number | string[] | boolean | undefined>;
  body?: any;
  auth: SurfsiteAuthProps;
  headers?: Record<string, string>;
}

/**
 * Makes an HTTP request to the Surfsite API
 * @param params Request parameters including method, URI, auth, etc.
 * @returns API response body
 * @throws Error with descriptive message if request fails
 */
export async function surfsiteApiCall<T extends HttpMessageBody = any>({
  method,
  resourceUri,
  query,
  body,
  auth,
  headers = {},
}: SurfsiteApiCallParams): Promise<T> {
  const { apiKey, environment = 'production' } = auth;

  if (!apiKey) {
    throw new Error('Surfsite API Key is required');
  }

  // Build query parameters
  const queryParams: QueryParams = {};
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined) {
        queryParams[key] = String(value);
      }
    }
  }

  // Determine base URL based on environment
  const baseUrl =
    environment === 'staging'
      ? 'https://staging.api.surfsite.ai'
      : SURFSITE_API_BASE_URL;

  // Build the request
  const request: HttpRequest = {
    method,
    url: `${baseUrl}${resourceUri}`,
    headers: {
      [API_HEADERS.X_API_KEY]: apiKey,
      [API_HEADERS.CONTENT_TYPE]: 'application/json',
      ...headers,
    },
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
    const errorMessage = errorData?.message || errorData?.error || '';

    switch (statusCode) {
      case 400:
        throw new Error(
          `${ERROR_MESSAGES.BAD_REQUEST} ${errorMessage}`.trim()
        );
      case 401:
        throw new Error(ERROR_MESSAGES.AUTHENTICATION_FAILED);
      case 403:
        throw new Error(
          `${ERROR_MESSAGES.FORBIDDEN} ${errorMessage}`.trim()
        );
      case 404:
        throw new Error(
          `${ERROR_MESSAGES.NOT_FOUND} ${errorMessage}`.trim()
        );
      case 429:
        throw new Error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error(
          `${ERROR_MESSAGES.INTERNAL_SERVER_ERROR} ${errorMessage}`.trim()
        );
      default:
        if (errorMessage) {
          throw new Error(`Surfsite API Error (${statusCode}): ${errorMessage}`);
        }
        throw new Error(
          `${ERROR_MESSAGES.UNKNOWN_ERROR} Status: ${statusCode || 'unknown'}`
        );
    }
  }
}

/**
 * Helper function to build query parameters for pagination
 */
export function buildPaginationParams(
  page?: number,
  pageSize?: number
): Record<string, number> {
  const params: Record<string, number> = {};

  if (page !== undefined && page > 0) {
    params.page = page;
  }

  if (pageSize !== undefined && pageSize > 0) {
    params.pageSize = pageSize;
  }

  return params;
}

/**
 * Helper function to handle API responses with standard Surfsite response format
 */
export function handleSurfsiteResponse<T>(
  response: SurfsiteApiResponse<T>
): T {
  if (!response.success && response.error) {
    throw new Error(
      `Surfsite API Error: ${response.error.message || 'Unknown error'}`
    );
  }

  if (response.data === undefined) {
    throw new Error('Invalid API response: missing data field');
  }

  return response.data;
}
