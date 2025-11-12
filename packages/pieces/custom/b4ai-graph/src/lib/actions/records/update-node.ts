import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode, UpdateNodeRequest } from '../../common/types';

export const updateNode = createAction({
  auth: graphAuth,
  name: 'update_node',
  displayName: 'Update Node',
  description: 'Update a node\'s properties',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID (UUID) of the node type',
      required: true,
    }),
    recordId: Property.Number({
      displayName: 'Record ID',
      description: 'The numeric ID of the node record to update',
      required: true,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'JSON object with property names and new values',
      required: true,
    }),
    relationships: Property.Json({
      displayName: 'Relationships',
      description: 'Optional array of relationship operations. Format: [{ operation: "add"|"remove", relationshipId: "uuid", records: [{ recordId: number, relationshipProperties?: {...} }] }]',
      required: false,
    }),
  },
  async run(context) {
    const { nodeTypeId, recordId, properties, relationships } = context.propsValue;

    const body: any = {
      nodeTypeId,
      recordId,
      properties,
    };

    if (relationships) {
      body.relationships = relationships;
    }

    const response = await graphApiCall<GraphNode>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.RECORDS,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      node: response,
      message: 'Node updated successfully',
    };
  },
});
