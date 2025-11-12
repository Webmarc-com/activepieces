import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { DedupRule, PaginatedResponse } from '../../common/types';

export const listDedupRules = createAction({
  auth: graphAuth,
  name: 'list_dedup_rules',
  displayName: 'List Deduplication Rules',
  description: 'List all deduplication rules',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'Filter by node type ID',
      required: false,
    }),
    isActive: Property.Checkbox({
      displayName: 'Active Only',
      description: 'Only show active rules',
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
    const { nodeTypeId, isActive, page, limit } = context.propsValue;

    const queryParams = new URLSearchParams();
    if (nodeTypeId) queryParams.append('nodeTypeId', nodeTypeId);
    if (isActive !== undefined) queryParams.append('isActive', isActive.toString());
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());

    const endpoint = queryParams.toString()
      ? `${API_ENDPOINTS.DEDUP_RULES}?${queryParams.toString()}`
      : API_ENDPOINTS.DEDUP_RULES;

    const response = await graphApiCall<PaginatedResponse<DedupRule>>({
      method: HttpMethod.GET,
      endpoint,
      auth: context.auth as any,
    });

    return {
      success: true,
      rules: response.data,
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      },
    };
  },
});
