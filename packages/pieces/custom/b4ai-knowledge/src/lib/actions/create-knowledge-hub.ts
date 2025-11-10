import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';
import { KnowledgeHub, CreateKnowledgeHubRequest } from '../common/types';

export const createKnowledgeHub = createAction({
  auth: knowledgeHubAuth,
  name: 'create_knowledge_hub',
  displayName: 'Create Knowledge Hub',
  description: 'Create a new knowledge hub with DRAFT and PRODUCTION Memgraph instances',
  props: {
    name: Property.ShortText({
      displayName: 'Name',
      description: 'Name of the knowledge hub',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      description: 'Optional description of the knowledge hub',
      required: false,
    }),
  },
  async run(context) {
    const { name, description } = context.propsValue;

    const body: CreateKnowledgeHubRequest = {
      name,
      ...(description && { description }),
    };

    const response = await knowledgeHubApiCall<KnowledgeHub>({
      method: HttpMethod.POST,
      endpoint: '',
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      knowledgeHub: response,
      message: 'Knowledge hub created successfully with DRAFT and PRODUCTION instances',
    };
  },
});
