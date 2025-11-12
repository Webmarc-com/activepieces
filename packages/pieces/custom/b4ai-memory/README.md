# B4AI Graph Database

Activepieces integration for the B4AI Graph Database API - a schema-first graph database system for managing complex, interconnected data with powerful deduplication capabilities.

## Overview

This piece provides comprehensive actions for working with the B4AI Graph Database, including:

- **Schema Management**: Define and manage node types, relationship types, and their properties
- **Record Management**: Create, query, update, and delete nodes and relationships
- **Advanced Filtering**: Query records with complex filters, sorting, and pagination
- **Intelligent Deduplication**: Find and merge duplicate records with configurable rules
- **Bulk Operations**: Perform create, update, and delete operations in bulk for efficiency

## Authentication

Requires dual authentication credentials:

- **Base URL**: Your B4AI Graph API endpoint
- **API Key**: Your B4AI API key (x-api-key header)
- **API Secret**: Your B4AI API secret (x-api-secret header)

You can obtain these credentials from your B4AI dashboard.

## Actions

### Node Type Management (8 actions)

Define the schema for your graph nodes:

- **List Node Types**: List all node types with pagination
- **Get Node Type**: Get details of a specific node type
- **Create Node Type**: Create a new node type with schema definition
- **Update Node Type**: Update an existing node type
- **Delete Node Type**: Delete a node type and all associated data
- **Bulk Create Node Types**: Create multiple node types at once
- **Bulk Update Node Types**: Update multiple node types at once
- **Bulk Delete Node Types**: Delete multiple node types at once

### Node Property Management (8 actions)

Define properties for node types with validation:

- **List Node Properties**: List all node properties with filtering
- **Get Node Property**: Get details of a specific property
- **Create Node Property**: Create a new property with data type and validation
- **Update Node Property**: Update property configuration
- **Delete Node Property**: Delete a property
- **Bulk Create Node Properties**: Create multiple properties at once
- **Bulk Update Node Properties**: Update multiple properties at once
- **Bulk Delete Node Properties**: Delete multiple properties at once

**Supported Data Types**: STRING, INTEGER, FLOAT, BOOLEAN, DATE, DATETIME, TIME, URL, EMAIL, PHONE, JSON, TEXT, CURRENCY, PERCENTAGE, LOCATION, REFERENCE

### Relationship Type Management (8 actions)

Define relationship types between node types:

- **List Relationship Types**: List all relationship types
- **Get Relationship Type**: Get details of a specific relationship type
- **Create Relationship Type**: Create a new relationship type between node types
- **Update Relationship Type**: Update relationship configuration
- **Delete Relationship Type**: Delete a relationship type and all instances
- **Bulk Create Relationship Types**: Create multiple relationship types at once
- **Bulk Update Relationship Types**: Update multiple relationship types at once
- **Bulk Delete Relationship Types**: Delete multiple relationship types at once

### Relationship Property Management (8 actions)

Define properties for relationship types:

- **List Relationship Properties**: List all relationship properties
- **Get Relationship Property**: Get details of a specific property
- **Create Relationship Property**: Create a new property for relationships
- **Update Relationship Property**: Update property configuration
- **Delete Relationship Property**: Delete a property
- **Bulk Create Relationship Properties**: Create multiple properties at once
- **Bulk Update Relationship Properties**: Update multiple properties at once
- **Bulk Delete Relationship Properties**: Delete multiple properties at once

### Record Management (9 actions)

Work with actual node and relationship data:

- **Query Nodes**: Query nodes with advanced filtering, sorting, and pagination
- **Get Node**: Get a specific node by ID
- **Create Node**: Create a new node with properties
- **Update Node**: Update a node's properties
- **Delete Node**: Delete a node and all its relationships
- **Create Relationship**: Create a relationship between two nodes
- **Update Relationship**: Update a relationship's properties
- **Delete Relationship**: Delete a relationship
- **Query Relationships**: Query relationships with advanced filtering

### Deduplication (7 actions)

Intelligently find and merge duplicate records:

- **Find Duplicates**: Find potential duplicate nodes based on matching criteria
- **Merge Nodes**: Merge multiple duplicate nodes into a single node
- **Create Deduplication Rule**: Create an automatic deduplication rule
- **List Deduplication Rules**: List all deduplication rules
- **Update Deduplication Rule**: Update a deduplication rule
- **Delete Deduplication Rule**: Delete a deduplication rule
- **Run Deduplication Rule**: Execute a deduplication rule

**Merge Strategies**:
- `prefer_first`: Use values from the master node
- `prefer_non_empty`: Use non-empty values
- `prefer_latest`: Use values from most recently updated node
- `concatenate`: Combine values from all nodes

## Usage Examples

### 1. Define a Schema

First, create a node type and its properties:

```
1. Create Node Type: "Person"
2. Create Node Property: "name" (STRING, required)
3. Create Node Property: "email" (EMAIL, unique, indexed)
4. Create Node Property: "age" (INTEGER)
```

### 2. Create Relationships

Define how nodes relate to each other:

```
1. Create Relationship Type: "WORKS_FOR" (Person -> Company)
2. Create Relationship Property: "since" (DATE)
3. Create Relationship Property: "position" (STRING)
```

### 3. Add Data

Create nodes and relationships:

```
1. Create Node: Person with { name: "John Doe", email: "john@example.com" }
2. Create Node: Person with { name: "Jane Smith", email: "jane@example.com" }
3. Create Relationship: John WORKS_FOR Company since 2020
```

### 4. Query Data

Use advanced filtering to find records:

```
Query Nodes:
- nodeTypeId: <Person-type-id>
- filters: [{ field: "age", operator: "gt", value: 25 }]
- sortBy: "name"
- sortOrder: "asc"
```

### 5. Deduplication

Find and merge duplicates:

```
1. Find Duplicates: Using matchFields ["email"]
2. Review duplicate groups
3. Merge Nodes: Select nodes to merge with strategy "prefer_non_empty"
```

## Filter Operators

When querying nodes and relationships, the following operators are supported:

- `eq`: Equal to
- `ne`: Not equal to
- `gt`: Greater than
- `gte`: Greater than or equal to
- `lt`: Less than
- `lte`: Less than or equal to
- `in`: In array
- `nin`: Not in array
- `contains`: Contains substring
- `startsWith`: Starts with
- `endsWith`: Ends with
- `exists`: Field exists

## Best Practices

1. **Schema First**: Always define your schema (node types and properties) before creating records
2. **Use Indexes**: Create indexes on frequently queried properties for better performance
3. **Validate Data**: Use validation rules on properties to ensure data quality
4. **Deduplication Rules**: Set up automatic deduplication rules to maintain data integrity
5. **Bulk Operations**: Use bulk actions for creating/updating multiple records efficiently
6. **Pagination**: Always use pagination when querying large datasets

## Version History

### 2.0.0 (Latest)
- Complete rewrite to match GRAPH_API specification
- Added schema-first approach with node types and relationship types
- Added property management with 16 data types
- Added advanced filtering and querying
- Added intelligent deduplication system
- Added bulk operations for all entity types
- Total of 48 actions

### 1.0.0
- Initial release with basic graph operations

## Support

For issues, questions, or feature requests, please contact the B4AI Team or refer to the API documentation.
