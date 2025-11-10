import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNodeProperty, PaginatedResponse } from '../../common/types';

export const listNodeProperties = createAction({
  auth: graphAuth,
  name: 'list_node_properties',
  displayName: 'List Node Properties',
  description: 'List all node properties with pagination',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'Filter by node type ID',
      required: false,
    }),
    page: Property.Number({
      displayName: 'Page',
      description: 'Page number (default: 1)',
      required: false,
    }),
    limit: Property.Number({
      displayName: 'Limit',
      description: 'Items per page (default: 10)',
      required: false,
    }),
  },
  async run(context) {
    const { nodeTypeId, page, limit } = context.propsValue;

    const queryParams = new URLSearchParams();
    if (nodeTypeId) queryParams.append('nodeTypeId', nodeTypeId);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());

    const endpoint = queryParams.toString()
      ? `${API_ENDPOINTS.NODE_PROPERTIES}?${queryParams.toString()}`
      : API_ENDPOINTS.NODE_PROPERTIES;

    const response = await graphApiCall<PaginatedResponse<GraphNodeProperty>>({
      method: HttpMethod.GET,
      endpoint,
      auth: context.auth as any,
    });

    return {
      success: true,
      properties: response.data,
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      },
    };
  },
});
