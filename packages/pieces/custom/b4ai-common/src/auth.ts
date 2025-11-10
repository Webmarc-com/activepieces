import { PieceAuth, Property } from '@activepieces/pieces-framework';
import { HttpMethod } from '@activepieces/pieces-common';
import { surfsiteApiCall } from './client';

export const b4aiAuth = PieceAuth.CustomAuth({
  description: `**Surfsite API Authentication**

To obtain your Surfsite API key:

1. Log in to your Surfsite account at https://api.surfsite.ai
2. Navigate to Settings > API Keys
3. Generate a new API key or copy an existing one
4. Paste the API key below

Note: Keep your API key secure and do not share it publicly.
  `,
  props: {
    apiKey: PieceAuth.SecretText({
      displayName: 'API Key',
      description: 'Your Surfsite API key',
      required: true,
    }),
    environment: Property.StaticDropdown({
      displayName: 'Environment',
      description: 'Select the environment to connect to',
      required: false,
      defaultValue: 'production',
      options: {
        options: [
          {
            label: 'Production',
            value: 'production',
          },
          {
            label: 'Staging',
            value: 'staging',
          },
        ],
      },
    }),
  },
  validate: async ({ auth }) => {
    try {
      // Validate the API key by making a simple API call
      await surfsiteApiCall({
        method: HttpMethod.GET,
        auth: auth as any,
        resourceUri: '/v1/user',
      });

      return {
        valid: true,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid API key. Please check your credentials.',
      };
    }
  },
  required: true,
});

export type B4AIAuth = {
  apiKey: string;
  environment?: 'production' | 'staging';
};
