import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';

// NOTE: This action needs refactoring. According to GRAPH_API.md, relationships are managed
// through the node-type-records API, not via separate /relationships endpoints.
// Relationships should be removed via PUT /api/node-type-records with operation: 'remove'.
export const deleteRelationship = createAction({
  auth: graphAuth,
  name: 'delete_relationship',
  displayName: 'Delete Relationship',
  description: 'Delete a relationship between two nodes',
  props: {
    relationshipId: Property.ShortText({
      displayName: 'Relationship ID',
      description: 'The ID (UUID) of the relationship to delete',
      required: true,
    }),
  },
  async run(context) {
    const { relationshipId } = context.propsValue;

    await graphApiCall({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.RELATIONSHIP_BY_ID(relationshipId),
      auth: context.auth as any,
    });

    return {
      success: true,
      message: `Relationship ${relationshipId} deleted successfully`,
      warning: 'This action is irreversible.',
    };
  },
});
