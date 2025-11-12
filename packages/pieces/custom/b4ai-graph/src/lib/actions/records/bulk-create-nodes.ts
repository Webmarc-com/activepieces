import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkCreateResponse } from '../../common/types';

export const bulkCreateNodes = createAction({
  auth: graphAuth,
  name: 'bulk_create_nodes',
  displayName: 'Bulk Create Nodes',
  description: 'Create multiple node records at once',
  props: {
    nodes: Property.Array({
      displayName: 'Nodes',
      description: 'Array of node objects to create. Each object should contain: nodeTypeId (string), properties (object), and optionally relationships (array)',
      required: true,
    }),
  },
  async run(context) {
    const { nodes } = context.propsValue;

    const response = await graphApiCall<BulkCreateResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RECORDS_BULK,
      auth: context.auth as any,
      body: { records: nodes },
    });

    return {
      success: true,
      created: response.created,
      errors: response.errors,
      message: `Successfully created ${response.created} nodes${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
    };
  },
});
