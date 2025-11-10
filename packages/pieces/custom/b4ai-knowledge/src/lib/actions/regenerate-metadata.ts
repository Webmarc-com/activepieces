import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';
import { RegenerateMetadataRequest, RegenerateMetadataResponse } from '../common/types';

export const regenerateMetadata = createAction({
  auth: knowledgeHubAuth,
  name: 'regenerate_metadata',
  displayName: 'Regenerate Metadata',
  description: 'Trigger async regeneration of LLM metadata for the schema',
  props: {
    hubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'The ID of the knowledge hub',
      required: true,
    }),
    mode: Property.StaticDropdown({
      displayName: 'Mode',
      description: 'Regeneration mode',
      required: true,
      options: {
        options: [
          {
            label: 'Full Regeneration',
            value: 'full',
          },
          {
            label: 'Partial Regeneration',
            value: 'partial',
          },
        ],
      },
    }),
    includeProduction: Property.Checkbox({
      displayName: 'Include Production',
      description: 'Also regenerate metadata for production instance (default: false)',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    const { hubId, mode, includeProduction } = context.propsValue;

    const body: RegenerateMetadataRequest = {
      mode: mode as 'full' | 'partial',
      includeProduction: includeProduction || false,
    };

    const response = await knowledgeHubApiCall<RegenerateMetadataResponse>({
      method: HttpMethod.POST,
      endpoint: `/${hubId}/regenerate-metadata`,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      message: 'Metadata regeneration has been triggered (async operation)',
      syncStatus: response.syncStatus,
      lastSyncedAt: response.lastSyncedAt,
      note: 'This is an async operation. Use "Get Schema JSON" action to check completion status.',
    };
  },
});
