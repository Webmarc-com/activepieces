import { createAction, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { b4aiUtilitiesAuth } from '../common/auth';
import { uploadApiCall } from '../common/client';
import { FileUploadResponse } from '../common/types';
import FormData from 'form-data';

export const uploadFile = createAction({
  auth: b4aiUtilitiesAuth,
  name: 'upload_file',
  displayName: 'Upload File',
  description: 'Upload a file to Google Cloud Storage via B4AI Upload API',
  props: {
    file: Property.File({
      displayName: 'File',
      description: 'The file to upload',
      required: true,
    }),
  },
  async run(context) {
    const { file } = context.propsValue;

    // Create FormData for multipart upload
    const formData = new FormData();

    // Append file data as a Buffer with the original filename
    formData.append('file', file.data, {
      filename: file.filename,
      contentType: file.extension ? `application/${file.extension}` : 'application/octet-stream',
    });

    // Upload the file with proper FormData headers
    const response = await uploadApiCall<FileUploadResponse>({
      method: HttpMethod.POST,
      endpoint: '/files',
      auth: context.auth,
      body: formData,
      isMultipart: true,
      formDataHeaders: formData.getHeaders(), // Get proper multipart headers with boundary
    });

    return {
      success: true,
      fileUpload: response.fileUpload,
      message: `File "${file.filename}" uploaded successfully`,
    };
  },
});
