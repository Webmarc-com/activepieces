import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';

export const deleteNodeType = createAction({
  auth: graphAuth,
  name: 'delete_node_type',
  displayName: 'Delete Node Type',
  description: 'Delete a node type (will also delete all associated properties and records)',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID (UUID) of the node type to delete',
      required: true,
    }),
  },
  async run(context) {
    const { nodeTypeId } = context.propsValue;

    await graphApiCall({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.NODE_TYPE_BY_ID(nodeTypeId),
      auth: context.auth as any,
    });

    return {
      success: true,
      message: `Node type ${nodeTypeId} and all associated data deleted successfully`,
      warning: 'This action is irreversible. All properties and records have been removed.',
    };
  },
});
