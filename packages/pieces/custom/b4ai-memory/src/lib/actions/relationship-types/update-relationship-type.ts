import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationshipType, UpdateRelationshipTypeRequest } from '../../common/types';

export const updateRelationshipType = createAction({
  auth: graphAuth,
  name: 'update_relationship_type',
  displayName: 'Update Relationship Type',
  description: 'Update an existing relationship type',
  props: {
    relationshipTypeId: Property.ShortText({
      displayName: 'Relationship Type ID',
      description: 'The ID (UUID) of the relationship type to update',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Name',
      description: 'New name for the relationship type',
      required: false,
    }),
    description: Property.LongText({
      displayName: 'Description',
      description: 'New description for the relationship type',
      required: false,
    }),
    isDirected: Property.Checkbox({
      displayName: 'Is Directed',
      description: 'Whether this is a directed relationship',
      required: false,
    }),
    allowMultiple: Property.Checkbox({
      displayName: 'Allow Multiple',
      description: 'Whether multiple relationships of this type can exist between two nodes',
      required: false,
    }),
  },
  async run(context) {
    const {
      relationshipTypeId,
      name,
      description,
      isDirected,
      allowMultiple,
    } = context.propsValue;

    const body: UpdateRelationshipTypeRequest = {};
    if (name) body.name = name;
    if (description !== undefined) body.description = description;
    if (isDirected !== undefined) body.isDirected = isDirected;
    if (allowMultiple !== undefined) body.allowMultiple = allowMultiple;

    const response = await graphApiCall<GraphRelationshipType>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.RELATIONSHIP_TYPE_BY_ID(relationshipTypeId),
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      relationshipType: response,
      message: 'Relationship type updated successfully',
    };
  },
});
