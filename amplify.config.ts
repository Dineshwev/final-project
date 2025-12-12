import { defineConfig } from '@aws-amplify/backend';

export const amplifyConfig = defineConfig({
  platform: 'react',
  version: '6',
  dependencies: {
    '@aws-amplify/backend': '^1.19.0',
    'aws-amplify': '^6.15.9'
  }
});