import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod, HttpRequest } from '@activepieces/pieces-common';
import { b4aiUtilitiesAuth } from '../common/auth';

export const downloadFile = createAction({
  auth: b4aiUtilitiesAuth,
  name: 'download_file',
  displayName: 'Download File',
  description: 'Download a file by its ID and return it as base64-encoded data',
  props: {
    fileId: Property.ShortText({
      displayName: 'File ID',
      description: 'The UUID of the file to download',
      required: true,
    }),
  },
  async run(context) {
    const { fileId } = context.propsValue;
    const { baseUrl, apiKey, apiSecret } = context.auth;

    // Clean up base URL
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');

    // Build the download request
    const request: HttpRequest = {
      method: HttpMethod.GET,
      url: `${cleanBaseUrl}/api/upload/files/${fileId}/download`,
      headers: {
        'x-api-key': apiKey,
        'x-api-secret': apiSecret,
      },
    };

    try {
      // Download the file
      const response = await httpClient.sendRequest(request);

      // Get filename from Content-Disposition header if available
      const contentDispositionHeader = response.headers?.['content-disposition'];
      const contentDisposition = Array.isArray(contentDispositionHeader)
        ? contentDispositionHeader[0] || ''
        : contentDispositionHeader || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `file-${fileId}`;

      // Get content type
      const contentTypeHeader = response.headers?.['content-type'];
      const contentType = Array.isArray(contentTypeHeader)
        ? contentTypeHeader[0] || 'application/octet-stream'
        : contentTypeHeader || 'application/octet-stream';

      // Convert response to base64
      let base64Data: string;
      if (Buffer.isBuffer(response.body)) {
        base64Data = response.body.toString('base64');
      } else if (typeof response.body === 'string') {
        base64Data = Buffer.from(response.body).toString('base64');
      } else {
        base64Data = Buffer.from(JSON.stringify(response.body)).toString('base64');
      }

      return {
        success: true,
        file: {
          filename,
          contentType,
          base64: base64Data,
          size: base64Data.length,
        },
        message: `File "${filename}" downloaded successfully`,
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.error || error.message || '';

      if (statusCode === 404) {
        throw new Error(`File not found: ${errorMessage || 'The requested file does not exist'}`);
      } else if (statusCode === 401) {
        throw new Error('Authentication Failed: Invalid API credentials');
      } else {
        throw new Error(`Download failed: ${errorMessage || error.message || 'Unknown error occurred'}`);
      }
    }
  },
});
