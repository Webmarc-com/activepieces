import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphIngestRequest, GraphIngestResponse } from '../../common/types';

export const ingestGraphData = createAction({
  auth: graphAuth,
  name: 'ingest_graph_data',
  displayName: 'Ingest Graph Data (LLM-Optimized)',
  description: 'Simplified bulk ingestion of nodes and relationships using human-readable type names and temporary IDs. Designed for LLM-generated content with two-phase processing (nodes first, then relationships) and detailed error reporting.',
  props: {
    knowledgeHubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'The ID of the knowledge hub to ingest data into',
      required: true,
    }),
    nodes: Property.Json({
      displayName: 'Nodes',
      description: 'Array of nodes to create. Each node should have: type (human-readable name), id (temporary ID), and properties. Example: [{ "type": "Consultant", "id": "maria", "properties": { "Name": "Maria Barbul", "Email": "maria@example.com" } }]',
      required: true,
    }),
    relationships: Property.Json({
      displayName: 'Relationships',
      description: 'Optional array of relationships to create. Each relationship should have: type (human-readable name), from (temp ID), to (temp ID), and optional properties. Example: [{ "type": "WORKED_AT", "from": "maria", "to": "horvath", "properties": { "Role": "Managing Consultant" } }]',
      required: false,
    }),
    enableDeduplication: Property.Checkbox({
      displayName: 'Enable Deduplication',
      description: 'Enable automatic deduplication during ingestion',
      required: false,
      defaultValue: false,
    }),
    returnCreatedIds: Property.Checkbox({
      displayName: 'Return Created IDs',
      description: 'Include database IDs of created nodes and relationships in the response',
      required: false,
      defaultValue: true,
    }),
  },
  async run(context) {
    const { knowledgeHubId, nodes, relationships, enableDeduplication, returnCreatedIds } = context.propsValue;

    // Validate nodes array
    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error('Nodes must be a non-empty array');
    }

    // Validate that each node has required fields
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.type || typeof node.type !== 'string') {
        throw new Error(`Node at index ${i} is missing required field "type" (human-readable type name)`);
      }
      if (!node.id || typeof node.id !== 'string') {
        throw new Error(`Node at index ${i} is missing required field "id" (temporary ID)`);
      }
      if (!node.properties || typeof node.properties !== 'object') {
        throw new Error(`Node at index ${i} is missing required field "properties" (object)`);
      }
    }

    // Validate relationships array if provided
    if (relationships) {
      if (!Array.isArray(relationships)) {
        throw new Error('Relationships must be an array');
      }

      for (let i = 0; i < relationships.length; i++) {
        const rel = relationships[i];
        if (!rel.type || typeof rel.type !== 'string') {
          throw new Error(`Relationship at index ${i} is missing required field "type" (human-readable type name)`);
        }
        if (!rel.from || typeof rel.from !== 'string') {
          throw new Error(`Relationship at index ${i} is missing required field "from" (temporary ID)`);
        }
        if (!rel.to || typeof rel.to !== 'string') {
          throw new Error(`Relationship at index ${i} is missing required field "to" (temporary ID)`);
        }
      }
    }

    // Build request body
    const body: GraphIngestRequest = {
      nodes,
      ...(relationships && relationships.length > 0 && { relationships }),
      options: {
        enableDeduplication: enableDeduplication || false,
        returnCreatedIds: returnCreatedIds !== false, // Default to true
      },
    };

    // Make API call
    const response = await graphApiCall<GraphIngestResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.GRAPH_INGEST(knowledgeHubId),
      auth: context.auth as any,
      body,
    });

    // Return detailed response
    return {
      success: true,
      ...response,
      message: `Successfully ingested ${response.summary.nodesCreated} nodes and ${response.summary.relationshipsCreated} relationships${response.summary.totalErrors > 0 ? ` (${response.summary.totalErrors} errors)` : ''}`,
    };
  },
});
