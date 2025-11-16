import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { graphAuth } from './lib/common/auth';

// Node Type Management
import { listNodeTypes } from './lib/actions/node-types/list-node-types';
import { getNodeType } from './lib/actions/node-types/get-node-type';
import { createNodeType } from './lib/actions/node-types/create-node-type';
import { updateNodeType } from './lib/actions/node-types/update-node-type';
import { deleteNodeType } from './lib/actions/node-types/delete-node-type';
import { bulkCreateNodeTypes } from './lib/actions/node-types/bulk-create-node-types';
import { bulkUpdateNodeTypes } from './lib/actions/node-types/bulk-update-node-types';
import { bulkDeleteNodeTypes } from './lib/actions/node-types/bulk-delete-node-types';

// Node Property Management
import { listNodeProperties } from './lib/actions/node-properties/list-node-properties';
import { getNodeProperty } from './lib/actions/node-properties/get-node-property';
import { createNodeProperty } from './lib/actions/node-properties/create-node-property';
import { updateNodeProperty } from './lib/actions/node-properties/update-node-property';
import { deleteNodeProperty } from './lib/actions/node-properties/delete-node-property';
import { bulkCreateNodeProperties } from './lib/actions/node-properties/bulk-create-node-properties';
import { bulkUpdateNodeProperties } from './lib/actions/node-properties/bulk-update-node-properties';
import { bulkDeleteNodeProperties } from './lib/actions/node-properties/bulk-delete-node-properties';

// Relationship Type Management
import { listRelationshipTypes } from './lib/actions/relationship-types/list-relationship-types';
import { getRelationshipType } from './lib/actions/relationship-types/get-relationship-type';
import { createRelationshipType } from './lib/actions/relationship-types/create-relationship-type';
import { updateRelationshipType } from './lib/actions/relationship-types/update-relationship-type';
import { deleteRelationshipType } from './lib/actions/relationship-types/delete-relationship-type';
import { bulkCreateRelationshipTypes } from './lib/actions/relationship-types/bulk-create-relationship-types';
import { bulkUpdateRelationshipTypes } from './lib/actions/relationship-types/bulk-update-relationship-types';
import { bulkDeleteRelationshipTypes } from './lib/actions/relationship-types/bulk-delete-relationship-types';

// Relationship Property Management
import { listRelationshipProperties } from './lib/actions/relationship-properties/list-relationship-properties';
import { getRelationshipProperty } from './lib/actions/relationship-properties/get-relationship-property';
import { createRelationshipProperty } from './lib/actions/relationship-properties/create-relationship-property';
import { updateRelationshipProperty } from './lib/actions/relationship-properties/update-relationship-property';
import { deleteRelationshipProperty } from './lib/actions/relationship-properties/delete-relationship-property';
import { bulkCreateRelationshipProperties } from './lib/actions/relationship-properties/bulk-create-relationship-properties';
import { bulkUpdateRelationshipProperties } from './lib/actions/relationship-properties/bulk-update-relationship-properties';
import { bulkDeleteRelationshipProperties } from './lib/actions/relationship-properties/bulk-delete-relationship-properties';

// Record Management
import { queryNodes } from './lib/actions/records/query-nodes';
import { getNode } from './lib/actions/records/get-node';
import { createNode } from './lib/actions/records/create-node';
import { updateNode } from './lib/actions/records/update-node';
import { deleteNode } from './lib/actions/records/delete-node';
import { createRelationship } from './lib/actions/records/create-relationship';
import { updateRelationship } from './lib/actions/records/update-relationship';
import { deleteRelationship } from './lib/actions/records/delete-relationship';
import { queryRelationships } from './lib/actions/records/query-relationships';
import { bulkCreateNodes } from './lib/actions/records/bulk-create-nodes';
import { bulkUpdateNodes } from './lib/actions/records/bulk-update-nodes';
import { bulkDeleteNodes } from './lib/actions/records/bulk-delete-nodes';

// Deduplication
import { findDuplicates } from './lib/actions/deduplication/find-duplicates';
import { mergeNodes } from './lib/actions/deduplication/merge-nodes';
import { createDedupRule } from './lib/actions/deduplication/create-dedup-rule';
import { listDedupRules } from './lib/actions/deduplication/list-dedup-rules';
import { updateDedupRule } from './lib/actions/deduplication/update-dedup-rule';
import { deleteDedupRule } from './lib/actions/deduplication/delete-dedup-rule';
import { runDedupRule } from './lib/actions/deduplication/run-dedup-rule';

// Graph Ingestion
import { ingestGraphData } from './lib/actions/ingestion/ingest-graph-data';

export const b4aiMemory = createPiece({
  displayName: 'B4AI Memory',
  description: 'Schema-first graph database for managing nodes, relationships, and intelligent deduplication',
  auth: graphAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://storage.googleapis.com/surfsite-public/logo_black.png',
  authors: ['B4AI Team'],
  categories: [PieceCategory.BUSINESS_INTELLIGENCE, PieceCategory.DEVELOPER_TOOLS],
  actions: [
    // Node Type Management (8)
    listNodeTypes,
    getNodeType,
    createNodeType,
    updateNodeType,
    deleteNodeType,
    bulkCreateNodeTypes,
    bulkUpdateNodeTypes,
    bulkDeleteNodeTypes,

    // Node Property Management (8)
    listNodeProperties,
    getNodeProperty,
    createNodeProperty,
    updateNodeProperty,
    deleteNodeProperty,
    bulkCreateNodeProperties,
    bulkUpdateNodeProperties,
    bulkDeleteNodeProperties,

    // Relationship Type Management (8)
    listRelationshipTypes,
    getRelationshipType,
    createRelationshipType,
    updateRelationshipType,
    deleteRelationshipType,
    bulkCreateRelationshipTypes,
    bulkUpdateRelationshipTypes,
    bulkDeleteRelationshipTypes,

    // Relationship Property Management (8)
    listRelationshipProperties,
    getRelationshipProperty,
    createRelationshipProperty,
    updateRelationshipProperty,
    deleteRelationshipProperty,
    bulkCreateRelationshipProperties,
    bulkUpdateRelationshipProperties,
    bulkDeleteRelationshipProperties,

    // Record Management (12)
    queryNodes,
    getNode,
    createNode,
    updateNode,
    deleteNode,
    bulkCreateNodes,
    bulkUpdateNodes,
    bulkDeleteNodes,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    queryRelationships,

    // Deduplication (7)
    findDuplicates,
    mergeNodes,
    createDedupRule,
    listDedupRules,
    updateDedupRule,
    deleteDedupRule,
    runDedupRule,

    // Graph Ingestion (1)
    ingestGraphData,

    // Custom API Call
    createCustomApiCallAction({
      baseUrl: () => '', // Will use auth.baseUrl
      auth: graphAuth,
      authMapping: async (auth: any) => ({
        'x-api-key': auth.apiKey,
        'x-api-secret': auth.apiSecret,
      }),
    }),
  ],
  triggers: [],
});
