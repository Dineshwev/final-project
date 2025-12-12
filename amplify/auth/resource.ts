import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure authentication for SEO Analyzer
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    preferredUsername: {
      mutable: true,
      required: false,
    },
    profilePicture: {
      mutable: true,
      required: false,
    },
    website: {
      mutable: true,
      required: false,
    },
  },
  groups: ["admins", "premium-users", "basic-users"],
});
