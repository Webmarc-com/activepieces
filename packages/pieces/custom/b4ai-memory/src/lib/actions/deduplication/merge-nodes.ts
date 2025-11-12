import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode, MergeNodesRequest } from '../../common/types';

export const mergeNodes = createAction({
  auth: graphAuth,
  name: 'merge_nodes',
  displayName: 'Merge Nodes',
  description: 'Merge multiple duplicate nodes into a single node',
  props: {
    nodeIds: Property.Array({
      displayName: 'Node IDs',
      description: 'Array of node IDs to merge (first one will be the master)',
      required: true,
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
    keepRelationships: Property.Checkbox({
      displayName: 'Keep All Relationships',
      description: 'Preserve all relationships from merged nodes',
      required: false,
      defaultValue: true,
    }),
  },
  async run(context) {
    const { nodeIds, mergeStrategy, keepRelationships } = context.propsValue;

    const body: MergeNodesRequest = {
      nodeIds,
      mergeStrategy: mergeStrategy as any,
      keepRelationships,
    };

    const response = await graphApiCall<GraphNode>({
      method: HttpMethod.POST,
      endpoint: API_ENDPOINTS.DEDUP_MERGE,
      auth: context.auth as any,
      body,
    });

    return {
      success: true,
      mergedNode: response,
      message: `Successfully merged ${nodeIds.length} nodes`,
      warning: 'This action is irreversible. Duplicate nodes have been removed.',
    };
  },
});
