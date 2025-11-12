import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkDeleteResponse } from '../../common/types';

export const bulkDeleteNodes = createAction({
  auth: graphAuth,
  name: 'bulk_delete_nodes',
  displayName: 'Bulk Delete Nodes',
  description: 'Delete multiple node records at once',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID (UUID) of the node type',
      required: true,
    }),
    recordIds: Property.Array({
      displayName: 'Record IDs',
      description: 'Array of numeric record IDs to delete',
      required: true,
    }),
  },
  async run(context) {
    const { nodeTypeId, recordIds } = context.propsValue;

    const response = await graphApiCall<BulkDeleteResponse>({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.RECORDS_BULK,
      auth: context.auth as any,
      body: { nodeTypeId, recordIds },
    });

    return {
      success: true,
      deleted: response.deleted,
      errors: response.errors,
      message: `Successfully deleted ${response.deleted} nodes${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
      warning: 'This action is irreversible. All associated relationships have been removed.',
    };
  },
});
