import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { myFirstFunction } from './my-first-function/resource';
import { seoAnalyzer } from './seo-analyzer/resource';

/**
 * Complete SEO Analyzer Backend Configuration
 * @see https://docs.amplify.aws/react/build-a-backend/
 * 
 * Features included:
 * - Authentication (Email-based)
 * - Data (SEO Analysis storage, AI conversations)
 * - Storage (File uploads, reports)
 * - Functions (SEO analysis, custom logic)
 */
defineBackend({
  auth,
  data,
  storage,
  myFirstFunction,
  seoAnalyzer,
});
