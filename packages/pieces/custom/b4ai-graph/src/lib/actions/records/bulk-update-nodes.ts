import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkUpdateResponse } from '../../common/types';

export const bulkUpdateNodes = createAction({
  auth: graphAuth,
  name: 'bulk_update_nodes',
  displayName: 'Bulk Update Nodes',
  description: 'Update multiple node records at once',
  props: {
    updates: Property.Array({
      displayName: 'Updates',
      description: 'Array of update objects. Each object should contain: nodeTypeId (string), recordId (number), properties (object), and optionally relationships (array)',
      required: true,
    }),
  },
  async run(context) {
    const { updates } = context.propsValue;

    const response = await graphApiCall<BulkUpdateResponse>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.RECORDS_BULK,
      auth: context.auth as any,
      body: { records: updates },
    });

    return {
      success: true,
      updated: response.updated,
      errors: response.errors,
      message: `Successfully updated ${response.updated} nodes${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
    };
  },
});
