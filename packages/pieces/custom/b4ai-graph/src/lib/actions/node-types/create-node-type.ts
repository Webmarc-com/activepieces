import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS, PROPERTY_DATA_TYPES } from '../../common/constants';
import { GraphNodeType, CreateNodeTypeRequest } from '../../common/types';

export const createNodeType = createAction({
  auth: graphAuth,
  name: 'create_node_type',
  displayName: 'Create Node Type',
  description: 'Create a new node type with optional properties',
  props: {
    name: Property.ShortText({
      displayName: 'Name',
      description: 'Name of the node type',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      description: 'Optional description of the node type',
      required: false,
    }),
    knowledgeHubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'UUID of the knowledge hub',
      required: true,
    }),
    status: Property.StaticDropdown({
      displayName: 'Status',
      required: true,
      defaultValue: 'PRODUCTION',
      options: {
        options: [
          { label: 'Production', value: 'PRODUCTION' },
          { label: 'Draft', value: 'DRAFT' },
        ],
      },
    }),
    isPrimary: Property.Checkbox({
      displayName: 'Is Primary',
      description: 'Whether this is a primary node type',
      required: false,
      defaultValue: false,
    }),
    isSearchable: Property.Checkbox({
      displayName: 'Is Searchable',
      description: 'Whether this node type is searchable',
      required: false,
      defaultValue: true,
    }),
    properties: Property.Array({
      displayName: 'Properties',
      description: 'Optional properties to add to this node type (JSON array)',
      required: false,
    }),
  },
  async run(context) {
    const { name, description, knowledgeHubId, status, isPrimary, isSearchable, properties } = context.propsValue;

    const body: CreateNodeTypeRequest = {
      name,
      knowledgeHubId,
      status: status as any,
      ...(description && { description }),
      ...(isPrimary !== undefined && { isPrimary }),
      ...(isSearchable !== undefined && { isSearchable }),
      ...(properties && { properties: properties as any }),
    };

    const response = await graphApiCall<GraphNodeType>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.NODE_TYPES,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      nodeType: response,
      message: 'Node type created successfully',
    };
  },
});
