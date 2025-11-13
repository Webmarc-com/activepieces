import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { b4aiUtilitiesAuth } from '../common/auth';
import { uploadApiCall } from '../common/client';
import { DeleteFileResponse } from '../common/types';

export const deleteFile = createAction({
  auth: b4aiUtilitiesAuth,
  name: 'delete_file',
  displayName: 'Delete File',
  description: 'Delete a file by its ID from Google Cloud Storage',
  props: {
    fileId: Property.ShortText({
      displayName: 'File ID',
      description: 'The UUID of the file to delete',
      required: true,
    }),
  },
  async run(context) {
    const { fileId } = context.propsValue;

    // Delete the file
    const response = await uploadApiCall<DeleteFileResponse>({
      method: HttpMethod.DELETE,
      endpoint: `/files/${fileId}`,
      auth: context.auth,
    });

    return {
      success: true,
      message: response.message || `File with ID "${fileId}" deleted successfully`,
    };
  },
});
