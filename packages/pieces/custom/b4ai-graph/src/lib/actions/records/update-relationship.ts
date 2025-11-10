import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationship, UpdateRelationshipRequest } from '../../common/types';

export const updateRelationship = createAction({
  auth: graphAuth,
  name: 'update_relationship',
  displayName: 'Update Relationship',
  description: 'Update a relationship\'s properties',
  props: {
    relationshipId: Property.ShortText({
      displayName: 'Relationship ID',
      description: 'The ID (UUID) of the relationship to update',
      required: true,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'JSON object with property names and new values',
      required: true,
    }),
  },
  async run(context) {
    const { relationshipId, properties } = context.propsValue;

    const body: UpdateRelationshipRequest = {
      properties,
    };

    const response = await graphApiCall<GraphRelationship>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.RELATIONSHIP_BY_ID(relationshipId),
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      relationship: response,
      message: 'Relationship updated successfully',
    };
  },
});
