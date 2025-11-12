# Graph API

Production-focused API for managing graph database schema and data.

**Base Paths:**
- `/api/graph-node-types` - Node type schema
- `/api/graph-node-property` - Node properties
- `/api/graph-relationship-type` - Relationship schema
- `/api/graph-relationship-property` - Relationship properties
- `/api/node-type-records` - Actual graph data

---

## Authentication

API key authentication via headers:

```typescript
headers: {
  'x-api-key': string;
  'x-api-secret': string;
  'Content-Type': 'application/json';
}
```

---

## Graph Node Types

Manage node type schema in the graph database.

### GET `/api/graph-node-types`
List all node types for a knowledge hub.

**Query Parameters:**
```typescript
{
  knowledgeHubId?: string; // UUID
  status?: 'PRODUCTION'; // default: 'DRAFT', use 'PRODUCTION'
}
```

**Response:**
```typescript
{
  nodeTypes: Array<{
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    isPrimary: boolean;
    isSearchable: boolean;
    deduplicationEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

### GET `/api/graph-node-types/:id`
Get single node type with properties and relationships.

**Query Parameters:**
```typescript
{
  status?: 'PRODUCTION'; // default: 'DRAFT'
}
```

**Response:**
```typescript
{
  success: boolean;
  nodeType: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    isPrimary: boolean;
    isSearchable: boolean;
    deduplicationEnabled: boolean;
    deduplicationConfig: any;
    isImportRunning: boolean;
    graphExists: boolean;
    properties: Array<{
      id: string;
      name: string;
      dataType: PropertyDataType;
      isRequired: boolean;
      defaultValue: any;
      isSearchable: boolean;
      isEnum: boolean;
      displayInResults: boolean;
      maxDisplayRecords: number | null;
      graphExists: boolean;
    }>;
    relationships: Array<{
      id: string;
      name: string;
      toEntity: string;
      toNodeId: string;
      isPrimary: boolean;
      isSearchable: boolean;
      graphExists: boolean;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### POST `/api/graph-node-types`
Create node type.

**Request:**
```typescript
{
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  knowledgeHubId: string; // UUID
  status?: 'PRODUCTION'; // default: 'DRAFT'
  isPrimary?: boolean; // default: true
  isSearchable?: boolean; // default: true
  properties?: Array<{
    name: string;
    dataType: PropertyDataType;
    isRequired?: boolean; // default: false
    defaultValue?: any;
    isSearchable?: boolean; // default: true
    isEnum?: boolean; // default: false
    displayInResults?: boolean; // default: true
    maxDisplayRecords?: number;
  }>;
}
```

**Response:** Node type object

---

### PUT `/api/graph-node-types/:id`
Update node type.

**Request:** Partial of create schema (at least one field required)

**Response:** Updated node type

---

### DELETE `/api/graph-node-types/:id`
Delete node type and cascade delete properties.

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

### POST `/api/graph-node-types/bulk`
Bulk create node types.

**Request:**
```typescript
{
  types: Array<CreateNodeType>; // Same as POST schema
}
```

**Response:** Created types

---

### PUT `/api/graph-node-types/bulk`
Bulk update node types.

**Request:**
```typescript
{
  types: Array<{
    id: string;
    data: Partial<CreateNodeType>;
  }>; // max 100
}
```

**Response:** Updated types

---

### DELETE `/api/graph-node-types/bulk`
Bulk delete node types.

**Request:**
```typescript
{
  ids: string[]; // UUIDs
}
```

**Response:** Success message

---

## Deduplication

### GET `/api/graph-node-types/:id/deduplication`
Get deduplication configuration.

**Response:**
```typescript
{
  success: boolean;
  config: {
    properties: string[]; // Property names to compare
    threshold: number; // Similarity threshold (0-1)
    embeddingModel?: string;
  } | null;
  enabled: boolean;
}
```

---

### PUT `/api/graph-node-types/:id/deduplication`
Update deduplication configuration.

**Request:**
```typescript
{
  properties: string[]; // Property IDs or names
  threshold?: number; // default: 0.85
  embeddingModel?: string;
}
```

**Response:** Updated config

---

### POST `/api/graph-node-types/:id/deduplication/enable`
Enable deduplication.

**Response:** Success message

---

### POST `/api/graph-node-types/:id/deduplication/disable`
Disable deduplication.

**Response:** Success message

---

### POST `/api/graph-node-types/:id/deduplication/test`
Test deduplication against sample data.

**Request:**
```typescript
{
  sampleRecord: Record<string, any>;
  config?: DeduplicationConfig; // optional override
}
```

**Response:**
```typescript
{
  success: boolean;
  result: {
    embedding: {
      length: number;
      sample: number[]; // first 5 dimensions
    };
    embeddingText: string;
    similarRecords: Array<{
      id: number;
      similarity: number;
      properties: Record<string, any>;
    }>;
    wouldCreateDuplicate: boolean;
    config: any;
  };
}
```

---

### POST `/api/graph-node-types/:id/embeddings/regenerate`
Regenerate embeddings for all records.

**Request:**
```typescript
{
  batchSize?: number; // 1-1000, default: 100
  onlyNullEmbeddings?: boolean; // default: false
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  results: {
    totalRecords: number;
    processedRecords: number;
    successfulEmbeddings: number;
    failedEmbeddings: number;
    batchesProcessed: number;
    embeddingDimensions: number;
    vectorIndexCreated: boolean;
    processingTimeMs: number;
  };
}
```

---

### POST `/api/graph-node-types/:id/deduplication/trigger`
Trigger deduplication for all records.

**Request:**
```typescript
{
  batchSize?: number; // 1-1000, default: 100
  dryRun?: boolean; // default: false
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  jobId: string;
  results: {
    totalRecords: number;
    processedRecords: number;
    duplicatesFound: number;
    duplicatesRemoved: number;
    relationshipsMoved: number;
    batchesProcessed: number;
    processingTimeMs: number;
    duplicateGroups: Array<{
      existingRecordId: number;
      duplicateRecordIds: number[];
      similarities: number[];
      relationshipsMoved: number;
    }>;
  };
}
```

---

## Graph Node Properties

Manage properties for node types.

### GET `/api/graph-node-property`
List properties with optional filters.

**Query Parameters:**
```typescript
{
  nodeTypeId?: string; // UUID
  dataType?: PropertyDataType;
}
```

**Response:** Array of properties

---

### GET `/api/graph-node-property/:id`
Get single property.

**Response:**
```typescript
{
  property: {
    id: string;
    name: string;
    dataType: PropertyDataType;
    isRequired: boolean;
    defaultValue: any;
    nodeTypeId: string;
    isEnum: boolean;
    isSearchable: boolean;
    displayInResults: boolean;
    maxDisplayRecords: number | null;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### POST `/api/graph-node-property`
Create property.

**Request:**
```typescript
{
  name: string;
  dataType: PropertyDataType;
  isRequired?: boolean; // default: false
  defaultValue?: any;
  nodeTypeId: string; // UUID
  isEnum?: boolean; // default: false
  isSearchable?: boolean; // default: true
  displayInResults?: boolean; // default: true
  maxDisplayRecords?: number;
}
```

**Response:** Created property

---

### PUT `/api/graph-node-property/:id`
Update property.

**Request:** Partial of create schema

**Response:** Updated property

---

### DELETE `/api/graph-node-property/:id`
Delete property.

**Response:** Success message

---

### POST `/api/graph-node-property/bulk`
Bulk create properties.

**Request:**
```typescript
{
  properties: Array<CreateProperty>;
}
```

**Response:** Created properties

---

### PUT `/api/graph-node-property/bulk`
Bulk update properties.

**Request:**
```typescript
{
  properties: Array<{
    id: string;
    data: Partial<CreateProperty>;
  }>;
}
```

**Response:** Updated properties

---

### DELETE `/api/graph-node-property/bulk`
Bulk delete properties.

**Request:**
```typescript
{
  ids: string[];
}
```

**Response:** Success message

---

## Graph Relationship Types

Manage relationship schema between node types.

### GET `/api/graph-relationship-type`
List relationships with filters.

**Query Parameters:**
```typescript
{
  knowledgeHubId?: string; // UUID
  status?: 'PRODUCTION'; // default: 'DRAFT'
  fromNodeId?: string; // UUID
  toNodeId?: string; // UUID
}
```

**Response:** Array of relationship types

---

### GET `/api/graph-relationship-type/:id`
Get single relationship with properties.

**Query Parameters:**
```typescript
{
  status?: 'PRODUCTION';
}
```

**Response:**
```typescript
{
  success: boolean;
  relationshipType: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    fromNodeId: string;
    toNodeId: string;
    isPrimary: boolean;
    isSearchable: boolean;
    fromNode: {
      id: string;
      name: string;
      status: 'PRODUCTION';
    };
    toNode: {
      id: string;
      name: string;
      status: 'PRODUCTION';
    };
    properties: Array<{
      id: string;
      name: string;
      dataType: PropertyDataType;
      isRequired: boolean;
      defaultValue: any;
      isEnum: boolean;
      isSearchable: boolean;
      displayInResults: boolean;
      maxDisplayRecords: number | null;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### POST `/api/graph-relationship-type`
Create relationship type.

**Request:**
```typescript
{
  name: string;
  color?: string;
  icon?: string;
  knowledgeHubId: string; // UUID
  fromNodeId: string; // UUID
  toNodeId: string; // UUID
  status?: 'PRODUCTION'; // default: 'DRAFT'
  isSearchable?: boolean;
  isPrimary?: boolean;
  properties?: Array<{
    name: string;
    dataType: PropertyDataType;
    isRequired?: boolean;
    defaultValue?: any;
    isSearchable?: boolean;
    displayInResults?: boolean;
    maxDisplayRecords?: number;
  }>;
}
```

**Response:** Created relationship type

---

### PUT `/api/graph-relationship-type/:id`
Update relationship type.

**Request:** Partial of create schema

**Response:** Updated relationship type

---

### DELETE `/api/graph-relationship-type/:id`
Delete relationship type and cascade delete properties.

**Response:** Success message

---

### POST `/api/graph-relationship-type/bulk`
Bulk create relationships.

**Request:**
```typescript
{
  types: Array<CreateRelationshipType>;
}
```

**Response:** Created types

---

### PUT `/api/graph-relationship-type/bulk`
Bulk update relationships.

**Request:**
```typescript
{
  types: Array<{
    id: string;
    data: Partial<CreateRelationshipType>;
  }>; // max 100
}
```

**Response:** Updated types

---

### DELETE `/api/graph-relationship-type/bulk`
Bulk delete relationships.

**Request:**
```typescript
{
  ids: string[];
}
```

**Response:** Success message

---

## Graph Relationship Properties

Manage properties for relationship types.

### GET `/api/graph-relationship-property`
List properties with filters.

**Query Parameters:**
```typescript
{
  relationshipId?: string; // UUID
  dataType?: PropertyDataType;
}
```

**Response:** Array of properties

---

### GET `/api/graph-relationship-property/:id`
Get single property.

**Response:** Property object

---

### POST `/api/graph-relationship-property`
Create property.

**Request:**
```typescript
{
  name: string;
  dataType: PropertyDataType;
  isRequired?: boolean;
  defaultValue?: any;
  relationshipId: string; // UUID
  isEnum?: boolean;
  isSearchable?: boolean;
  displayInResults?: boolean;
  maxDisplayRecords?: number;
}
```

**Response:** Created property

---

### PUT `/api/graph-relationship-property/:id`
Update property.

**Request:** Partial of create schema

**Response:** Updated property

---

### DELETE `/api/graph-relationship-property/:id`
Delete property.

**Query Parameters:**
```typescript
{
  batchSize?: number; // default: 1000
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  propertiesRemoved?: number;
}
```

---

### POST `/api/graph-relationship-property/bulk`
Bulk create properties.

**Request:**
```typescript
{
  properties: Array<CreateRelationshipProperty>;
}
```

**Response:** Created properties

---

### PUT `/api/graph-relationship-property/bulk`
Bulk update properties.

**Request:**
```typescript
{
  properties: Array<{
    id: string;
    data: Partial<CreateRelationshipProperty>;
  }>;
}
```

**Response:** Updated properties

---

### DELETE `/api/graph-relationship-property/bulk`
Bulk delete properties.

**Query Parameters:**
```typescript
{
  batchSize?: number;
}
```

**Request:**
```typescript
{
  ids: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  results: Array<{
    id: string;
    success: boolean;
    message?: string;
    propertiesRemoved?: number;
  }>;
  totalPropertiesRemoved: number;
}
```

---

## Node Type Records

CRUD operations on actual graph data.

### GET `/api/node-type-records`
Get paginated records with simple filtering.

**Query Parameters:**
```typescript
{
  nodeTypeId: string; // UUID - Required
  page?: number; // min: 1, default: 1
  pageSize?: number; // 1-100, default: 10
  orderBy?: string; // property name
  orderDirection?: 'asc' | 'desc'; // default: 'asc'
  includeRelationships?: boolean; // default: false
}
```

**Response:**
```typescript
{
  success: boolean;
  records: Array<{
    recordId: number;
    properties: Record<string, any>;
    relationships?: Record<string, Array<{
      recordId: number | null;
      toEntity?: string;
      properties: Record<string, any>;
      relationshipProperties: Record<string, any>;
    }>>;
  }>;
  total: number;
  page: number;
  pageSize: number;
}
```

---

### POST `/api/node-type-records/filter`
Search records with complex filtering.

**Request:**
```typescript
{
  nodeTypeId: string; // UUID
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  includeRelationships?: boolean;
  filters?: PropertyFilter | FilterGroup;
}
```

**PropertyFilter:**
```typescript
{
  propertyName: string;
  operator: '=' | '!=' | '<>' | '>' | '<' | '>=' | '<='
           | 'CONTAINS' | 'NOT CONTAINS' | 'CONTAINS ALL'
           | 'STARTS WITH' | 'NOT STARTS WITH'
           | 'ENDS WITH' | 'NOT ENDS WITH'
           | 'IN' | 'NOT IN'
           | 'IS NULL' | 'IS NOT NULL'
           | 'REGEX' | 'NOT REGEX';
  value: any;
}
```

**FilterGroup:**
```typescript
{
  logic: 'AND' | 'OR' | 'NOT' | 'XOR';
  filters: Array<PropertyFilter | FilterGroup>; // recursive
}
```

**Response:** Same as GET endpoint

---

### POST `/api/node-type-records`
Create record.

**Request:**
```typescript
{
  nodeTypeId: string; // UUID
  properties: Record<string, any>;
  relationships?: Array<{
    relationshipId: string; // UUID
    records: Array<{
      recordId: number;
      relationshipProperties?: Record<string, any>;
    }>;
  }>;
}
```

**Response:** Created record

---

### PUT `/api/node-type-records`
Update record.

**Request:**
```typescript
{
  nodeTypeId: string; // UUID
  recordId: number;
  properties: Record<string, any>;
  relationships?: Array<{
    operation: 'add' | 'remove';
    relationshipId: string; // UUID
    records: Array<{
      recordId: number;
      relationshipProperties?: Record<string, any>;
    }>;
  }>;
}
```

**Response:** Updated record

---

### DELETE `/api/node-type-records`
Delete record.

**Request:**
```typescript
{
  nodeTypeId: string; // UUID
  recordId: number;
}
```

**Response:** Success message

---

### POST `/api/node-type-records/bulk`
Bulk create records.

**Request:**
```typescript
{
  records: Array<{
    nodeTypeId: string;
    properties: Record<string, any>;
    relationships?: Array<{
      relationshipId: string;
      records: Array<{
        recordId: number;
        relationshipProperties?: Record<string, any>;
      }>;
    }>;
  }>;
}
```

**Response:** Created records

---

### PUT `/api/node-type-records/bulk`
Bulk update records.

**Request:**
```typescript
{
  records: Array<{
    nodeTypeId: string;
    recordId: number;
    properties: Record<string, any>;
    relationships?: Array<{
      operation: 'add' | 'remove';
      relationshipId: string;
      records: Array<{
        recordId: number;
        relationshipProperties?: Record<string, any>;
      }>;
    }>;
  }>;
}
```

**Response:** Updated records

---

### DELETE `/api/node-type-records/bulk`
Bulk delete records.

**Request:**
```typescript
{
  nodeTypeId: string;
  recordIds: number[];
}
```

**Response:** Success message

---

### POST `/api/node-type-records/deduplicate`
Run deduplication on specific records.

**Request:**
```typescript
{
  nodeTypeId: string;
  recordIds: number[]; // min: 1
}
```

**Response:**
```typescript
{
  success: boolean;
  result: {
    processedRecords: number;
    duplicatesFound: number;
    duplicatesRemoved: number;
    relationshipsMoved: number;
    details: Array<{
      originalRecordId: number;
      existingRecordId?: number;
      similarity?: number;
      isDuplicate: boolean;
      relationshipsMoved: number;
    }>;
  };
  message: string;
}
```

---

## Error Responses

All errors return:
```typescript
{
  success: false;
  message: string;
}
```

| Status | Description |
|--------|-------------|
| 400 | Validation error or invalid UUID |
| 401 | Unauthorized |
| 404 | Resource not found |
| 500 | Internal server error |
| 503 | Service unavailable (deduplication) |

---

## Type Definitions

```typescript
type PropertyDataType =
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

interface GraphNodeType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isPrimary: boolean;
  isSearchable: boolean;
  deduplicationEnabled: boolean;
  deduplicationConfig: any;
  isImportRunning: boolean;
  graphExists: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GraphNodeTypeDetailed extends GraphNodeType {
  properties: GraphNodeProperty[];
  relationships: GraphRelationship[];
}

interface GraphNodeProperty {
  id: string;
  name: string;
  dataType: PropertyDataType;
  isRequired: boolean;
  defaultValue: any;
  nodeTypeId: string;
  isEnum: boolean;
  isSearchable: boolean;
  displayInResults: boolean;
  maxDisplayRecords: number | null;
  graphExists: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GraphRelationshipType {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  fromNodeId: string;
  toNodeId: string;
  isPrimary: boolean;
  isSearchable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GraphRelationshipTypeDetailed extends GraphRelationshipType {
  fromNode: {
    id: string;
    name: string;
    status: string;
  };
  toNode: {
    id: string;
    name: string;
    status: string;
  };
  properties: GraphRelationshipProperty[];
}

interface GraphRelationshipProperty {
  id: string;
  name: string;
  dataType: PropertyDataType;
  isRequired: boolean;
  defaultValue: any;
  relationshipId: string;
  isEnum: boolean;
  isSearchable: boolean;
  displayInResults: boolean;
  maxDisplayRecords: number | null;
  createdAt: string;
  updatedAt: string;
}

interface NodeRecord {
  recordId: number;
  properties: Record<string, any>;
  relationships?: Record<string, RelationshipRecord[]>;
}

interface RelationshipRecord {
  recordId: number | null;
  toEntity?: string;
  properties: Record<string, any>;
  relationshipProperties: Record<string, any>;
}

interface DeduplicationConfig {
  properties: string[];
  threshold: number;
  embeddingModel?: string;
}
```

---

## TypeScript Client

```typescript
interface GraphAuth {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

class GraphClient {
  constructor(private auth: GraphAuth) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.auth.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'x-api-key': this.auth.apiKey,
        'x-api-secret': this.auth.apiSecret,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Node Types
  async listNodeTypes(knowledgeHubId?: string) {
    return this.request<{ nodeTypes: GraphNodeType[] }>(
      'GET',
      '/api/graph-node-types',
      undefined,
      knowledgeHubId
        ? { knowledgeHubId, status: 'PRODUCTION' }
        : { status: 'PRODUCTION' }
    );
  }

  async getNodeType(id: string) {
    return this.request<{ success: boolean; nodeType: GraphNodeTypeDetailed }>(
      'GET',
      `/api/graph-node-types/${id}`,
      undefined,
      { status: 'PRODUCTION' }
    );
  }

  async createNodeType(data: {
    name: string;
    description?: string;
    knowledgeHubId: string;
    properties?: any[];
  }) {
    return this.request<{ nodeType: GraphNodeTypeDetailed }>(
      'POST',
      '/api/graph-node-types',
      { ...data, status: 'PRODUCTION' }
    );
  }

  async updateNodeType(id: string, data: Partial<any>) {
    return this.request<{ nodeType: GraphNodeTypeDetailed }>(
      'PUT',
      `/api/graph-node-types/${id}`,
      data
    );
  }

  async deleteNodeType(id: string) {
    return this.request<{ success: boolean; message: string }>(
      'DELETE',
      `/api/graph-node-types/${id}`
    );
  }

  // Deduplication
  async getDeduplicationConfig(nodeTypeId: string) {
    return this.request<{
      success: boolean;
      config: DeduplicationConfig | null;
      enabled: boolean;
    }>('GET', `/api/graph-node-types/${nodeTypeId}/deduplication`);
  }

  async updateDeduplicationConfig(
    nodeTypeId: string,
    config: DeduplicationConfig
  ) {
    return this.request<{ success: boolean; config: any }>(
      'PUT',
      `/api/graph-node-types/${nodeTypeId}/deduplication`,
      config
    );
  }

  async enableDeduplication(nodeTypeId: string) {
    return this.request<{ success: boolean; message: string }>(
      'POST',
      `/api/graph-node-types/${nodeTypeId}/deduplication/enable`
    );
  }

  async testDeduplication(nodeTypeId: string, sampleRecord: Record<string, any>) {
    return this.request<{ success: boolean; result: any }>(
      'POST',
      `/api/graph-node-types/${nodeTypeId}/deduplication/test`,
      { sampleRecord }
    );
  }

  async triggerDeduplication(
    nodeTypeId: string,
    options?: { batchSize?: number; dryRun?: boolean }
  ) {
    return this.request<{
      success: boolean;
      message: string;
      jobId: string;
      results: any;
    }>(
      'POST',
      `/api/graph-node-types/${nodeTypeId}/deduplication/trigger`,
      options
    );
  }

  // Node Properties
  async listNodeProperties(nodeTypeId?: string) {
    return this.request<{ properties: GraphNodeProperty[] }>(
      'GET',
      '/api/graph-node-property',
      undefined,
      nodeTypeId ? { nodeTypeId } : undefined
    );
  }

  async createNodeProperty(data: {
    name: string;
    dataType: PropertyDataType;
    nodeTypeId: string;
    isRequired?: boolean;
  }) {
    return this.request<{ property: GraphNodeProperty }>(
      'POST',
      '/api/graph-node-property',
      data
    );
  }

  async updateNodeProperty(id: string, data: Partial<any>) {
    return this.request<{ property: GraphNodeProperty }>(
      'PUT',
      `/api/graph-node-property/${id}`,
      data
    );
  }

  async deleteNodeProperty(id: string) {
    return this.request<{ success: boolean; message: string }>(
      'DELETE',
      `/api/graph-node-property/${id}`
    );
  }

  // Relationship Types
  async listRelationshipTypes(filters?: {
    knowledgeHubId?: string;
    fromNodeId?: string;
    toNodeId?: string;
  }) {
    return this.request<{ relationshipTypes: GraphRelationshipType[] }>(
      'GET',
      '/api/graph-relationship-type',
      undefined,
      { ...filters, status: 'PRODUCTION' }
    );
  }

  async getRelationshipType(id: string) {
    return this.request<{
      success: boolean;
      relationshipType: GraphRelationshipTypeDetailed;
    }>(
      'GET',
      `/api/graph-relationship-type/${id}`,
      undefined,
      { status: 'PRODUCTION' }
    );
  }

  async createRelationshipType(data: {
    name: string;
    knowledgeHubId: string;
    fromNodeId: string;
    toNodeId: string;
    properties?: any[];
  }) {
    return this.request<{ relationshipType: GraphRelationshipTypeDetailed }>(
      'POST',
      '/api/graph-relationship-type',
      { ...data, status: 'PRODUCTION' }
    );
  }

  async updateRelationshipType(id: string, data: Partial<any>) {
    return this.request<{ relationshipType: GraphRelationshipTypeDetailed }>(
      'PUT',
      `/api/graph-relationship-type/${id}`,
      data
    );
  }

  async deleteRelationshipType(id: string) {
    return this.request<{ success: boolean; message: string }>(
      'DELETE',
      `/api/graph-relationship-type/${id}`
    );
  }

  // Records
  async listRecords(params: {
    nodeTypeId: string;
    page?: number;
    pageSize?: number;
    includeRelationships?: boolean;
  }) {
    return this.request<{
      success: boolean;
      records: NodeRecord[];
      total: number;
      page: number;
      pageSize: number;
    }>('GET', '/api/node-type-records', undefined, params as any);
  }

  async filterRecords(filter: {
    nodeTypeId: string;
    page?: number;
    pageSize?: number;
    filters?: any;
    includeRelationships?: boolean;
  }) {
    return this.request<{
      success: boolean;
      records: NodeRecord[];
      total: number;
    }>('POST', '/api/node-type-records/filter', filter);
  }

  async createRecord(data: {
    nodeTypeId: string;
    properties: Record<string, any>;
    relationships?: any[];
  }) {
    return this.request<{ record: NodeRecord }>(
      'POST',
      '/api/node-type-records',
      data
    );
  }

  async updateRecord(data: {
    nodeTypeId: string;
    recordId: number;
    properties: Record<string, any>;
    relationships?: any[];
  }) {
    return this.request<{ record: NodeRecord }>(
      'PUT',
      '/api/node-type-records',
      data
    );
  }

  async deleteRecord(nodeTypeId: string, recordId: number) {
    return this.request<{ success: boolean; message: string }>(
      'DELETE',
      '/api/node-type-records',
      { nodeTypeId, recordId }
    );
  }

  async bulkCreateRecords(records: Array<{
    nodeTypeId: string;
    properties: Record<string, any>;
    relationships?: any[];
  }>) {
    return this.request<{ records: NodeRecord[] }>(
      'POST',
      '/api/node-type-records/bulk',
      { records }
    );
  }

  async deduplicateRecords(nodeTypeId: string, recordIds: number[]) {
    return this.request<{
      success: boolean;
      result: any;
      message: string;
    }>('POST', '/api/node-type-records/deduplicate', {
      nodeTypeId,
      recordIds,
    });
  }
}
```

---

## Usage Example

```typescript
const client = new GraphClient({
  baseUrl: 'https://api.yourdomain.com',
  apiKey: process.env.API_KEY!,
  apiSecret: process.env.API_SECRET!,
});

// Create node type
const { nodeType } = await client.createNodeType({
  name: 'Product',
  description: 'Product catalog items',
  knowledgeHubId: 'hub-uuid',
  properties: [
    { name: 'sku', dataType: 'STRING', isRequired: true },
    { name: 'name', dataType: 'STRING', isRequired: true },
    { name: 'price', dataType: 'FLOAT', isRequired: true },
    { name: 'inStock', dataType: 'BOOLEAN', isRequired: false },
  ],
});

// Configure deduplication
await client.updateDeduplicationConfig(nodeType.id, {
  properties: ['sku', 'name'],
  threshold: 0.9,
});

await client.enableDeduplication(nodeType.id);

// Create records
await client.createRecord({
  nodeTypeId: nodeType.id,
  properties: {
    sku: 'PROD-001',
    name: 'Widget A',
    price: 29.99,
    inStock: true,
  },
});

// Filter records
const { records } = await client.filterRecords({
  nodeTypeId: nodeType.id,
  filters: {
    logic: 'AND',
    filters: [
      { propertyName: 'price', operator: '>', value: 20 },
      { propertyName: 'inStock', operator: '=', value: true },
    ],
  },
  page: 1,
  pageSize: 20,
});

// Create relationship
const { relationshipType } = await client.createRelationshipType({
  name: 'BELONGS_TO',
  knowledgeHubId: 'hub-uuid',
  fromNodeId: nodeType.id,
  toNodeId: 'category-node-uuid',
  properties: [
    { name: 'since', dataType: 'DATE' },
  ],
});

// Update record with relationship
await client.updateRecord({
  nodeTypeId: nodeType.id,
  recordId: 1,
  properties: {
    price: 24.99,
  },
  relationships: [
    {
      operation: 'add',
      relationshipId: relationshipType.id,
      records: [
        {
          recordId: 10,
          relationshipProperties: {
            since: '2025-01-01',
          },
        },
      ],
    },
  ],
});
```

---

## Activepieces Integration

### Connection (`src/index.ts`)

```typescript
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';

export const graphAuth = PieceAuth.CustomAuth({
  props: {
    baseUrl: {
      displayName: 'Base URL',
      type: 'string',
      required: true,
    },
    apiKey: {
      displayName: 'API Key',
      type: 'string',
      required: true,
    },
    apiSecret: {
      displayName: 'API Secret',
      type: 'string',
      required: true,
    },
  },
  required: true,
});

export const graph = createPiece({
  displayName: 'Graph Database',
  auth: graphAuth,
  actions: [],
  triggers: [],
});
```

### Helper (`src/common/index.ts`)

```typescript
import { HttpMethod, httpClient } from '@activepieces/pieces-common';

export interface GraphAuth {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

export async function makeRequest<T>(
  auth: GraphAuth,
  method: HttpMethod,
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${auth.baseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await httpClient.sendRequest<T>({
    method,
    url: url.toString(),
    headers: {
      'x-api-key': auth.apiKey,
      'x-api-secret': auth.apiSecret,
      'Content-Type': 'application/json',
    },
    body,
  });

  return response.body;
}
```

### Action: Create Node Type (`src/lib/actions/create-node-type.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { graphAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const createNodeType = createAction({
  auth: graphAuth,
  name: 'create_node_type',
  displayName: 'Create Node Type',
  description: 'Create graph node type schema',
  props: {
    knowledgeHubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Node Type Name',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      required: false,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'Array of properties',
      required: false,
    }),
  },
  async run(context) {
    return await makeRequest(
      context.auth,
      HttpMethod.POST,
      '/api/graph-node-types',
      {
        knowledgeHubId: context.propsValue.knowledgeHubId,
        name: context.propsValue.name,
        description: context.propsValue.description,
        properties: context.propsValue.properties,
        status: 'PRODUCTION',
      }
    );
  },
});
```

### Action: Create Record (`src/lib/actions/create-record.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { graphAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const createRecord = createAction({
  auth: graphAuth,
  name: 'create_record',
  displayName: 'Create Record',
  description: 'Create graph node record',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      required: true,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'Record properties as JSON object',
      required: true,
    }),
    relationships: Property.Json({
      displayName: 'Relationships',
      description: 'Array of relationships',
      required: false,
    }),
  },
  async run(context) {
    return await makeRequest(
      context.auth,
      HttpMethod.POST,
      '/api/node-type-records',
      {
        nodeTypeId: context.propsValue.nodeTypeId,
        properties: context.propsValue.properties,
        relationships: context.propsValue.relationships,
      }
    );
  },
});
```

### Action: Filter Records (`src/lib/actions/filter-records.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { graphAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const filterRecords = createAction({
  auth: graphAuth,
  name: 'filter_records',
  displayName: 'Filter Records',
  description: 'Search records with complex filters',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      required: true,
    }),
    filters: Property.Json({
      displayName: 'Filters',
      description: 'Filter criteria',
      required: false,
    }),
    page: Property.Number({
      displayName: 'Page',
      required: false,
      defaultValue: 1,
    }),
    pageSize: Property.Number({
      displayName: 'Page Size',
      required: false,
      defaultValue: 10,
    }),
    includeRelationships: Property.Checkbox({
      displayName: 'Include Relationships',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    return await makeRequest(
      context.auth,
      HttpMethod.POST,
      '/api/node-type-records/filter',
      {
        nodeTypeId: context.propsValue.nodeTypeId,
        filters: context.propsValue.filters,
        page: context.propsValue.page,
        pageSize: context.propsValue.pageSize,
        includeRelationships: context.propsValue.includeRelationships,
      }
    );
  },
});
```

### Action: Trigger Deduplication (`src/lib/actions/trigger-deduplication.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { graphAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const triggerDeduplication = createAction({
  auth: graphAuth,
  name: 'trigger_deduplication',
  displayName: 'Trigger Deduplication',
  description: 'Run deduplication on node type',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      required: true,
    }),
    batchSize: Property.Number({
      displayName: 'Batch Size',
      required: false,
      defaultValue: 100,
    }),
    dryRun: Property.Checkbox({
      displayName: 'Dry Run',
      description: 'Test without removing duplicates',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    return await makeRequest(
      context.auth,
      HttpMethod.POST,
      `/api/graph-node-types/${context.propsValue.nodeTypeId}/deduplication/trigger`,
      {
        batchSize: context.propsValue.batchSize,
        dryRun: context.propsValue.dryRun,
      }
    );
  },
});
```
