// Authentication models
export interface SurfsiteAuthProps {
  apiKey: string;
  environment?: 'production' | 'staging';
}

// API Response models
export interface SurfsiteApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: SurfsiteApiError;
  metadata?: ResponseMetadata;
}

export interface SurfsiteApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp?: string;
  requestId?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Knowledge Hub models
export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  collectionId?: string;
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSearchQuery {
  query: string;
  searchType?: 'semantic' | 'keyword' | 'hybrid';
  limit?: number;
  offset?: number;
  collectionId?: string;
  filters?: Record<string, any>;
}

export interface KnowledgeSearchResult {
  documents: KnowledgeDocument[];
  scores?: number[];
  totalResults: number;
}

export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Graph Database models
export interface GraphNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GraphRelationship {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface GraphQueryParams {
  query: string;
  parameters?: Record<string, any>;
  limit?: number;
}

export interface GraphQueryResult {
  nodes?: GraphNode[];
  relationships?: GraphRelationship[];
  paths?: GraphPath[];
  raw?: any;
}

export interface GraphPath {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  length: number;
}

export interface GraphTraverseParams {
  startNodeId: string;
  direction?: 'incoming' | 'outgoing' | 'both';
  relationshipTypes?: string[];
  maxDepth?: number;
  limit?: number;
}

// Core models
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  workspaceId?: string;
  createdAt: string;
  updatedAt: string;
}
