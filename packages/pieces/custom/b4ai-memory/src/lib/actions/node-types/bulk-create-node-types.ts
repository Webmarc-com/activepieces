import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { BulkCreateResponse } from '../../common/types';

export const bulkCreateNodeTypes = createAction({
  auth: graphAuth,
  name: 'bulk_create_node_types',
  displayName: 'Bulk Create Node Types',
  description: 'Create multiple node types at once',
  props: {
    nodeTypes: Property.Array({
      displayName: 'Node Types',
      description: 'Array of node type objects to create',
      required: true,
    }),
    defaultStatus: Property.StaticDropdown({
      displayName: 'Default Status',
      description: 'Default status for node types that do not specify their own status',
      required: false,
      defaultValue: 'DRAFT',
      options: {
        options: [
          { label: 'Production', value: 'PRODUCTION' },
          { label: 'Draft', value: 'DRAFT' },
        ],
      },
    }),
  },
  async run(context) {
    const { nodeTypes, defaultStatus } = context.propsValue;

    // Apply default status to items that don't have one
    const nodeTypesWithStatus = (nodeTypes as any[]).map((nodeType: any) => ({
      ...nodeType,
      status: nodeType.status || defaultStatus || 'DRAFT',
    }));

    const response = await graphApiCall<BulkCreateResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.NODE_TYPES_BULK,
      auth: context.auth as any,
      body: nodeTypesWithStatus,
    });

    return {
      success: true,
      created: response.created,
      errors: response.errors,
      message: `Successfully created ${response.created} node types${response.errors.length > 0 ? ` with ${response.errors.length} errors` : ''}`,
    };
  },
});
