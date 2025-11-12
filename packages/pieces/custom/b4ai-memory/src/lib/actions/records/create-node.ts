import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode } from '../../common/types';

export const createNode = createAction({
  auth: graphAuth,
  name: 'create_node',
  displayName: 'Create Node',
  description: 'Create a new node with properties',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID of the node type',
      required: true,
    }),
    properties: Property.Json({
      displayName: 'Properties',
      description: 'JSON object with property names and values',
      required: true,
    }),
    relationships: Property.Json({
      displayName: 'Relationships',
      description: 'Optional array of relationships to create with this node. Format: [{ relationshipId: "uuid", records: [{ recordId: number, relationshipProperties?: {...} }] }]',
      required: false,
    }),
  },
  async run(context) {
    const { nodeTypeId, properties, relationships } = context.propsValue;

    const body: any = {
      nodeTypeId,
      properties,
    };

    if (relationships) {
      body.relationships = relationships;
    }

    const response = await graphApiCall<GraphNode>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RECORDS,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      node: response,
      message: 'Node created successfully',
    };
  },
});
