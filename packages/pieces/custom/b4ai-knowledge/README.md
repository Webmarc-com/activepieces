# B4AI Knowledge Hub

Activepieces integration for managing B4AI Knowledge Hub - a graph-based knowledge management system with AI-powered schema generation.

## Overview

The B4AI Knowledge Hub piece enables you to manage knowledge hubs, synchronize graph schemas, and leverage LLM-generated metadata for your graph databases. Each knowledge hub consists of graph-based data structures with nodes, relationships, and properties.

## Features

### Knowledge Hub Management
- **List Knowledge Hubs** - View all knowledge hubs in your workspace
- **Get Knowledge Hub** - Retrieve a specific hub with its complete schema
- **Create Knowledge Hub** - Create a new hub with DRAFT and PRODUCTION instances
- **Update Knowledge Hub** - Modify hub name or description
- **Delete Knowledge Hub** - Permanently remove a hub and all its data

### Schema Management
- **Sync Schema** - Synchronize schema from Memgraph to PostgreSQL
- **Get Schema JSON** - Retrieve schema with LLM-generated metadata
- **Regenerate Metadata** - Trigger async regeneration of AI metadata

## Authentication

This piece requires three authentication parameters:

1. **Base URL**: Your B4AI server URL (e.g., `https://your-server.com`)
2. **API Key**: Your B4AI API key (x-api-key header)
3. **API Secret**: Your B4AI API secret (x-api-secret header)

### Getting Your Credentials

1. Log in to your B4AI platform
2. Navigate to **Settings** > **API Keys**
3. Generate a new API key pair
4. Copy both the **API Key** and **API Secret**
5. Note your server's base URL

## Actions

### CRUD Operations

#### List Knowledge Hubs
Get all knowledge hubs for your workspace.

**Parameters**: None

**Returns**: Array of knowledge hubs with id, name, description, and timestamps.

#### Get Knowledge Hub
Retrieve a specific knowledge hub with its complete schema including all node types, relationship types, and properties.

**Parameters**:
- `hubId` (required): UUID of the knowledge hub

**Returns**: Detailed knowledge hub object with schema structure.

#### Create Knowledge Hub
Create a new knowledge hub. This automatically creates both DRAFT and PRODUCTION Memgraph instances with a default "Entity" node type.

**Parameters**:
- `name` (required): Name of the knowledge hub
- `description` (optional): Description of the knowledge hub

**Returns**: Created knowledge hub object.

#### Update Knowledge Hub
Update the name or description of an existing knowledge hub.

**Parameters**:
- `hubId` (required): UUID of the knowledge hub
- `name` (optional): New name
- `description` (optional): New description

**Returns**: Updated knowledge hub object.

#### Delete Knowledge Hub
Permanently delete a knowledge hub and all associated data including schema, nodes, and relationships. This action is irreversible.

**Parameters**:
- `hubId` (required): UUID of the knowledge hub

**Returns**: Success message with warning about irreversibility.

### Schema Management Operations

#### Sync Schema
Synchronize the schema from Memgraph to PostgreSQL. This captures the current state of node types, relationship types, and their properties.

**Parameters**:
- `hubId` (required): UUID of the knowledge hub
- `generateMetadata` (optional): Whether to generate LLM metadata during sync (default: false)

**Returns**: Success message and metadata generation status.

#### Get Schema JSON
Retrieve the knowledge hub schema with LLM-generated metadata including descriptions, search patterns, query examples, and common mistakes.

**Parameters**:
- `hubId` (required): UUID of the knowledge hub

**Returns**: Schema structure and metadata object with sync status.

**Metadata Includes**:
- Schema Text (detailed and simplified versions)
- Schema Description
- Search Patterns
- Plan Examples
- Query Examples
- Common Mistakes
- Sync Status (`PENDING`, `SYNCING`, `SYNCED`, `ERROR`, `OUTDATED`)
- Last Synced Timestamp

