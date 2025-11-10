import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkCreateResponse } from '../../common/types';

export const bulkCreateNodeTypes = createAction({
  auth: graphAuth,
  name: 'bulk_create_node_types',
  displayName: 'Bulk Create Node Types',
  description: 'Create multiple node types at once',
  props: {
    nodeTypes: Property.Array({
      displayName: 'Node Types',
      description: 'Array of node type objects to create',
      required: true,
    }),
  },
  async run(context) {
    const { nodeTypes } = context.propsValue;

    const response = await graphApiCall<BulkCreateResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.NODE_TYPES_BULK,
      auth: context.auth as any,
      body: nodeTypes,
    });

    return {
      success: true,
      created: response.created,
      errors: response.errors,
      message: `Successfully created ${response.created} node types${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
    };
  },
});
