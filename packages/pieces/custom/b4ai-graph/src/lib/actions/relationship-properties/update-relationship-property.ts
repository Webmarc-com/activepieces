import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationshipProperty, UpdateRelationshipPropertyRequest } from '../../common/types';

export const updateRelationshipProperty = createAction({
  auth: graphAuth,
  name: 'update_relationship_property',
  displayName: 'Update Relationship Property',
  description: 'Update an existing relationship property',
  props: {
    propertyId: Property.ShortText({
      displayName: 'Property ID',
      description: 'The ID (UUID) of the property to update',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Name',
      description: 'New name for the property',
      required: false,
    }),
    isRequired: Property.Checkbox({
      displayName: 'Is Required',
      description: 'Whether this property is required',
      required: false,
    }),
    isUnique: Property.Checkbox({
      displayName: 'Is Unique',
      description: 'Whether this property must be unique',
      required: false,
    }),
    isIndexed: Property.Checkbox({
      displayName: 'Is Indexed',
      description: 'Whether to create an index for this property',
      required: false,
    }),
    defaultValue: Property.ShortText({
      displayName: 'Default Value',
      description: 'Default value for this property',
      required: false,
    }),
    validationRules: Property.Json({
      displayName: 'Validation Rules',
      description: 'JSON object with validation rules (min, max, pattern, etc.)',
      required: false,
    }),
  },
  async run(context) {
    const {
      propertyId,
      name,
      isRequired,
      isUnique,
      isIndexed,
      defaultValue,
      validationRules,
    } = context.propsValue;

    const body: UpdateRelationshipPropertyRequest = {};
    if (name) body.name = name;
    if (isRequired !== undefined) body.isRequired = isRequired;
    if (isUnique !== undefined) body.isUnique = isUnique;
    if (isIndexed !== undefined) body.isIndexed = isIndexed;
    if (defaultValue !== undefined) body.defaultValue = defaultValue;
    if (validationRules) body.validationRules = validationRules;

    const response = await graphApiCall<GraphRelationshipProperty>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.RELATIONSHIP_PROPERTY_BY_ID(propertyId),
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      property: response,
      message: 'Relationship property updated successfully',
    };
  },
});
