import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode, CreateNodeRequest } from '../../common/types';

export const createNode = createAction({
  auth: graphAuth,
  name: 'create_node',
  displayName: 'Create Node',
  description: 'Create a new node with properties',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID of the node type',
      required: true,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'JSON object with property names and values',
      required: true,
    }),
  },
  async run(context) {
    const { nodeTypeId, properties } = context.propsValue;

    const body: CreateNodeRequest = {
      nodeTypeId,
      properties,
    };

    const response = await graphApiCall<GraphNode>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.NODES,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      node: response,
      message: 'Node created successfully',
    };
  },
});
