import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkUpdateResponse } from '../../common/types';

export const bulkUpdateRelationshipProperties = createAction({
  auth: graphAuth,
  name: 'bulk_update_relationship_properties',
  displayName: 'Bulk Update Relationship Properties',
  description: 'Update multiple relationship properties at once',
  props: {
    updates: Property.Array({
      displayName: 'Updates',
      description: 'Array of update objects (each with id and fields to update)',
      required: true,
    }),
  },
  async run(context) {
    const { updates } = context.propsValue;

    const response = await graphApiCall<BulkUpdateResponse>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.RELATIONSHIP_PROPERTIES_BULK,
      auth: context.auth as any,
      body: updates,
    });

    return {
      success: true,
      updated: response.updated,
      errors: response.errors,
      message: `Successfully updated ${response.updated} relationship properties${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
    };
  },
});
