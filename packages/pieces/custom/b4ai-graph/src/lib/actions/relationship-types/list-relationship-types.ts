import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationshipType, PaginatedResponse } from '../../common/types';

export const listRelationshipTypes = createAction({
  auth: graphAuth,
  name: 'list_relationship_types',
  displayName: 'List Relationship Types',
  description: 'List all relationship types with pagination',
  props: {
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
    const { page, limit } = context.propsValue;

    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());

    const endpoint = queryParams.toString()
      ? `${API_ENDPOINTS.RELATIONSHIP_TYPES}?${queryParams.toString()}`
      : API_ENDPOINTS.RELATIONSHIP_TYPES;

    const response = await graphApiCall<PaginatedResponse<GraphRelationshipType>>({
      method: HttpMethod.GET,
      endpoint,
      auth: context.auth as any,
    });

    return {
      success: true,
      relationshipTypes: response.data,
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      },
    };
  },
});
