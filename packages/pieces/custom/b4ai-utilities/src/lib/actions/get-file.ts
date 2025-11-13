import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { b4aiUtilitiesAuth } from '../common/auth';
import { uploadApiCall } from '../common/client';
import { FileUploadResponse } from '../common/types';

export const getFile = createAction({
  auth: b4aiUtilitiesAuth,
  name: 'get_file',
  displayName: 'Get File Details',
  description: 'Get detailed information about a specific file by its ID',
  props: {
    fileId: Property.ShortText({
      displayName: 'File ID',
      description: 'The UUID of the file to retrieve',
      required: true,
    }),
  },
  async run(context) {
    const { fileId } = context.propsValue;

    // Get file details
    const response = await uploadApiCall<FileUploadResponse>({
      method: HttpMethod.GET,
      endpoint: `/files/${fileId}`,
      auth: context.auth,
    });

    return {
      success: true,
      fileUpload: response.fileUpload,
      message: `Retrieved details for file "${response.fileUpload.originalName}"`,
    };
  },
});
