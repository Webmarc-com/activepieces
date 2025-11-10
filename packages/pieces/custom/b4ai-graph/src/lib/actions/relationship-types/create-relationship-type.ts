import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationshipType, CreateRelationshipTypeRequest } from '../../common/types';

export const createRelationshipType = createAction({
  auth: graphAuth,
  name: 'create_relationship_type',
  displayName: 'Create Relationship Type',
  description: 'Create a new relationship type between node types',
  props: {
    name: Property.ShortText({
      displayName: 'Name',
      description: 'Relationship type name',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      description: 'Description of the relationship type',
      required: false,
    }),
    sourceNodeTypeId: Property.ShortText({
      displayName: 'Source Node Type ID',
      description: 'The ID of the source node type',
      required: true,
    }),
    targetNodeTypeId: Property.ShortText({
      displayName: 'Target Node Type ID',
      description: 'The ID of the target node type',
      required: true,
    }),
    isDirected: Property.Checkbox({
      displayName: 'Is Directed',
      description: 'Whether this is a directed relationship',
      required: false,
      defaultValue: true,
    }),
    allowMultiple: Property.Checkbox({
      displayName: 'Allow Multiple',
      description: 'Whether multiple relationships of this type can exist between two nodes',
      required: false,
      defaultValue: true,
    }),
  },
  async run(context) {
    const {
      name,
      description,
      sourceNodeTypeId,
      targetNodeTypeId,
      isDirected,
      allowMultiple,
    } = context.propsValue;

    const body: CreateRelationshipTypeRequest = {
      name,
      sourceNodeTypeId,
      targetNodeTypeId,
      isDirected,
      allowMultiple,
    };

    if (description) body.description = description;

    const response = await graphApiCall<GraphRelationshipType>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RELATIONSHIP_TYPES,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      relationshipType: response,
      message: 'Relationship type created successfully',
    };
  },
});
