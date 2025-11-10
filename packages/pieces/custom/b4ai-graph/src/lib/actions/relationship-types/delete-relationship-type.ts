import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';

export const deleteRelationshipType = createAction({
  auth: graphAuth,
  name: 'delete_relationship_type',
  displayName: 'Delete Relationship Type',
  description: 'Delete a relationship type (will also delete all associated properties and records)',
  props: {
    relationshipTypeId: Property.ShortText({
      displayName: 'Relationship Type ID',
      description: 'The ID (UUID) of the relationship type to delete',
      required: true,
    }),
  },
  async run(context) {
    const { relationshipTypeId } = context.propsValue;

    await graphApiCall({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.RELATIONSHIP_TYPE_BY_ID(relationshipTypeId),
      auth: context.auth as any,
    });

    return {
      success: true,
      message: `Relationship type ${relationshipTypeId} and all associated data deleted successfully`,
      warning: 'This action is irreversible. All properties and records have been removed.',
    };
  },
});
