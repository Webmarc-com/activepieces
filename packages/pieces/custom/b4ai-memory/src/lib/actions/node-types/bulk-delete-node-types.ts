import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkDeleteResponse } from '../../common/types';

export const bulkDeleteNodeTypes = createAction({
  auth: graphAuth,
  name: 'bulk_delete_node_types',
  displayName: 'Bulk Delete Node Types',
  description: 'Delete multiple node types at once',
  props: {
    nodeTypeIds: Property.Array({
      displayName: 'Node Type IDs',
      description: 'Array of node type IDs (UUIDs) to delete',
      required: true,
    }),
  },
  async run(context) {
    const { nodeTypeIds } = context.propsValue;

    const response = await graphApiCall<BulkDeleteResponse>({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.NODE_TYPES_BULK,
      auth: context.auth as any,
      body: { ids: nodeTypeIds },
    });

    return {
      success: true,
      deleted: response.deleted,
      errors: response.errors,
      message: `Successfully deleted ${response.deleted} node types${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
      warning: 'This action is irreversible. All associated properties and records have been removed.',
    };
  },
});