#### Regenerate Metadata
Trigger asynchronous regeneration of LLM metadata for the schema. This is an async operation.

**Parameters**:
- `hubId` (required): UUID of the knowledge hub
- `mode` (required): `full` or `partial` regeneration
- `includeProduction` (optional): Also regenerate for production instance (default: false)

**Returns**: Sync status and timestamp.

**Note**: This is an async operation. Use "Get Schema JSON" to check completion status.

## Data Model

### Knowledge Hub
```typescript
{
  id: string;                    // UUID
  name: string;                  // Hub name
  description: string | null;    // Optional description
  workspaceId: string;           // Associated workspace
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
}
```

### Graph Schema Structure
Each knowledge hub contains:
- **Node Types**: Categories of entities (e.g., Person, Company, Product)
- **Relationship Types**: Connections between node types (e.g., WORKS_AT, OWNS)
- **Properties**: Attributes for nodes/relationships with data types

### Property Data Types
- `STRING` - Text values
- `INTEGER` - Whole numbers
- `FLOAT` - Decimal numbers
- `BOOLEAN` - True/false values
- `DATE` - Date values
- `DATETIME` - Date and time values
- `LIST` - Array of values
- `MAP` - Key-value pairs

## Usage Examples

### Example 1: Create and Configure a Knowledge Hub

```javascript
// Step 1: Create a new knowledge hub
const createResult = await createKnowledgeHub({
  name: "Company Knowledge Base",
  description: "Graph database for company entities and relationships"
});

const hubId = createResult.knowledgeHub.id;

// Step 2: Sync the schema
await syncSchema({
  hubId: hubId,
  generateMetadata: true
});

// Step 3: Get the schema with metadata
const schema = await getSchemaJson({
  hubId: hubId
});
```

### Example 2: Check Schema Sync Status

```javascript
// Get current schema and check sync status
const schemaData = await getSchemaJson({
  hubId: "your-hub-id"
});

console.log("Sync Status:", schemaData.metadata.syncStatus);
console.log("Last Synced:", schemaData.metadata.lastSyncedAt);

if (schemaData.metadata.syncStatus === 'OUTDATED') {
  // Regenerate metadata
  await regenerateMetadata({
    hubId: "your-hub-id",
    mode: "full",
    includeProduction: false
  });
}
```

### Example 3: List and Manage Hubs

```javascript
// List all knowledge hubs
const hubs = await listKnowledgeHubs();

console.log(`Found ${hubs.count} knowledge hubs`);

// Get details for each hub
for (const hub of hubs.knowledgeHubs) {
  const details = await getKnowledgeHub({
    hubId: hub.id
  });

  console.log(`Hub: ${details.knowledgeHub.name}`);
  console.log(`Node Types: ${details.knowledgeHub.nodeTypes.length}`);
  console.log(`Relationship Types: ${details.knowledgeHub.relationshipTypes.length}`);
}
```

## Error Handling

The piece provides detailed error messages for common scenarios:

- **400 Bad Request**: Invalid parameters (e.g., invalid UUID format)
- **401 Unauthorized**: Invalid API credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Knowledge hub doesn't exist
- **409 Conflict**: Knowledge hub name already exists
- **500 Server Error**: Internal server error

## Important Notes

1. **Deletion is Permanent**: Deleting a knowledge hub removes all data irreversibly
2. **Async Operations**: Metadata regeneration is asynchronous - poll with "Get Schema JSON"
3. **Dual Instances**: Each hub has DRAFT and PRODUCTION Memgraph instances
4. **Schema Sync**: Must sync schema after making changes in Memgraph
5. **Metadata Generation**: Optional but recommended for AI-powered features

## Version

Current version: 1.0.0 (Complete revamp from document-based to graph-based knowledge management)

## Support

For issues, questions, or feature requests, please contact the B4AI team or refer to the B4AI Knowledge Hub API documentation.
