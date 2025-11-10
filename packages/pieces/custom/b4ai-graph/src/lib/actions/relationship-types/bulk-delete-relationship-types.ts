import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkDeleteResponse } from '../../common/types';

export const bulkDeleteRelationshipTypes = createAction({
  auth: graphAuth,
  name: 'bulk_delete_relationship_types',
  displayName: 'Bulk Delete Relationship Types',
  description: 'Delete multiple relationship types at once',
  props: {
    relationshipTypeIds: Property.Array({
      displayName: 'Relationship Type IDs',
      description: 'Array of relationship type IDs (UUIDs) to delete',
      required: true,
    }),
  },
  async run(context) {
    const { relationshipTypeIds } = context.propsValue;

    const response = await graphApiCall<BulkDeleteResponse>({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.RELATIONSHIP_TYPES_BULK,
      auth: context.auth as any,
      body: { ids: relationshipTypeIds },
    });

    return {
      success: true,
      deleted: response.deleted,
      errors: response.errors,
      message: `Successfully deleted ${response.deleted} relationship types${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
      warning: 'This action is irreversible. All associated properties and records have been removed.',
    };
  },
});
