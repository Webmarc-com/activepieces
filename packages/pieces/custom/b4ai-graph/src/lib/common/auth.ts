import { PieceAuth, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { graphApiCall } from './client';

export const graphAuth = PieceAuth.CustomAuth({
  description: `**B4AI Graph API Authentication**

To obtain your API credentials:

1. Log in to your B4AI platform
2. Navigate to Settings > API Keys
3. Generate a new API key pair (key + secret)
4. Copy both the API Key and API Secret
5. Enter your B4AI server base URL (e.g., https://your-server.com)

Note: Both API Key and API Secret are required for authentication.
  `,
  props: {
    baseUrl: Property.ShortText({
      displayName: 'Base URL',
      description: 'Your B4AI server base URL (e.g., https://your-server.com)',
      required: true,
    }),
    apiKey: PieceAuth.SecretText({
      displayName: 'API Key',
      description: 'Your B4AI API Key',
      required: true,
    }),
    apiSecret: PieceAuth.SecretText({
      displayName: 'API Secret',
      description: 'Your B4AI API Secret',
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      // Validate credentials by listing node types
      await graphApiCall({
        method: HttpMethod.GET,
        endpoint: '/graph-node-types',
        auth: auth as any,
        query: { page: 1, pageSize: 1 },
      });

      return {
        valid: true,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid API credentials. Please check your API Key, Secret, and Base URL.',
      };
    }
  },
  required: true,
});

export type GraphAuth = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
};
