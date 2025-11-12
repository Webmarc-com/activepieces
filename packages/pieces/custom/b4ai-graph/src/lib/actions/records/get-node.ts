import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphAuth } from '../../common/auth';
import { graphApiCall } from '../../common/client';
import { API_ENDPOINTS } from '../../common/constants';
import { GraphNode } from '../../common/types';

export const getNode = createAction({
  auth: graphAuth,
  name: 'get_node',
  displayName: 'Get Node',
  description: 'Get a specific node record by ID',
  props: {
    nodeTypeId: Property.ShortText({
      displayName: 'Node Type ID',
      description: 'The ID (UUID) of the node type',
      required: true,
    }),
    recordId: Property.Number({
      displayName: 'Record ID',
      description: 'The numeric ID of the node record to retrieve',
      required: true,
    }),
    includeRelationships: Property.Checkbox({
      displayName: 'Include Relationships',
      description: 'Include relationship data in the response',
      required: false,
      defaultValue: false,
    }),
  },
  async run(context) {
    const { nodeTypeId, recordId, includeRelationships } = context.propsValue;

    // Use the GET endpoint to list records, then find the specific recordId
    // Note: The API doesn't provide a direct "get by ID" endpoint, so we fetch with pagination
    // and search for the record. For better performance, we could fetch in batches.
    const queryParams = new URLSearchParams({
      nodeTypeId,
      page: '1',
      pageSize: '100', // Fetch up to 100 records to search
      includeRelationships: includeRelationships ? 'true' : 'false',
    });

    const endpoint = `${API_ENDPOINTS.RECORDS}?${queryParams.toString()}`;

    const response = await graphApiCall<{
      success: boolean;
      records: Array<{ recordId: number; properties: any; relationships?: any }>;
      total: number;
    }>({
      method: HttpMethod.GET,
      endpoint,
      auth: context.auth as any,
    });

    if (!response.records || response.records.length === 0) {
      throw new Error(`No records found for node type ${nodeTypeId}`);
    }

    // Find the specific record by recordId
    const matchingRecord = response.records.find((record) => record.recordId === recordId);

    if (!matchingRecord) {
      // If not found in first page, we might need to search more pages
      if (response.total > 100) {
        throw new Error(
          `Node record ${recordId} not found in first 100 records. Total records: ${response.total}. Consider using query_nodes action with filters instead.`
        );
      }
      throw new Error(`Node record ${recordId} not found`);
    }

    return {
      success: true,
      node: matchingRecord,
    };
  },
});
