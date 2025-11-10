export const SURFSITE_API_BASE_URL = 'https://api.surfsite.ai';

export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  X_API_KEY: 'X-API-Key',
  AUTHORIZATION: 'Authorization',
} as const;

export const API_PATHS = {
  // Knowledge Hub endpoints
  KNOWLEDGE: {
    SEARCH: '/v1/knowledge/search',
    DOCUMENTS: '/v1/knowledge/documents',
    COLLECTIONS: '/v1/knowledge/collections',
    EMBEDDINGS: '/v1/knowledge/embeddings',
    QUERY: '/v1/knowledge/query',
  },
  // Graph Database endpoints
  GRAPH: {
    NODES: '/v1/graph/nodes',
    RELATIONSHIPS: '/v1/graph/relationships',
    QUERY: '/v1/graph/query',
    TRAVERSE: '/v1/graph/traverse',
    PATHS: '/v1/graph/paths',
  },
  // Core endpoints
  CORE: {
    USER: '/v1/user',
    WORKSPACE: '/v1/workspace',
    HEALTH: '/v1/health',
  },
} as const;

export const ERROR_MESSAGES = {
  INVALID_API_KEY: 'Invalid API key. Please check your Surfsite API credentials.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please verify your API key.',
  BAD_REQUEST: 'Bad request. Please check your request parameters.',
  FORBIDDEN: 'Access forbidden. You may not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  INTERNAL_SERVER_ERROR: 'Surfsite API internal server error.',
  UNKNOWN_ERROR: 'An unknown error occurred while communicating with Surfsite API.',
} as const;
