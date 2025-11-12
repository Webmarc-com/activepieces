import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNodeType, PaginatedResponse } from '../../common/types';

export const listNodeTypes = createAction({
  auth: graphAuth,
  name: 'list_node_types',
  displayName: 'List Node Types',
  description: 'Get all node types with pagination',
  props: {
    page: Property.Number({
      displayName: 'Page',
      description: 'Page number (starting from 1)',
      required: false,
      defaultValue: 1,
    }),
    pageSize: Property.Number({
      displayName: 'Page Size',
      description: 'Number of items per page',
      required: false,
      defaultValue: 20,
    }),
    orderBy: Property.ShortText({
      displayName: 'Order By',
      description: 'Field to order by (e.g., "name", "createdAt")',
      required: false,
    }),
    orderDirection: Property.StaticDropdown({
      displayName: 'Order Direction',
      required: false,
      defaultValue: 'ASC',
      options: {
        options: [
          { label: 'Ascending', value: 'ASC' },
          { label: 'Descending', value: 'DESC' },
        ],
      },
    }),
  },
  async run(context) {
    const { page, pageSize, orderBy, orderDirection } = context.propsValue;

    const response = await graphApiCall<PaginatedResponse<GraphNodeType>>({
      method: HttpMethod.GET,
      endpoint: API_ENDPOINTS.NODE_TYPES,
      auth: context.auth as any,
      query: {
        page: page || 1,
        pageSize: pageSize || 20,
        ...(orderBy && { orderBy }),
        ...(orderDirection && { orderDirection }),
      },
    });

    return {
      success: true,
      nodeTypes: response.data,
      pagination: response.pagination,
    };
  },
});
