import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== SEO ANALYZER SCHEMA =====================================================
This schema defines the data models for the SEO Analyzer application.
It includes:
- SEO Analysis results storage
- User profiles and settings
- AI conversation capability for SEO recommendations
=========================================================================*/

const schema = a.schema({
  // SEO Analysis Results
  SeoAnalysis: a
    .model({
      url: a.string().required(),
      title: a.string(),
      description: a.string(),
      keywords: a.string().array(),
      score: a.integer(),
      issues: a.string().array(),
      recommendations: a.string().array(),
      analyzedAt: a.datetime(),
      userId: a.id(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
    ]),

  // User Settings
  UserSettings: a
    .model({
      userId: a.id().required(),
      preferences: a.json(),
      apiKeys: a.json(),
      subscriptionTier: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  // AI Conversation for SEO advice
  SeoConversation: a.conversation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: 'You are an expert SEO consultant. Help users improve their website SEO by providing actionable insights and recommendations.',
    inferenceConfiguration: {
      maxTokens: 1000,
      temperature: 0.7,
    },
  }),

  // AI Generation for SEO content
  SeoContentGeneration: a.generation({
    aiModel: a.ai.model('Claude 3.5 Sonnet'),
    systemPrompt: 'You are an SEO content specialist. Generate SEO-optimized content including meta titles, descriptions, and content suggestions.',
  }),

  // Legacy Todo model (keeping for compatibility)
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    identityPoolAuthorizationMode: 'identityPool',
  },
});

/*== USAGE EXAMPLES ======================================================
Frontend usage examples for the SEO Analyzer:

// SEO Analysis CRUD
const client = generateClient<Schema>();

// Create new analysis
const newAnalysis = await client.models.SeoAnalysis.create({
  url: 'https://example.com',
  title: 'Example Site',
  score: 85,
  analyzedAt: new Date().toISOString()
});

// AI Conversation for SEO advice
const conversation = await client.conversations.SeoConversation.create();
const response = await conversation.sendMessage('How can I improve my website SEO?');

// AI Content Generation
const content = await client.generations.SeoContentGeneration.create({
  description: 'Generate meta description for a blog about web performance'
});
=========================================================================*/
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
