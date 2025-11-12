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
      description: 'The ID of the node type to query',
      required: true,
    }),
    filters: Property.Json({
      displayName: 'Filters',
      description: `Optional filter criteria. Can be a PropertyFilter or FilterGroup.

PropertyFilter example: { "propertyName": "name", "operator": "=", "value": "John" }
FilterGroup example: { "logic": "AND", "filters": [{"propertyName": "age", "operator": ">", "value": 18}, {"propertyName": "status", "operator": "=", "value": "active"}] }

Supported operators: =, !=, <>, >, <, >=, <=, CONTAINS, NOT CONTAINS, CONTAINS ALL, STARTS WITH, NOT STARTS WITH, ENDS WITH, NOT ENDS WITH, IN, NOT IN, IS NULL, IS NOT NULL, REGEX, NOT REGEX
Supported logic: AND, OR, NOT, XOR`,
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
    includeRelationships: Property.Checkbox({
      displayName: 'Include Relationships',
      description: 'Include relationship data in the response',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    const { nodeTypeId, filters, page, limit, sortBy, sortOrder, includeRelationships } =
      context.propsValue;

    if (!nodeTypeId) {
      throw new Error('Node Type ID is required');
    }

    const body: any = {
      nodeTypeId,
      page: page || 1,
      pageSize: limit || 10,
      includeRelationships: includeRelationships || false,
    };

    if (sortBy) {
      body.orderBy = sortBy;
      body.orderDirection = sortOrder || 'asc';
    }

    if (filters) {
      body.filters = filters;
    }

    const response = await graphApiCall<{
      success: boolean;
      records: GraphNode[];
      total: number;
      page: number;
      pageSize: number;
    }>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RECORDS_FILTER,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      nodes: response.records,
      pagination: {
        page: response.page,
        limit: response.pageSize,
        total: response.total,
        totalPages: Math.ceil(response.total / response.pageSize),
      },
    };
  },
});
