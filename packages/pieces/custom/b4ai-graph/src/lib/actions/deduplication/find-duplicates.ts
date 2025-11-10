import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { DuplicateGroup, FindDuplicatesResponse } from '../../common/types';

export const findDuplicates = createAction({
  auth: graphAuth,
  name: 'find_duplicates',
  displayName: 'Find Duplicates',
  description: 'Find potential duplicate nodes based on matching criteria',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The node type to search for duplicates',
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
  },
  async run(context) {
    const { nodeTypeId, matchFields, similarityThreshold } = context.propsValue;

    const response = await graphApiCall<FindDuplicatesResponse>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.DEDUP_FIND,
      auth: context.auth as any,
      body: {
        nodeTypeId,
        matchFields,
        similarityThreshold,
      },
    });

    return {
      success: true,
      duplicateGroups: response.duplicateGroups,
      totalGroups: response.totalGroups,
      message: `Found ${response.totalGroups} groups of potential duplicates`,
    };
  },
});
