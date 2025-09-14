// const fs = require('node:fs');
// const path = require('node:path');
const { Client, Functions } = require('node-appwrite');

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68c6ec6e002cd04de194')
  .setKey('standard_2fc323115444cd8a98c7f0098af97be71f9f0d4fcc69e1ddd69507a7aad38221a52951200187da95c845562f69f7fc02342f2131812490a5047cba9d9c28bd3a69214c49e752f61de2ba6657a56536993344160ffa90218b57155f439070a493fbac7ac6ff94af9cddede79601bff8f83098b2f4a9a75f04064139b687b57614');

const functions = new Functions(client);

const functionConfigs = [
  {
    id: 'parse-file',
    name: 'Parse File Function',
    runtime: 'node-18.0',
    path: './appwrite-functions/parse-file',
    entrypoint: 'src/main.js',
    variables: {
      GEMINI_API_KEY: 'your_gemini_api_key',
      DATABASE_ID: 'agentvaani_db',
      UPLOADS_COLLECTION_ID: 'uploads',
      UPLOADS_BUCKET_ID: 'uploads',
    },
  },
  {
    id: 'consent-manager',
    name: 'Consent Manager Function',
    runtime: 'node-18.0',
    path: './appwrite-functions/consent-manager',
    entrypoint: 'src/main.js',
    variables: {
      DATABASE_ID: 'agentvaani_db',
      CUSTOMERS_COLLECTION_ID: 'customers',
      TWILIO_ACCOUNT_SID: 'your_twilio_account_sid',
      TWILIO_AUTH_TOKEN: 'your_twilio_auth_token',
      TWILIO_PHONE_NUMBER: 'your_twilio_phone_number',
      APP_URL: 'https://your-app-url.com',
    },
  },
  {
    id: 'call-orchestrator',
    name: 'Call Orchestrator Function',
    runtime: 'node-18.0',
    path: './appwrite-functions/call-orchestrator',
    entrypoint: 'src/main.js',
    variables: {
      GEMINI_API_KEY: 'your_gemini_api_key',
      DATABASE_ID: 'agentvaani_db',
      CUSTOMERS_COLLECTION_ID: 'customers',
      AGENTS_COLLECTION_ID: 'agents',
      CALLS_COLLECTION_ID: 'calls',
      UPLOADS_COLLECTION_ID: 'uploads',
      TWILIO_ACCOUNT_SID: 'your_twilio_account_sid',
      TWILIO_AUTH_TOKEN: 'your_twilio_auth_token',
      TWILIO_PHONE_NUMBER: 'your_twilio_phone_number',
      ELEVENLABS_API_KEY: 'your_elevenlabs_api_key',
      APP_URL: 'https://your-app-url.com',
    },
  },
  {
    id: 'transcript-analyzer',
    name: 'Transcript Analyzer Function',
    runtime: 'node-18.0',
    path: './appwrite-functions/transcript-analyzer',
    entrypoint: 'src/main.js',
    variables: {
      GEMINI_API_KEY: 'your_gemini_api_key',
      DATABASE_ID: 'agentvaani_db',
      CALLS_COLLECTION_ID: 'calls',
    },
  },
];

async function deployFunctions() {
  try {
    console.log('🚀 Deploying Appwrite Functions...');

    for (const config of functionConfigs) {
      try {
        // Create function
        const func = await functions.create(
          config.id,
          config.name,
          config.runtime,
          [], // execute permissions (empty for now)
          [], // events
          '', // schedule
          30, // timeout
          true, // enabled
        );

        console.log(`✅ Function '${config.name}' created with ID: ${func.$id}`);

        // Set environment variables
        for (const [key, value] of Object.entries(config.variables)) {
          try {
            await functions.createVariable(config.id, key, value);
            console.log(`  ✅ Variable '${key}' set`);
          } catch (varError) {
            if (varError.code === 409) {
              console.log(`  ℹ️ Variable '${key}' already exists`);
            } else {
              console.error(`  ❌ Error setting variable '${key}':`, varError.message);
            }
          }
        }

        console.log(`📁 Function '${config.name}' configured. Deploy code manually via Appwrite Console.`);
        console.log(`   Path: ${config.path}`);
        console.log(`   Entrypoint: ${config.entrypoint}`);
        console.log('');
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Function '${config.name}' already exists`);
        } else {
          console.error(`❌ Error creating function '${config.name}':`, error.message);
        }
      }
    }

    console.log('🎉 Function deployment setup completed!');
    console.log('\nNext steps:');
    console.log('1. Go to Appwrite Console > Functions');
    console.log('2. For each function, upload the corresponding folder as a tar.gz');
    console.log('3. Update environment variables with your actual API keys');
    console.log('4. Deploy the functions');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

deployFunctions();
