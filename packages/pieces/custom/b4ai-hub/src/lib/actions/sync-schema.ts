import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';
import { SyncSchemaRequest } from '../common/types';

export const syncSchema = createAction({
  auth: knowledgeHubAuth,
  name: 'sync_schema',
  displayName: 'Sync Schema',
  description: 'Synchronize the schema from Memgraph to PostgreSQL',
  props: {
    hubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'The ID of the knowledge hub to sync',
      required: true,
    }),
    generateMetadata: Property.Checkbox({
      displayName: 'Generate Metadata',
      description: 'Whether to generate LLM metadata during sync (default: false)',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    const { hubId, generateMetadata } = context.propsValue;

    const body: SyncSchemaRequest = {
      generateMetadata: generateMetadata || false,
    };

    const response = await knowledgeHubApiCall({
      method: HttpMethod.POST,
      endpoint: `/${hubId}/sync-schema`,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      message: 'Schema synchronized successfully from Memgraph to PostgreSQL',
      metadataGenerated: generateMetadata || false,
      ...response,
    };
  },
});
