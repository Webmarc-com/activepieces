import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';
import { KnowledgeHub, UpdateKnowledgeHubRequest } from '../common/types';

export const updateKnowledgeHub = createAction({
  auth: knowledgeHubAuth,
  name: 'update_knowledge_hub',
  displayName: 'Update Knowledge Hub',
  description: 'Update the name or description of a knowledge hub',
  props: {
    hubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'The ID of the knowledge hub to update',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Name',
      description: 'New name for the knowledge hub (optional)',
      required: false,
    }),
    description: Property.LongText({
      displayName: 'Description',
      description: 'New description for the knowledge hub (optional)',
      required: false,
    }),
  },
  async run(context) {
    const { hubId, name, description } = context.propsValue;

    const body: UpdateKnowledgeHubRequest = {};
    if (name) body.name = name;
    if (description !== undefined) body.description = description;

    const response = await knowledgeHubApiCall<KnowledgeHub>({
      method: HttpMethod.PATCH,
      endpoint: `/${hubId}`,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      knowledgeHub: response,
      message: 'Knowledge hub updated successfully',
    };
  },
});
