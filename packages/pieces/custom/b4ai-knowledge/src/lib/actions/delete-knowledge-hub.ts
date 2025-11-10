import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { knowledgeHubAuth } from '../common/auth';
import { knowledgeHubApiCall } from '../common/client';

export const deleteKnowledgeHub = createAction({
  auth: knowledgeHubAuth,
  name: 'delete_knowledge_hub',
  displayName: 'Delete Knowledge Hub',
  description: 'Delete a knowledge hub and all its data (irreversible)',
  props: {
    hubId: Property.ShortText({
      displayName: 'Knowledge Hub ID',
      description: 'The ID of the knowledge hub to delete',
      required: true,
    }),
  },
  async run(context) {
    const { hubId } = context.propsValue;

    await knowledgeHubApiCall({
      method: HttpMethod.DELETE,
      endpoint: `/${hubId}`,
      auth: context.auth as any,
    });

    return {
      success: true,
      message: `Knowledge hub ${hubId} and all its data have been permanently deleted`,
      warning: 'This action is irreversible. All associated data has been removed.',
    };
  },
});
