import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';

export const deleteNodeProperty = createAction({
  auth: graphAuth,
  name: 'delete_node_property',
  displayName: 'Delete Node Property',
  description: 'Delete a node property',
  props: {
    propertyId: Property.ShortText({
      displayName: 'Property ID',
      description: 'The ID (UUID) of the property to delete',
      required: true,
    }),
  },
  async run(context) {
    const { propertyId } = context.propsValue;

    await graphApiCall({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.NODE_PROPERTY_BY_ID(propertyId),
      auth: context.auth as any,
    });

    return {
      success: true,
      message: `Node property ${propertyId} deleted successfully`,
      warning: 'This action is irreversible. All associated data has been removed.',
    };
  },
});
