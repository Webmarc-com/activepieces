import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';

export const deleteDedupRule = createAction({
  auth: graphAuth,
  name: 'delete_dedup_rule',
  displayName: 'Delete Deduplication Rule',
  description: 'Delete a deduplication rule',
  props: {
    ruleId: Property.ShortText({
      displayName: 'Rule ID',
      description: 'The ID (UUID) of the rule to delete',
      required: true,
    }),
  },
  async run(context) {
    const { ruleId } = context.propsValue;

    await graphApiCall({
      method: HttpMethod.DELETE,
      endpoint: API_ENDPOINTS.DEDUP_RULE_BY_ID(ruleId),
      auth: context.auth as any,
    });

    return {
      success: true,
      message: `Deduplication rule ${ruleId} deleted successfully`,
    };
  },
});
