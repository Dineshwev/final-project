import { defineFunction } from "@aws-amplify/backend";

export const seoAnalyzer = defineFunction({
  name: "seo-analyzer",
  entry: "./handler.ts",
  environment: {
    REACT_APP_API_BASE_URL: "https://zp9kzmug2t.ap-southeast-2.awsapprunner.com"
  }
});