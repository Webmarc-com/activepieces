import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { b4aiUtilitiesAuth } from '../common/auth';
import { uploadApiCall } from '../common/client';
import { ListFilesResponse } from '../common/types';

export const listFiles = createAction({
  auth: b4aiUtilitiesAuth,
  name: 'list_files',
  displayName: 'List Files',
  description: 'List all uploaded files, optionally filtered by owner ID',
  props: {
    ownerId: Property.ShortText({
      displayName: 'Owner ID',
      description: 'Filter files by owner ID (UUID). Leave empty to list all files.',
      required: false,
    }),
  },
  async run(context) {
    const { ownerId } = context.propsValue;

    // Build query parameters
    const query: Record<string, string | undefined> = {};
    if (ownerId) {
      query.ownerId = ownerId;
    }

    // List files
    const response = await uploadApiCall<ListFilesResponse>({
      method: HttpMethod.GET,
      endpoint: '/files',
      auth: context.auth,
      query,
    });

    return {
      success: true,
      fileUploads: response.fileUploads,
      count: response.fileUploads.length,
      message: `Found ${response.fileUploads.length} file(s)`,
    };
  },
});
