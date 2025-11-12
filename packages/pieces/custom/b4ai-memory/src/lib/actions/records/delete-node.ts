import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';

export const deleteNode = createAction({
  auth: graphAuth,
  name: 'delete_node',
  displayName: 'Delete Node',
  description: 'Delete a node and all its relationships',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID (UUID) of the node type',
      required: true,
    }),
    recordId: Property.Number({
      displayName: 'Record ID',
      description: 'The numeric ID of the node record to delete',
      required: true,
    }),
  },
  async run(context) {
    const { nodeTypeId, recordId } = context.propsValue;

    await graphApiCall({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.RECORDS,
      auth: context.auth as any,
      body: {
        nodeTypeId,
        recordId,
      },
    });

    return {
      success: true,
      message: `Node record ${recordId} and all its relationships deleted successfully`,
      warning: 'This action is irreversible.',
    };
  },
});
