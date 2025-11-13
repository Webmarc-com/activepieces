// Property Data Types
export type PropertyDataType =
  | 'NULL'
  | 'STRING'
  | 'BOOLEAN'
  | 'INTEGER'
  | 'FLOAT'
  | 'LIST'
  | 'MAP'
  | 'DURATION'
  | 'DATE'
  | 'LOCAL_TIME'
  | 'LOCAL_DATE_TIME'
  | 'ZONED_DATE_TIME'
  | 'ENUM'
  | 'POINT'
  | 'JSON'
  | 'LONG_TEXT'
  | 'LINK'
  | 'FILE';

// Status Types
export type Status = 'PRODUCTION' | 'DRAFT';

// Filter Operators
export type FilterOperator =
  | '='
  | '!='
  | '<>'
  | '>'
  | '<'
  | '>='
  | '<='
  | 'CONTAINS'
  | 'STARTS WITH'
  | 'ENDS WITH'
  | 'IN'
  | 'NOT IN'
  | 'IS NULL'
  | 'IS NOT NULL';

// Filter Logic Types
export type FilterLogic = 'AND' | 'OR' | 'NOT' | 'XOR';

// Node Type Models
export interface GraphNodeType {
  id: string;
  name: string;
  description: string | null;
  knowledgeHubId: string;
  memgraphInstanceId: string;
  status: Status;
  isPrimary: boolean;
  isSearchable: boolean;
  properties: NodeProperty[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNodeTypeRequest {
  name: string;
  description?: string;
  knowledgeHubId: string;
  status: Status;
  isPrimary?: boolean;
  isSearchable?: boolean;
  properties?: CreatePropertyRequest[];
}

export interface UpdateNodeTypeRequest {
  name?: string;
  description?: string;
  isPrimary?: boolean;
  isSearchable?: boolean;
}

// Node Property Models
export interface NodeProperty {
  id: string;
  name: string;
  dataType: PropertyDataType;
  isRequired: boolean;
  defaultValue: any;
  isSearchable: boolean;
  isEnum: boolean;
  displayInResults: boolean;
  nodeTypeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyRequest {
  name: string;
  dataType: PropertyDataType;
  isRequired?: boolean;
  defaultValue?: any;
  isSearchable?: boolean;
  isEnum?: boolean;
  displayInResults?: boolean;
}

export interface UpdatePropertyRequest {
  name?: string;
  dataType?: PropertyDataType;
  isRequired?: boolean;
  defaultValue?: any;
  isSearchable?: boolean;
  isEnum?: boolean;
  displayInResults?: boolean;
}

// Relationship Type Models
export interface GraphRelationshipType {
  id: string;
  name: string;
  description: string | null;
  sourceNodeTypeId: string;
  targetNodeTypeId: string;
  knowledgeHubId: string;
  memgraphInstanceId: string;
  status: Status;
  properties: RelationshipProperty[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRelationshipTypeRequest {
  name: string;
  description?: string;
  sourceNodeTypeId: string;
  targetNodeTypeId: string;
  knowledgeHubId?: string;
  status?: Status;
  properties?: CreatePropertyRequest[];
  isDirected?: boolean;
  allowMultiple?: boolean;
}

export interface UpdateRelationshipTypeRequest {
  name?: string;
  description?: string;
  sourceNodeTypeId?: string;
  targetNodeTypeId?: string;
  isDirected?: boolean;
  allowMultiple?: boolean;
}

// Relationship Property Models
export interface RelationshipProperty {
  id: string;
  name: string;
  dataType: PropertyDataType;
  isRequired: boolean;
  defaultValue: any;
  relationshipTypeId: string;
  createdAt: string;
  updatedAt: string;
}

// Record Models
export interface NodeRecord {
  id: number;
  nodeTypeId: string;
  properties: globalThis.Record<string, any>;
  relationships?: RecordRelationship[];
  createdAt: string;
  updatedAt: string;
}

export interface RecordRelationship {
  relationshipId: string;
  records: Array<{
    recordId: number;
    relationshipProperties?: globalThis.Record<string, any>;
  }>;
}

export interface CreateRecordRequest {
  nodeTypeId: string;
  properties: globalThis.Record<string, any>;
  relationships?: RecordRelationship[];
}

export interface UpdateRecordRequest {
  properties?: globalThis.Record<string, any>;
  relationships?: RecordRelationship[];
}

// Filter Models
export interface Filter {
  field: string;
  operator: FilterOperator;
  value?: any;
  logic?: FilterLogic;
  filters?: Filter[];
}

export interface FilterRequest {
  nodeTypeId: string;
  filter: Filter;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

// Pagination Models
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Deduplication Models
export interface DeduplicationConfig {
  enabled: boolean;
  fields: string[];
  similarityThreshold?: number;
  strategy: 'EXACT' | 'FUZZY' | 'SEMANTIC';
}

export interface DeduplicationTestResult {
  duplicates: Array<{
    recordId: number;
    matches: Array<{
      recordId: number;
      similarity: number;
      fields: globalThis.Record<string, any>;
    }>;
  }>;
  totalDuplicates: number;
}

// Bulk Operation Models
export interface BulkCreateResponse {
  created: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}

export interface BulkUpdateResponse {
  updated: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

export interface BulkDeleteResponse {
  deleted: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// Graph Node Property (extends NodeProperty)
export interface GraphNodeProperty extends NodeProperty {}

// Graph Relationship Property (extends RelationshipProperty)
export interface GraphRelationshipProperty extends RelationshipProperty {}

// Node Property Request Types
export interface CreateNodePropertyRequest extends CreatePropertyRequest {
  nodeTypeId: string;
  isUnique?: boolean;
  isIndexed?: boolean;
  validationRules?: any;
}

export interface UpdateNodePropertyRequest {
  name?: string;
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  defaultValue?: any;
  validationRules?: any;
}

// Relationship Property Request Types
export interface CreateRelationshipPropertyRequest extends CreatePropertyRequest {
  relationshipTypeId: string;
  isUnique?: boolean;
  isIndexed?: boolean;
  validationRules?: any;
}

export interface UpdateRelationshipPropertyRequest {
  name?: string;
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  defaultValue?: any;
  validationRules?: any;
}

// Graph Node (extends NodeRecord)
export interface GraphNode extends NodeRecord {}

// Node Request Types
export interface CreateNodeRequest {
  nodeTypeId: string;
  properties: globalThis.Record<string, any>;
}

export interface UpdateNodeRequest {
  properties: globalThis.Record<string, any>;
}

// Graph Relationship
export interface GraphRelationship {
  id: string;
  relationshipTypeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties: globalThis.Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Relationship Request Types
export interface CreateRelationshipRequest {
  relationshipTypeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties?: globalThis.Record<string, any>;
}

export interface UpdateRelationshipRequest {
  properties: globalThis.Record<string, any>;
}

// Deduplication Extended Types
export interface DuplicateGroup {
  nodes: GraphNode[];
  similarity: number;
  matchedFields: string[];
}

export interface FindDuplicatesResponse {
  duplicateGroups: DuplicateGroup[];
  totalGroups: number;
}

export interface MergeNodesRequest {
  nodeIds: any[];
  mergeStrategy: 'prefer_first' | 'prefer_non_empty' | 'prefer_latest' | 'concatenate';
  keepRelationships?: boolean;
}

export interface DedupRule {
  id: string;
  name: string;
  nodeTypeId: string;
  matchFields: string[];
  similarityThreshold: number;
  autoMerge: boolean;
  mergeStrategy: 'prefer_first' | 'prefer_non_empty' | 'prefer_latest' | 'concatenate';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDedupRuleRequest {
  name: string;
  nodeTypeId: string;
  matchFields: any[];
  similarityThreshold?: number;
  autoMerge?: boolean;
  mergeStrategy?: 'prefer_first' | 'prefer_non_empty' | 'prefer_latest' | 'concatenate';
  isActive?: boolean;
}

export interface UpdateDedupRuleRequest {
  name?: string;
  matchFields?: any[];
  similarityThreshold?: number;
  autoMerge?: boolean;
  mergeStrategy?: 'prefer_first' | 'prefer_non_empty' | 'prefer_latest' | 'concatenate';
  isActive?: boolean;
}

export interface RunDedupRuleResponse {
  duplicateGroups: number;
  mergedCount: number;
}

// API Response Models
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

// Graph Ingestion Models (LLM-Optimized)
export interface GraphIngestNode {
  type: string; // Human-readable type name (e.g., "Consultant")
  id: string; // Temporary ID for cross-referencing (e.g., "maria")
  properties: globalThis.Record<string, any>;
}

export interface GraphIngestRelationship {
  type: string; // Human-readable relationship type name (e.g., "WORKED_AT")
  from: string; // Temporary ID of source node
  to: string; // Temporary ID of target node
  properties?: globalThis.Record<string, any>;
}

export interface GraphIngestOptions {
  enableDeduplication?: boolean;
  returnCreatedIds?: boolean;
}

export interface GraphIngestRequest {
  nodes: GraphIngestNode[];
  relationships?: GraphIngestRelationship[];
  options?: GraphIngestOptions;
}

export interface GraphIngestItemResult {
  success: boolean;
  tempId?: string;
  databaseId?: string | number;
  error?: string;
}

export interface GraphIngestPhaseResult {
  total: number;
  successful: number;
  failed: number;
  items: GraphIngestItemResult[];
}

export interface GraphIngestResponse {
  phase1Results: GraphIngestPhaseResult; // Node creation results
  phase2Results?: GraphIngestPhaseResult; // Relationship creation results
  idMapping: globalThis.Record<string, string | number>; // Temp ID -> Database ID
  summary: {
    nodesCreated: number;
    relationshipsCreated: number;
    totalErrors: number;
  };
}
