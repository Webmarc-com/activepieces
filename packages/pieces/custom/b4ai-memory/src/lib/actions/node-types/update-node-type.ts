import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNodeType, UpdateNodeTypeRequest } from '../../common/types';

export const updateNodeType = createAction({
  auth: graphAuth,
  name: 'update_node_type',
  displayName: 'Update Node Type',
  description: 'Update an existing node type',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID (UUID) of the node type to update',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Name',
      description: 'New name for the node type',
      required: false,
    }),
    description: Property.LongText({
      displayName: 'Description',
      description: 'New description for the node type',
      required: false,
    }),
    isPrimary: Property.Checkbox({
      displayName: 'Is Primary',
      description: 'Whether this is a primary node type',
      required: false,
    }),
    isSearchable: Property.Checkbox({
      displayName: 'Is Searchable',
      description: 'Whether this node type is searchable',
      required: false,
    }),
  },
  async run(context) {
    const { nodeTypeId, name, description, isPrimary, isSearchable } = context.propsValue;

    const body: UpdateNodeTypeRequest = {};
    if (name) body.name = name;
    if (description !== undefined) body.description = description;
    if (isPrimary !== undefined) body.isPrimary = isPrimary;
    if (isSearchable !== undefined) body.isSearchable = isSearchable;

    const response = await graphApiCall<GraphNodeType>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.NODE_TYPE_BY_ID(nodeTypeId),
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      nodeType: response,
      message: 'Node type updated successfully',
    };
  },
});
