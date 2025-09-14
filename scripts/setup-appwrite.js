const { Client, Databases, Storage, Permission, Role } = require('node-appwrite');

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68c6ec6e002cd04de194')
  .setKey('standard_2fc323115444cd8a98c7f0098af97be71f9f0d4fcc69e1ddd69507a7aad38221a52951200187da95c845562f69f7fc02342f2131812490a5047cba9d9c28bd3a69214c49e752f61de2ba6657a56536993344160ffa90218b57155f439070a493fbac7ac6ff94af9cddede79601bff8f83098b2f4a9a75f04064139b687b57614');

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = 'agentvaani_db';

async function setupAppwrite() {
  try {
    console.log('🚀 Setting up AgentVaani database and collections...');

    // Create database
    try {
      await databases.create(DATABASE_ID, 'AgentVaani Database');
      console.log('✅ Database created successfully');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ Database already exists');
      } else {
        throw error;
      }
    }

    // Create collections
    const collections = [
      {
        id: 'workers',
        name: 'Workers',
        attributes: [
          { key: 'name', type: 'string', size: 255, required: true },
          { key: 'email', type: 'string', size: 255, required: true },
          { key: 'phone', type: 'string', size: 20, required: false },
          { key: 'phone_verified', type: 'boolean', required: true, default: false },
          { key: 'role', type: 'string', size: 100, required: true },
          { key: 'city', type: 'string', size: 100, required: true },
          { key: 'company', type: 'string', size: 255, required: false },
          { key: 'appwrite_user_id', type: 'string', size: 255, required: true },
          { key: 'created_at', type: 'datetime', required: true },
        ],
      },
      {
        id: 'agents',
        name: 'Voice Agents',
        attributes: [
          { key: 'worker_id', type: 'string', size: 255, required: true },
          { key: 'name', type: 'string', size: 255, required: true },
          { key: 'elevenlabs_agent_id', type: 'string', size: 255, required: true },
          { key: 'voice_id', type: 'string', size: 255, required: true },
          { key: 'description', type: 'string', size: 1000, required: false },
          { key: 'system_prompt', type: 'string', size: 5000, required: true },
          { key: 'first_message', type: 'string', size: 1000, required: true },
          { key: 'language', type: 'string', size: 50, required: true },
          { key: 'created_at', type: 'datetime', required: true },
        ],
      },
      {
        id: 'customers',
        name: 'Customers',
        attributes: [
          { key: 'worker_id', type: 'string', size: 255, required: true },
          { key: 'name', type: 'string', size: 255, required: true },
          { key: 'phone_e164', type: 'string', size: 20, required: true },
          { key: 'opted_in', type: 'boolean', required: true, default: false },
          { key: 'consent_record_id', type: 'string', size: 255, required: false },
          { key: 'last_contacted_at', type: 'datetime', required: false },
          { key: 'tags', type: 'string', size: 100, required: false, array: true },
          { key: 'consent_request_sent', type: 'boolean', required: false, default: false },
          { key: 'consent_request_method', type: 'string', size: 20, required: false },
          { key: 'consent_request_timestamp', type: 'datetime', required: false },
          { key: 'created_at', type: 'datetime', required: true },
        ],
      },
      {
        id: 'calls',
        name: 'Calls',
        attributes: [
          { key: 'customer_id', type: 'string', size: 255, required: true },
          { key: 'agent_id', type: 'string', size: 255, required: true },
          { key: 'worker_id', type: 'string', size: 255, required: true },
          { key: 'call_start', type: 'datetime', required: true },
          { key: 'call_end', type: 'datetime', required: false },
          { key: 'recording_url', type: 'string', size: 500, required: false },
          { key: 'transcript', type: 'string', size: 50000, required: false },
          { key: 'outcome', type: 'string', size: 50, required: false },
          { key: 'raw_metadata', type: 'string', size: 10000, required: false },
        ],
      },
      {
        id: 'uploads',
        name: 'Uploads',
        attributes: [
          { key: 'owner_id', type: 'string', size: 255, required: true },
          { key: 'file_url', type: 'string', size: 500, required: true },
          { key: 'filename', type: 'string', size: 255, required: true },
          { key: 'parsed_text', type: 'string', size: 100000, required: false },
          { key: 'keywords', type: 'string', size: 100, required: false, array: true },
          { key: 'metadata', type: 'string', size: 5000, required: false },
          { key: 'created_at', type: 'datetime', required: true },
        ],
      },
      {
        id: 'suppression_list',
        name: 'Suppression List',
        attributes: [
          { key: 'phone_e164', type: 'string', size: 20, required: true },
          { key: 'reason', type: 'string', size: 255, required: true },
          { key: 'added_by', type: 'string', size: 255, required: true },
          { key: 'added_at', type: 'datetime', required: true },
        ],
      },
      {
        id: 'batch_calls',
        name: 'Batch Calls',
        attributes: [
          { key: 'user_id', type: 'string', size: 255, required: true },
          { key: 'elevenlabs_batch_id', type: 'string', size: 255, required: true },
          { key: 'name', type: 'string', size: 255, required: true },
          { key: 'agent_id', type: 'string', size: 255, required: true },
          { key: 'phone_number_id', type: 'string', size: 255, required: true },
          { key: 'total_recipients', type: 'integer', required: true },
          { key: 'status', type: 'string', size: 50, required: true },
          { key: 'created_at', type: 'datetime', required: true },
        ],
      },
    ];

    for (const collection of collections) {
      try {
        await databases.createCollection(
          DATABASE_ID,
          collection.id,
          collection.name,
          [
            Permission.read(Role.user()),
            Permission.create(Role.user()),
            Permission.update(Role.user()),
            Permission.delete(Role.user()),
          ],
        );
        console.log(`✅ Collection '${collection.name}' created`);

        // Add attributes
        for (const attr of collection.attributes) {
          try {
            if (attr.type === 'string') {
              await databases.createStringAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.size,
                attr.required,
                attr.default,
                attr.array || false,
              );
            } else if (attr.type === 'boolean') {
              await databases.createBooleanAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.default,
                attr.array || false,
              );
            } else if (attr.type === 'datetime') {
              await databases.createDatetimeAttribute(
                DATABASE_ID,
                collection.id,
                attr.key,
                attr.required,
                attr.default,
                attr.array || false,
              );
            }
            console.log(`  ✅ Attribute '${attr.key}' added`);
          } catch (attrError) {
            if (attrError.code === 409) {
              console.log(`  ℹ️ Attribute '${attr.key}' already exists`);
            } else {
              console.error(`  ❌ Error creating attribute '${attr.key}':`, attrError.message);
            }
          }
        }
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Collection '${collection.name}' already exists`);
        } else {
          console.error(`❌ Error creating collection '${collection.name}':`, error.message);
        }
      }
    }

    // Create storage buckets
    const buckets = [
      { id: 'recordings', name: 'Call Recordings' },
      { id: 'uploads', name: 'Document Uploads' },
    ];

    for (const bucket of buckets) {
      try {
        await storage.createBucket(
          bucket.id,
          bucket.name,
          [
            Permission.read(Role.user()),
            Permission.create(Role.user()),
            Permission.update(Role.user()),
            Permission.delete(Role.user()),
          ],
          false, // fileSecurity
          true, // enabled
          100 * 1024 * 1024, // 100MB max file size
          ['pdf', 'mp3', 'wav', 'txt'], // allowed file extensions
          'none', // compression
          false, // encryption
          false, // antivirus
        );
        console.log(`✅ Storage bucket '${bucket.name}' created`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`ℹ️ Storage bucket '${bucket.name}' already exists`);
        } else {
          console.error(`❌ Error creating bucket '${bucket.name}':`, error.message);
        }
      }
    }

    console.log('\n🎉 AgentVaani setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Visit the application and create your first worker account');
    console.log('3. Configure Twilio credentials for SMS/voice functionality');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupAppwrite();
