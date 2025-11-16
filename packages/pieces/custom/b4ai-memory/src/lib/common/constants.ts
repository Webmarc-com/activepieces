// API Endpoints
export const API_ENDPOINTS = {
  // Node Types
  NODE_TYPES: '/graph-node-types',
  NODE_TYPE_BY_ID: (id: string) => `/graph-node-types/${id}`,
  NODE_TYPES_BULK: '/graph-node-types/bulk',

  // Node Properties
  NODE_PROPERTIES: '/graph-node-property',
  NODE_PROPERTY_BY_ID: (id: string) => `/graph-node-property/${id}`,
  NODE_PROPERTIES_BULK: '/graph-node-property/bulk',

  // Relationship Types
  RELATIONSHIP_TYPES: '/graph-relationship-type',
  RELATIONSHIP_TYPE_BY_ID: (id: string) => `/graph-relationship-type/${id}`,
  RELATIONSHIP_TYPES_BULK: '/graph-relationship-type/bulk',

  // Relationship Properties
  RELATIONSHIP_PROPERTIES: '/graph-relationship-property',
  RELATIONSHIP_PROPERTY_BY_ID: (id: string) => `/graph-relationship-property/${id}`,
  RELATIONSHIP_PROPERTIES_BULK: '/graph-relationship-property/bulk',

  // Records (Node operations)
  RECORDS: '/node-type-records',
  RECORDS_FILTER: '/node-type-records/filter',
  RECORDS_BULK: '/node-type-records/bulk',
  RECORDS_DEDUPLICATE: '/node-type-records/deduplicate',

  // Deduplication
  DEDUPLICATION_CONFIG: (nodeTypeId: string) => `/graph-node-types/${nodeTypeId}/deduplication`,
  DEDUPLICATION_ENABLE: (nodeTypeId: string) => `/graph-node-types/${nodeTypeId}/deduplication/enable`,
  DEDUPLICATION_DISABLE: (nodeTypeId: string) => `/graph-node-types/${nodeTypeId}/deduplication/disable`,
  DEDUPLICATION_TEST: (nodeTypeId: string) => `/graph-node-types/${nodeTypeId}/deduplication/test`,
  DEDUPLICATION_TRIGGER: (nodeTypeId: string) => `/graph-node-types/${nodeTypeId}/deduplication/trigger`,
  EMBEDDINGS_REGENERATE: (nodeTypeId: string) => `/graph-node-types/${nodeTypeId}/embeddings/regenerate`,

  // Dedup Rules
  DEDUP_RULES: '/dedup-rules',
  DEDUP_RULE_BY_ID: (ruleId: string) => `/dedup-rules/${ruleId}`,
  DEDUP_FIND: '/dedup-rules/find',
  DEDUP_RUN: (ruleId: string) => `/dedup-rules/${ruleId}/run`,
  DEDUP_MERGE: '/dedup-rules/merge',

  // Relationships (Records)
  RELATIONSHIPS: '/graph-relationships',
  RELATIONSHIP_BY_ID: (id: string) => `/graph-relationships/${id}`,
  RELATIONSHIPS_QUERY: '/graph-relationships/query',

  // Graph Ingestion (LLM-Optimized)
  GRAPH_INGEST: (knowledgeHubId: string) => `/graph/ingest/?knowledgeHubId=${knowledgeHubId}`,
} as const;

// Property Data Types for dropdown
export const PROPERTY_DATA_TYPES = [
  { label: 'String', value: 'STRING' },
  { label: 'Integer', value: 'INTEGER' },
  { label: 'Float', value: 'FLOAT' },
  { label: 'Boolean', value: 'BOOLEAN' },
  { label: 'Date', value: 'DATE' },
  { label: 'Local Time', value: 'LOCAL_TIME' },
  { label: 'Local Date Time', value: 'LOCAL_DATE_TIME' },
  { label: 'Zoned Date Time', value: 'ZONED_DATE_TIME' },
  { label: 'Duration', value: 'DURATION' },
  { label: 'List', value: 'LIST' },
  { label: 'Map', value: 'MAP' },
  { label: 'JSON', value: 'JSON' },
  { label: 'Long Text', value: 'LONG_TEXT' },
  { label: 'Enum', value: 'ENUM' },
  { label: 'Point', value: 'POINT' },
  { label: 'Link', value: 'LINK' },
  { label: 'File', value: 'FILE' },
  { label: 'Null', value: 'NULL' },
] as const;

// Filter Operators for dropdown
export const FILTER_OPERATORS = [
  { label: 'Equals (=)', value: '=' },
  { label: 'Not Equals (!=)', value: '!=' },
  { label: 'Not Equals (<>)', value: '<>' },
  { label: 'Greater Than (>)', value: '>' },
  { label: 'Less Than (<)', value: '<' },
  { label: 'Greater or Equal (>=)', value: '>=' },
  { label: 'Less or Equal (<=)', value: '<=' },
  { label: 'Contains', value: 'CONTAINS' },
  { label: 'Starts With', value: 'STARTS WITH' },
  { label: 'Ends With', value: 'ENDS WITH' },
  { label: 'In', value: 'IN' },
  { label: 'Not In', value: 'NOT IN' },
  { label: 'Is Null', value: 'IS NULL' },
  { label: 'Is Not Null', value: 'IS NOT NULL' },
] as const;
