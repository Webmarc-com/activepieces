import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationship, CreateRelationshipRequest } from '../../common/types';

// NOTE: This action needs refactoring. According to GRAPH_API.md, relationships are managed
// through the node-type-records API, not via separate /relationships endpoints.
// Relationships should be added/removed via PUT /api/node-type-records with relationship operations.
export const createRelationship = createAction({
  auth: graphAuth,
  name: 'create_relationship',
  displayName: 'Create Relationship',
  description: 'Create a relationship between two nodes',
  props: {
    relationshipTypeId: Property.ShortText({
      displayName: 'Relationship Type ID',
      description: 'The ID of the relationship type',
      required: true,
    }),
    sourceNodeId: Property.ShortText({
      displayName: 'Source Node ID',
      description: 'The ID of the source node',
      required: true,
    }),
    targetNodeId: Property.ShortText({
      displayName: 'Target Node ID',
      description: 'The ID of the target node',
      required: true,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'JSON object with property names and values (optional)',
      required: false,
    }),
  },
  async run(context) {
    const { relationshipTypeId, sourceNodeId, targetNodeId, properties } = context.propsValue;

    const body: CreateRelationshipRequest = {
      relationshipTypeId,
      sourceNodeId,
      targetNodeId,
    };

    if (properties) body.properties = properties;

    const response = await graphApiCall<GraphRelationship>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RELATIONSHIPS,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      relationship: response,
      message: 'Relationship created successfully',
    };
  },
});
