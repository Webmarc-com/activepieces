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
    nodeId: Property.ShortText({
      displayName: 'Node ID',
      description: 'The ID (UUID) of the node to delete',
      required: true,
    }),
  },
  async run(context) {
    const { nodeId } = context.propsValue;

    await graphApiCall({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.NODE_BY_ID(nodeId),
      auth: context.auth as any,
    });

    return {
      success: true,
      message: `Node ${nodeId} and all its relationships deleted successfully`,
      warning: 'This action is irreversible.',
    };
  },
});
