import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNodeType } from '../../common/types';

export const getNodeType = createAction({
  auth: graphAuth,
  name: 'get_node_type',
  displayName: 'Get Node Type',
  description: 'Get a single node type by ID with all its properties',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID (UUID) of the node type to retrieve',
      required: true,
    }),
  },
  async run(context) {
    const { nodeTypeId } = context.propsValue;

    const response = await graphApiCall<GraphNodeType>({
      method: HttpMethod.GET,
      endpoint: API_ENDPOINTS.NODE_TYPE_BY_ID(nodeTypeId),
      auth: context.auth as any,
    });

    return {
      success: true,
      nodeType: response,
    };
  },
});
