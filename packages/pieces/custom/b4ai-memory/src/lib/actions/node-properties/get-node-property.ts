import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNodeProperty } from '../../common/types';

export const getNodeProperty = createAction({
  auth: graphAuth,
  name: 'get_node_property',
  displayName: 'Get Node Property',
  description: 'Get details of a specific node property by ID',
  props: {
    propertyId: Property.ShortText({
      displayName: 'Property ID',
      description: 'The ID (UUID) of the property to retrieve',
      required: true,
    }),
  },
  async run(context) {
    const { propertyId } = context.propsValue;

    const response = await graphApiCall<GraphNodeProperty>({
      method: HttpMethod.GET,
      endpoint: API_ENDPOINTS.NODE_PROPERTY_BY_ID(propertyId),
      auth: context.auth as any,
    });

    return {
      success: true,
      property: response,
    };
  },
});
