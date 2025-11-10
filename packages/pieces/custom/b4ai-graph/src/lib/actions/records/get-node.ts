import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode } from '../../common/types';

export const getNode = createAction({
  auth: graphAuth,
  name: 'get_node',
  displayName: 'Get Node',
  description: 'Get a specific node by ID',
  props: {
    nodeId: Property.ShortText({
      displayName: 'Node ID',
      description: 'The ID (UUID) of the node to retrieve',
      required: true,
    }),
  },
  async run(context) {
    const { nodeId } = context.propsValue;

    const response = await graphApiCall<GraphNode>({
      method: HttpMethod.GET,
      endpoint: API_ENDPOINTS.NODE_BY_ID(nodeId),
      auth: context.auth as any,
    });

    return {
      success: true,
      node: response,
    };
  },
});
