// Export authentication
export { b4aiAuth, type B4AIAuth } from './auth';

// Export client functions
export {
  surfsiteApiCall,
  buildPaginationParams,
  handleSurfsiteResponse,
  type SurfsiteApiCallParams,
} from './client';

// Export constants
export { SURFSITE_API_BASE_URL, API_HEADERS, API_PATHS, ERROR_MESSAGES } from './constants';

// Export models
export type {
  SurfsiteAuthProps,
  SurfsiteApiResponse,
  SurfsiteApiError,
  ResponseMetadata,
  PaginationInfo,
  KnowledgeDocument,
  KnowledgeSearchQuery,
  KnowledgeSearchResult,
  KnowledgeCollection,
  GraphNode,
  GraphRelationship,
  GraphQueryParams,
  GraphQueryResult,
  GraphPath,
  GraphTraverseParams,
  Workspace,
  User,
} from './models';
