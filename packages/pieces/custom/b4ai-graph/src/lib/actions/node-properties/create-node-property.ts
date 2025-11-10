import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNodeProperty, CreateNodePropertyRequest } from '../../common/types';

export const createNodeProperty = createAction({
  auth: graphAuth,
  name: 'create_node_property',
  displayName: 'Create Node Property',
  description: 'Create a new property for a node type',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID of the node type this property belongs to',
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
      nodeTypeId,
      name,
      dataType,
      isRequired,
      isUnique,
      isIndexed,
      defaultValue,
      validationRules,
    } = context.propsValue;

    const body: CreateNodePropertyRequest = {
      nodeTypeId,
      name,
      dataType: dataType as any,
      isRequired,
      isUnique,
      isIndexed,
    };

    if (defaultValue !== undefined) body.defaultValue = defaultValue;
    if (validationRules) body.validationRules = validationRules;

    const response = await graphApiCall<GraphNodeProperty>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.NODE_PROPERTIES,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      property: response,
      message: 'Node property created successfully',
    };
  },
});
