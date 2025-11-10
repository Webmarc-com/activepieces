import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkCreateResponse } from '../../common/types';

export const bulkCreateRelationshipProperties = createAction({
  auth: graphAuth,
  name: 'bulk_create_relationship_properties',
  displayName: 'Bulk Create Relationship Properties',
  description: 'Create multiple relationship properties at once',
  props: {
    properties: Property.Array({
      displayName: 'Properties',
      description: 'Array of property objects to create',
      required: true,
    }),
  },
  async run(context) {
    const { properties } = context.propsValue;

    const response = await graphApiCall<BulkCreateResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RELATIONSHIP_PROPERTIES_BULK,
      auth: context.auth as any,
      body: properties,
    });

    return {
      success: true,
      created: response.created,
      errors: response.errors,
      message: `Successfully created ${response.created} relationship properties${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
    };
  },
});
