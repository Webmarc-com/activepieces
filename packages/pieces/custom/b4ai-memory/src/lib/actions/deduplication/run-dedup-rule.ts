import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { RunDedupRuleResponse } from '../../common/types';

export const runDedupRule = createAction({
  auth: graphAuth,
  name: 'run_dedup_rule',
  displayName: 'Run Deduplication Rule',
  description: 'Execute a deduplication rule to find and optionally merge duplicates',
  props: {
    ruleId: Property.ShortText({
      displayName: 'Rule ID',
      description: 'The ID (UUID) of the rule to run',
      required: true,
    }),
  },
  async run(context) {
    const { ruleId } = context.propsValue;

    const response = await graphApiCall<RunDedupRuleResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.DEDUP_RUN(ruleId),
      auth: context.auth as any,
    });

    return {
      success: true,
      duplicateGroups: response.duplicateGroups,
      mergedCount: response.mergedCount,
      message: `Found ${response.duplicateGroups} duplicate groups${response.mergedCount > 0 ? `, merged ${response.mergedCount} nodes` : ''}`,
    };
  },
});
