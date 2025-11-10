# Knowledge Hub API

**Base URL:** `/api/knowledge-hub`

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

Two types of API keys:
- **HMAC-based** (contains `.`): Self-contained, no DB lookup
- **Standard** (no `.`): DB-validated

---

## Endpoints

### GET `/`
List all knowledge hubs for authenticated workspace.

**Response:**
```typescript
{
  knowledgeHubs: Array<{
    id: string;
    name: string;
    description: string | null;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

---

### GET `/:id`
Get knowledge hub with schema.

**Response:**
```typescript
{
  knowledgeHub: {
    id: string;
    name: string;
    description: string | null;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    schema: {
      nodeTypes: Array<{
        id: string;
        name: string;
        description: string | null;
        properties: Array<{
          id: string;
          name: string;
          dataType: 'STRING' | 'INTEGER' | 'FLOAT' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'LIST' | 'MAP';
          required: boolean;
          unique: boolean;
          indexed: boolean;
          searchable: boolean;
        }>;
      }>;
      relationshipTypes: Array<{
        id: string;
        name: string;
        description: string | null;
        sourceNodeTypeId: string;
        targetNodeTypeId: string;
        properties: Array<{...}>; // Same as node properties
      }>;
    };
  };
}
```

---

### POST `/`
Create knowledge hub. Automatically creates DRAFT and PRODUCTION Memgraph instances with default "Entity" node type.

**Request:**
```typescript
{
  name: string; // required, min 1 char
  description?: string;
}
```

**Response:** Same as GET `/:id`

---

### PATCH `/:id`
Update knowledge hub name/description.

**Request:**
```typescript
{
  name?: string;
  description?: string;
}
```

**Response:** Same as GET `/:id`

---

### DELETE `/:id`
Delete knowledge hub and all related data (irreversible cascade delete).

**Response:**
```typescript
{
  success: true;
  message: string;
}
```

---

### POST `/:id/sync-schema`
Sync schema from Memgraph to PostgreSQL.

**Request:**
```typescript
{
  generateMetadata?: boolean; // default: false
}
```

- `false`: Quick sync, no LLM calls
- `true`: Full sync with LLM-generated metadata

**Response:**
```typescript
{
  success: true;
  message: string;
}
```

---

### GET `/:id/schema-json`
Get schema with LLM-generated metadata.

**Response:**
```typescript
{
  schema: {
    nodes: Array<{
      label: string;
      properties: Record<string, string>; // property name -> type
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
```

---

### POST `/:id/regenerate-metadata`
Regenerate LLM metadata (async fire-and-forget operation).

**Request:**
```typescript
{
  mode?: 'full' | 'partial'; // default: 'full'
  includeProduction?: boolean; // default: false
}
```

**Response:**
```typescript
{
  success: true;
  message: string;
  syncStatus: 'SYNCING';
  lastSyncedAt: string;
}
```

**Note:** Use GET `/:id/schema-json` to poll for completion.

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
| 401 | Unauthorized (invalid API credentials) |
| 404 | Resource not found |
| 500 | Internal server error |

---

## TypeScript Client

```typescript
interface KnowledgeHubAuth {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

class KnowledgeHubClient {
  constructor(private auth: KnowledgeHubAuth) {}

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(
      `${this.auth.baseUrl}/api/knowledge-hub${endpoint}`,
      {
        method,
        headers: {
          'x-api-key': this.auth.apiKey,
          'x-api-secret': this.auth.apiSecret,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async list() {
    return this.request<{ knowledgeHubs: KnowledgeHub[] }>('GET', '');
  }

  async get(id: string) {
    return this.request<{ knowledgeHub: KnowledgeHubDetailed }>('GET', `/${id}`);
  }

  async create(data: { name: string; description?: string }) {
    return this.request<{ knowledgeHub: KnowledgeHubDetailed }>('POST', '', data);
  }

  async update(id: string, data: { name?: string; description?: string }) {
    return this.request<{ knowledgeHub: KnowledgeHubDetailed }>('PATCH', `/${id}`, data);
  }

  async delete(id: string) {
    return this.request<{ success: true; message: string }>('DELETE', `/${id}`);
  }

  async syncSchema(id: string, generateMetadata = false) {
    return this.request<{ success: true; message: string }>(
      'POST',
      `/${id}/sync-schema`,
      { generateMetadata }
    );
  }

  async getSchemaJson(id: string) {
    return this.request<SchemaWithMetadata>('GET', `/${id}/schema-json`);
  }

  async regenerateMetadata(
    id: string,
    options: { mode?: 'full' | 'partial'; includeProduction?: boolean } = {}
  ) {
    return this.request<{
      success: true;
      message: string;
      syncStatus: string;
      lastSyncedAt: string;
    }>('POST', `/${id}/regenerate-metadata`, {
      mode: options.mode || 'full',
      includeProduction: options.includeProduction || false,
    });
  }

  async waitForMetadataSync(
    id: string,
    maxAttempts = 20,
    delayMs = 15000
  ): Promise<Metadata> {
    for (let i = 0; i < maxAttempts; i++) {
      const { metadata } = await this.getSchemaJson(id);

      if (metadata.syncStatus === 'SYNCED') return metadata;
      if (metadata.syncStatus === 'ERROR') {
        throw new Error('Metadata sync failed');
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error('Metadata sync timeout');
  }
}
```

---

## Type Definitions

```typescript
interface KnowledgeHub {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeHubDetailed extends KnowledgeHub {
  schema: {
    nodeTypes: GraphNodeType[];
    relationshipTypes: GraphRelationshipType[];
  };
}

interface GraphNodeType {
  id: string;
  name: string;
  description: string | null;
  properties: GraphProperty[];
  memgraphInstanceId: string;
  createdAt: string;
  updatedAt: string;
}

interface GraphRelationshipType {
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

interface GraphProperty {
  id: string;
  name: string;
  dataType: PropertyDataType;
  required: boolean;
  unique: boolean;
  indexed: boolean;
  searchable: boolean;
  description: string | null;
}

type PropertyDataType =
  | 'STRING'
  | 'INTEGER'
  | 'FLOAT'
  | 'BOOLEAN'
  | 'DATE'
  | 'DATETIME'
  | 'LIST'
  | 'MAP';

interface SchemaWithMetadata {
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
  metadata: Metadata;
}

interface Metadata {
  schemaTextDetailed: string | null;
  schemaTextSimplified: string | null;
  schemaDescription: string | null;
  searchPatterns: string | null;
  planExamples: string | null;
  queryExamples: string | null;
  commonMistakes: string | null;
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'OUTDATED';
  lastSyncedAt: string | null;
}
```

---

## Activepieces Integration

### Connection (`src/index.ts`)

```typescript
import { PieceAuth, createPiece } from '@activepieces/pieces-framework';

export const knowledgeHubAuth = PieceAuth.CustomAuth({
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

export const knowledgeHub = createPiece({
  displayName: 'Knowledge Hub',
  auth: knowledgeHubAuth,
  actions: [
    // Import and list actions here
  ],
  triggers: [],
});
```

### Helper (`src/common/index.ts`)

```typescript
import { HttpMethod, httpClient } from '@activepieces/pieces-common';

export interface KnowledgeHubAuth {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
}

export async function makeRequest<T>(
  auth: KnowledgeHubAuth,
  method: HttpMethod,
  endpoint: string,
  body?: unknown
): Promise<T> {
  const response = await httpClient.sendRequest<T>({
    method,
    url: `${auth.baseUrl}/api/knowledge-hub${endpoint}`,
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

### Action Example (`src/lib/actions/list-hubs.ts`)

```typescript
import { createAction } from '@activepieces/pieces-framework';
import { knowledgeHubAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const listKnowledgeHubs = createAction({
  auth: knowledgeHubAuth,
  name: 'list_knowledge_hubs',
  displayName: 'List Knowledge Hubs',
  description: 'Get all knowledge hubs for workspace',
  props: {},
  async run(context) {
    const response = await makeRequest<{
      knowledgeHubs: Array<{
        id: string;
        name: string;
        description: string | null;
        workspaceId: string;
        createdAt: string;
        updatedAt: string;
      }>;
    }>(context.auth, HttpMethod.GET, '');

    return response.knowledgeHubs;
  },
});
```

### Action Example (`src/lib/actions/create-hub.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { knowledgeHubAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const createKnowledgeHub = createAction({
  auth: knowledgeHubAuth,
  name: 'create_knowledge_hub',
  displayName: 'Create Knowledge Hub',
  description: 'Create new hub with DRAFT/PRODUCTION instances',
  props: {
    name: Property.ShortText({
      displayName: 'Name',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      required: false,
    }),
  },
  async run(context) {
    const response = await makeRequest<{
      knowledgeHub: {
        id: string;
        name: string;
        description: string | null;
        workspaceId: string;
        createdAt: string;
        updatedAt: string;
        schema: unknown;
      };
    }>(context.auth, HttpMethod.POST, '', {
      name: context.propsValue.name,
      description: context.propsValue.description || undefined,
    });

    return response.knowledgeHub;
  },
});
```

### Action Example (`src/lib/actions/get-hub.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { knowledgeHubAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const getKnowledgeHub = createAction({
  auth: knowledgeHubAuth,
  name: 'get_knowledge_hub',
  displayName: 'Get Knowledge Hub',
  description: 'Get hub with schema details',
  props: {
    hubId: Property.ShortText({
      displayName: 'Hub ID',
      description: 'UUID',
      required: true,
    }),
  },
  async run(context) {
    const response = await makeRequest<{
      knowledgeHub: {
        id: string;
        name: string;
        description: string | null;
        workspaceId: string;
        createdAt: string;
        updatedAt: string;
        schema: {
          nodeTypes: Array<unknown>;
          relationshipTypes: Array<unknown>;
        };
      };
    }>(context.auth, HttpMethod.GET, `/${context.propsValue.hubId}`);

    return response.knowledgeHub;
  },
});
```

### Action Example (`src/lib/actions/sync-schema.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { knowledgeHubAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const syncSchema = createAction({
  auth: knowledgeHubAuth,
  name: 'sync_schema',
  displayName: 'Sync Schema',
  description: 'Sync schema from Memgraph to PostgreSQL',
  props: {
    hubId: Property.ShortText({
      displayName: 'Hub ID',
      required: true,
    }),
    generateMetadata: Property.Checkbox({
      displayName: 'Generate Metadata',
      description: 'LLM-powered metadata (slower)',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    return await makeRequest<{
      success: boolean;
      message: string;
    }>(context.auth, HttpMethod.POST, `/${context.propsValue.hubId}/sync-schema`, {
      generateMetadata: context.propsValue.generateMetadata,
    });
  },
});
```

### Action Example (`src/lib/actions/delete-hub.ts`)

```typescript
import { createAction, Property } from '@activepieces/pieces-framework';
import { knowledgeHubAuth } from '../../index';
import { makeRequest } from '../../common';
import { HttpMethod } from '@activepieces/pieces-common';

export const deleteKnowledgeHub = createAction({
  auth: knowledgeHubAuth,
  name: 'delete_knowledge_hub',
  displayName: 'Delete Knowledge Hub',
  description: 'Delete hub and all data (irreversible)',
  props: {
    hubId: Property.ShortText({
      displayName: 'Hub ID',
      required: true,
    }),
  },
  async run(context) {
    return await makeRequest<{
      success: boolean;
      message: string;
    }>(context.auth, HttpMethod.DELETE, `/${context.propsValue.hubId}`);
  },
});
```

### Register Actions (`src/index.ts`)

```typescript
import { listKnowledgeHubs } from './lib/actions/list-hubs';
import { createKnowledgeHub } from './lib/actions/create-hub';
import { getKnowledgeHub } from './lib/actions/get-hub';
import { syncSchema } from './lib/actions/sync-schema';
import { deleteKnowledgeHub } from './lib/actions/delete-hub';

export const knowledgeHub = createPiece({
  // ...
  actions: [
    listKnowledgeHubs,
    createKnowledgeHub,
    getKnowledgeHub,
    syncSchema,
    deleteKnowledgeHub,
  ],
});
```

---

## Usage Example

```typescript
const client = new KnowledgeHubClient({
  baseUrl: 'https://api.yourdomain.com',
  apiKey: process.env.API_KEY!,
  apiSecret: process.env.API_SECRET!,
});

// Create hub
const { knowledgeHub } = await client.create({
  name: 'Product Graph',
  description: 'Product catalog and inventory',
});

// Get with schema
const { knowledgeHub: hub } = await client.get(knowledgeHub.id);
console.log(hub.schema.nodeTypes);

// Sync schema with metadata
await client.syncSchema(knowledgeHub.id, true);

// Get schema JSON
const { schema, metadata } = await client.getSchemaJson(knowledgeHub.id);

// Regenerate metadata (async)
await client.regenerateMetadata(knowledgeHub.id, {
  mode: 'full',
  includeProduction: false,
});

// Wait for completion
const completedMetadata = await client.waitForMetadataSync(knowledgeHub.id);

// Update
await client.update(knowledgeHub.id, {
  description: 'Updated description',
});

// Delete
await client.delete(knowledgeHub.id);
```
