// Knowledge Hub Models
export interface KnowledgeHub {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeHubDetailed extends KnowledgeHub {
  nodeTypes: GraphNodeType[];
  relationshipTypes: GraphRelationshipType[];
}

// Graph Schema Models
export interface GraphNodeType {
  id: string;
  name: string;
  description: string | null;
  properties: GraphProperty[];
  memgraphInstanceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphRelationshipType {
  id: string;
  name: string;
  description: string | null;
  sourceNodeTypeId: string;
  targetNodeTypeId: string;
  properties: GraphProperty[];
  memgraphInstanceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphProperty {
  id: string;
  name: string;
  dataType: 'STRING' | 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'LIST' | 'MAP';
  required: boolean;
  unique: boolean;
  indexed: boolean;
  searchable: boolean;
  description: string | null;
  nodeTypeId?: string;
  relationshipTypeId?: string;
  createdAt: string;
  updatedAt: string;
}

// Schema JSON Response (with metadata)
export interface SchemaWithMetadata {
  schema: {
    nodes: Array<{
      label: string;
      properties: Record<string, string>;
    }>;
    relationships: Array<{
      type: string;
      from: string;
      to: string;
      properties: Record<string, string>;
    }>;
  };
  metadata: {
    schemaTextDetailed: string | null;
    schemaTextSimplified: string | null;
    schemaDescription: string | null;
    searchPatterns: string | null;
    planExamples: string | null;
    queryExamples: string | null;
    commonMistakes: string | null;
    syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'OUTDATED';
    lastSyncedAt: string | null;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface ListKnowledgeHubsResponse {
  knowledgeHubs: KnowledgeHub[];
}

export interface GetKnowledgeHubResponse extends KnowledgeHubDetailed {}

export interface CreateKnowledgeHubRequest {
  name: string;
  description?: string;
}

export interface UpdateKnowledgeHubRequest {
  name?: string;
  description?: string;
}

export interface SyncSchemaRequest {
  generateMetadata?: boolean;
}

export interface RegenerateMetadataRequest {
  mode: 'full' | 'partial';
  includeProduction?: boolean;
}

export interface RegenerateMetadataResponse {
  syncStatus: string;
  lastSyncedAt: string | null;
}
