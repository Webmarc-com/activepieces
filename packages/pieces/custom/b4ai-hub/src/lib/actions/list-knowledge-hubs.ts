import { createAction } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';
import { ListKnowledgeHubsResponse } from '../common/types';

export const listKnowledgeHubs = createAction({
  auth: knowledgeHubAuth,
  name: 'list_knowledge_hubs',
  displayName: 'List Knowledge Hubs',
  description: 'Get all knowledge hubs for your workspace',
  props: {},
  async run(context) {
    const response = await knowledgeHubApiCall<ListKnowledgeHubsResponse>({
      method: HttpMethod.GET,
      endpoint: '',
      auth: context.auth as any,
    });

    return {
      success: true,
      knowledgeHubs: response.knowledgeHubs,
      count: response.knowledgeHubs.length,
    };
  },
});
