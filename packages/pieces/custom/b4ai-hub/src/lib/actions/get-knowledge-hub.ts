import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';
import { GetKnowledgeHubResponse } from '../common/types';

export const getKnowledgeHub = createAction({
  auth: knowledgeHubAuth,
  name: 'get_knowledge_hub',
  displayName: 'Get Knowledge Hub',
  description: 'Get a knowledge hub by ID with its complete schema',
  props: {
    hubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'The ID of the knowledge hub to retrieve',
      required: true,
    }),
  },
  async run(context) {
    const { hubId } = context.propsValue;

    const response = await knowledgeHubApiCall<GetKnowledgeHubResponse>({
      method: HttpMethod.GET,
      endpoint: `/${hubId}`,
      auth: context.auth as any,
    });

    return {
      success: true,
      knowledgeHub: response,
    };
  },
});
