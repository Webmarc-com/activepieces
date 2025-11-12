import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { DedupRule, UpdateDedupRuleRequest } from '../../common/types';

export const updateDedupRule = createAction({
  auth: graphAuth,
  name: 'update_dedup_rule',
  displayName: 'Update Deduplication Rule',
  description: 'Update an existing deduplication rule',
  props: {
    ruleId: Property.ShortText({
      displayName: 'Rule ID',
      description: 'The ID (UUID) of the rule to update',
      required: true,
    }),
    name: Property.ShortText({
      displayName: 'Rule Name',
      description: 'New name for this rule',
      required: false,
    }),
    matchFields: Property.Array({
      displayName: 'Match Fields',
      description: 'Array of property names to use for duplicate detection',
      required: false,
    }),
    similarityThreshold: Property.Number({
      displayName: 'Similarity Threshold',
      description: 'Minimum similarity score (0-100)',
      required: false,
    }),
    autoMerge: Property.Checkbox({
      displayName: 'Auto Merge',
      description: 'Automatically merge duplicates when found',
      required: false,
    }),
    mergeStrategy: Property.StaticDropdown({
      displayName: 'Merge Strategy',
      description: 'Strategy for handling conflicting property values',
      required: false,
      options: {
        options: [
          { label: 'Prefer First (Master)', value: 'prefer_first' },
          { label: 'Prefer Non-Empty', value: 'prefer_non_empty' },
          { label: 'Prefer Latest', value: 'prefer_latest' },
          { label: 'Concatenate', value: 'concatenate' },
        ],
      },
    }),
    isActive: Property.Checkbox({
      displayName: 'Is Active',
      description: 'Whether this rule is currently active',
      required: false,
    }),
  },
  async run(context) {
    const {
      ruleId,
      name,
      matchFields,
      similarityThreshold,
      autoMerge,
      mergeStrategy,
      isActive,
    } = context.propsValue;

    const body: UpdateDedupRuleRequest = {};
    if (name) body.name = name;
    if (matchFields) body.matchFields = matchFields;
    if (similarityThreshold !== undefined) body.similarityThreshold = similarityThreshold;
    if (autoMerge !== undefined) body.autoMerge = autoMerge;
    if (mergeStrategy) body.mergeStrategy = mergeStrategy as any;
    if (isActive !== undefined) body.isActive = isActive;

    const response = await graphApiCall<DedupRule>({
      method: HttpMethod.PUT,
      endpoint: API_ENDPOINTS.DEDUP_RULE_BY_ID(ruleId),
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      rule: response,
      message: 'Deduplication rule updated successfully',
    };
  },
});
