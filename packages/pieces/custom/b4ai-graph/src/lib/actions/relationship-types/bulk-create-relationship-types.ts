import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkCreateResponse } from '../../common/types';

export const bulkCreateRelationshipTypes = createAction({
  auth: graphAuth,
  name: 'bulk_create_relationship_types',
  displayName: 'Bulk Create Relationship Types',
  description: 'Create multiple relationship types at once',
  props: {
    relationshipTypes: Property.Array({
      displayName: 'Relationship Types',
      description: 'Array of relationship type objects to create',
      required: true,
    }),
  },
  async run(context) {
    const { relationshipTypes } = context.propsValue;

    const response = await graphApiCall<BulkCreateResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RELATIONSHIP_TYPES_BULK,
      auth: context.auth as any,
      body: relationshipTypes,
    });

    return {
      success: true,
      created: response.created,
      errors: response.errors,
      message: `Successfully created ${response.created} relationship types${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
    };
  },
});
