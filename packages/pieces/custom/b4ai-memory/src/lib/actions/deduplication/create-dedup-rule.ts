import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { DedupRule, CreateDedupRuleRequest } from '../../common/types';

export const createDedupRule = createAction({
  auth: graphAuth,
  name: 'create_dedup_rule',
  displayName: 'Create Deduplication Rule',
  description: 'Create an automatic deduplication rule',
  props: {
    name: Property.ShortText({
      displayName: 'Rule Name',
      description: 'Name for this deduplication rule',
      required: true,
    }),
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The node type this rule applies to',
      required: true,
    }),
    matchFields: Property.Array({
      displayName: 'Match Fields',
      description: 'Array of property names to use for duplicate detection',
      required: true,
    }),
    similarityThreshold: Property.Number({
      displayName: 'Similarity Threshold',
      description: 'Minimum similarity score (0-100) to consider as duplicates',
      required: false,
      defaultValue: 80,
    }),
    autoMerge: Property.Checkbox({
      displayName: 'Auto Merge',
      description: 'Automatically merge duplicates when found',
      required: false,
      defaultValue: false,
    }),
    mergeStrategy: Property.StaticDropdown({
      displayName: 'Merge Strategy',
      description: 'Strategy for handling conflicting property values',
      required: false,
      defaultValue: 'prefer_first',
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
      defaultValue: true,
    }),
  },
  async run(context) {
    const {
      name,
      nodeTypeId,
      matchFields,
      similarityThreshold,
      autoMerge,
      mergeStrategy,
      isActive,
    } = context.propsValue;

    const body: CreateDedupRuleRequest = {
      name,
      nodeTypeId,
      matchFields,
      similarityThreshold,
      autoMerge,
      mergeStrategy: mergeStrategy as any,
      isActive,
    };

    const response = await graphApiCall<DedupRule>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.DEDUP_RULES,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      rule: response,
      message: 'Deduplication rule created successfully',
    };
  },
});
