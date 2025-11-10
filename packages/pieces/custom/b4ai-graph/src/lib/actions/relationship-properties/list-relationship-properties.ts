import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationshipProperty, PaginatedResponse } from '../../common/types';

export const listRelationshipProperties = createAction({
  auth: graphAuth,
  name: 'list_relationship_properties',
  displayName: 'List Relationship Properties',
  description: 'List all relationship properties with pagination',
  props: {
    relationshipTypeId: Property.ShortText({
      displayName: 'Relationship Type ID',
      description: 'Filter by relationship type ID',
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
    const { relationshipTypeId, page, limit } = context.propsValue;

    const queryParams = new URLSearchParams();
    if (relationshipTypeId) queryParams.append('relationshipTypeId', relationshipTypeId);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());

    const endpoint = queryParams.toString()
      ? `${API_ENDPOINTS.RELATIONSHIP_PROPERTIES}?${queryParams.toString()}`
      : API_ENDPOINTS.RELATIONSHIP_PROPERTIES;

    const response = await graphApiCall<PaginatedResponse<GraphRelationshipProperty>>({
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
