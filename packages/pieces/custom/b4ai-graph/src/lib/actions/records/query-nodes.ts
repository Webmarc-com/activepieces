import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode, PaginatedResponse } from '../../common/types';

export const queryNodes = createAction({
  auth: graphAuth,
  name: 'query_nodes',
  displayName: 'Query Nodes',
  description: 'Query nodes with advanced filtering',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'Filter by node type ID',
      required: false,
    }),
    filters: Property.Json({
      displayName: 'Filters',
      description: 'JSON array of filter objects with field, operator, and value',
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
    sortBy: Property.ShortText({
      displayName: 'Sort By',
      description: 'Field to sort by',
      required: false,
    }),
    sortOrder: Property.StaticDropdown({
      displayName: 'Sort Order',
      description: 'Sort direction',
      required: false,
      options: {
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' },
        ],
      },
    }),
  },
  async run(context) {
    const { nodeTypeId, filters, page, limit, sortBy, sortOrder } = context.propsValue;

    const queryParams = new URLSearchParams();
    if (nodeTypeId) queryParams.append('nodeTypeId', nodeTypeId);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);

    let endpoint = API_ENDPOINTS.NODES_QUERY;
    if (queryParams.toString()) {
      endpoint = `${endpoint}?${queryParams.toString()}`;
    }

    const body = filters ? { filters } : undefined;

    const response = await graphApiCall<PaginatedResponse<GraphNode>>({
      method: HttpMethod.POST,
      endpoint,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      nodes: response.data,
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      },
    };
  },
});
