import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphRelationshipProperty, CreateRelationshipPropertyRequest } from '../../common/types';

export const createRelationshipProperty = createAction({
  auth: graphAuth,
  name: 'create_relationship_property',
  displayName: 'Create Relationship Property',
  description: 'Create a new property for a relationship type',
  props: {
    relationshipTypeId: Property.ShortText({
      displayName: 'Relationship Type ID',
      description: 'The ID of the relationship type this property belongs to',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Name',
      description: 'Property name',
      required: true,
    }),
    dataType: Property.StaticDropdown({
      displayName: 'Data Type',
      description: 'The data type of this property',
      required: true,
      options: {
        options: [
          { label: 'STRING', value: 'STRING' },
          { label: 'INTEGER', value: 'INTEGER' },
          { label: 'FLOAT', value: 'FLOAT' },
          { label: 'BOOLEAN', value: 'BOOLEAN' },
          { label: 'DATE', value: 'DATE' },
          { label: 'DATETIME', value: 'DATETIME' },
          { label: 'TIME', value: 'TIME' },
          { label: 'URL', value: 'URL' },
          { label: 'EMAIL', value: 'EMAIL' },
          { label: 'PHONE', value: 'PHONE' },
          { label: 'JSON', value: 'JSON' },
          { label: 'TEXT', value: 'TEXT' },
          { label: 'CURRENCY', value: 'CURRENCY' },
          { label: 'PERCENTAGE', value: 'PERCENTAGE' },
          { label: 'LOCATION', value: 'LOCATION' },
          { label: 'REFERENCE', value: 'REFERENCE' },
        ],
      },
    }),
    isRequired: Property.Checkbox({
      displayName: 'Is Required',
      description: 'Whether this property is required',
      required: false,
      defaultValue: false,
    }),
    isUnique: Property.Checkbox({
      displayName: 'Is Unique',
      description: 'Whether this property must be unique',
      required: false,
      defaultValue: false,
    }),
    isIndexed: Property.Checkbox({
      displayName: 'Is Indexed',
      description: 'Whether to create an index for this property',
      required: false,
      defaultValue: false,
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
      relationshipTypeId,
      name,
      dataType,
      isRequired,
      isUnique,
      isIndexed,
      defaultValue,
      validationRules,
    } = context.propsValue;

    const body: CreateRelationshipPropertyRequest = {
      relationshipTypeId,
      name,
      dataType: dataType as any,
      isRequired,
      isUnique,
      isIndexed,
    };

    if (defaultValue !== undefined) body.defaultValue = defaultValue;
    if (validationRules) body.validationRules = validationRules;

    const response = await graphApiCall<GraphRelationshipProperty>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.RELATIONSHIP_PROPERTIES,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      property: response,
      message: 'Relationship property created successfully',
    };
  },
});
