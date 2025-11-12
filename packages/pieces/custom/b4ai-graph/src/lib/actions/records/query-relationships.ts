import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationship, PaginatedResponse } from '../../common/types';

// NOTE: This action needs refactoring. According to GRAPH_API.md, relationships are queried
// by fetching node records with includeRelationships: true via POST /api/node-type-records/filter.
// There is no separate /relationships/query endpoint.
export const queryRelationships = createAction({
  auth: graphAuth,
  name: 'query_relationships',
  displayName: 'Query Relationships',
  description: 'Query relationships with advanced filtering',
  props: {
    relationshipTypeId: Property.ShortText({
      displayName: 'Relationship Type ID',
      description: 'Filter by relationship type ID',
      required: false,
    }),
    sourceNodeId: Property.ShortText({
      displayName: 'Source Node ID',
      description: 'Filter by source node ID',
      required: false,
    }),
    targetNodeId: Property.ShortText({
      displayName: 'Target Node ID',
      description: 'Filter by target node ID',
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
    const {
      relationshipTypeId,
      sourceNodeId,
      targetNodeId,
      filters,
      page,
      limit,
      sortBy,
      sortOrder,
    } = context.propsValue;

    const queryParams = new URLSearchParams();
    if (relationshipTypeId) queryParams.append('relationshipTypeId', relationshipTypeId);
    if (sourceNodeId) queryParams.append('sourceNodeId', sourceNodeId);
    if (targetNodeId) queryParams.append('targetNodeId', targetNodeId);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortOrder) queryParams.append('sortOrder', sortOrder);

    let endpoint: string = API_ENDPOINTS.RELATIONSHIPS_QUERY;
    if (queryParams.toString()) {
      endpoint = `${endpoint}?${queryParams.toString()}`;
    }

    const body = filters ? { filters } : undefined;

    const response = await graphApiCall<PaginatedResponse<GraphRelationship>>({
      method: HttpMethod.POST,
      endpoint,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      relationships: response.data,
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      },
    };
  },
});
