import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkDeleteResponse } from '../../common/types';

export const bulkDeleteNodeProperties = createAction({
  auth: graphAuth,
  name: 'bulk_delete_node_properties',
  displayName: 'Bulk Delete Node Properties',
  description: 'Delete multiple node properties at once',
  props: {
    propertyIds: Property.Array({
      displayName: 'Property IDs',
      description: 'Array of property IDs (UUIDs) to delete',
      required: true,
    }),
  },
  async run(context) {
    const { propertyIds } = context.propsValue;

    const response = await graphApiCall<BulkDeleteResponse>({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.NODE_PROPERTIES_BULK,
      auth: context.auth as any,
      body: { ids: propertyIds },
    });

    return {
      success: true,
      deleted: response.deleted,
      errors: response.errors,
      message: `Successfully deleted ${response.deleted} node properties${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
      warning: 'This action is irreversible. All associated data has been removed.',
    };
  },
});
