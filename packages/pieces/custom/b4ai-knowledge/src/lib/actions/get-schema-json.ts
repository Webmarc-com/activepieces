import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';
import { SchemaWithMetadata } from '../common/types';

export const getSchemaJson = createAction({
  auth: knowledgeHubAuth,
  name: 'get_schema_json',
  displayName: 'Get Schema JSON',
  description: 'Get the knowledge hub schema with LLM-generated metadata',
  props: {
    hubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'The ID of the knowledge hub',
      required: true,
    }),
  },
  async run(context) {
    const { hubId } = context.propsValue;

    const response = await knowledgeHubApiCall<SchemaWithMetadata>({
      method: HttpMethod.GET,
      endpoint: `/${hubId}/schema-json`,
      auth: context.auth as any,
    });

    return {
      success: true,
      schema: response.schema,
      metadata: response.metadata,
      syncStatus: response.metadata.syncStatus,
      lastSyncedAt: response.metadata.lastSyncedAt,
    };
  },
});
