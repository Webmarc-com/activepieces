import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode, UpdateNodeRequest } from '../../common/types';

export const updateNode = createAction({
  auth: graphAuth,
  name: 'update_node',
  displayName: 'Update Node',
  description: 'Update a node\'s properties',
  props: {
    nodeId: Property.ShortText({
      displayName: 'Node ID',
      description: 'The ID (UUID) of the node to update',
      required: true,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'JSON object with property names and new values',
      required: true,
    }),
  },
  async run(context) {
    const { nodeId, properties } = context.propsValue;

    const body: UpdateNodeRequest = {
      properties,
    };

    const response = await graphApiCall<GraphNode>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.NODE_BY_ID(nodeId),
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      node: response,
      message: 'Node updated successfully',
    };
  },
});
