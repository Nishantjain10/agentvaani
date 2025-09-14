const { Client, Databases } = require('node-appwrite');

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68c6ec6e002cd04de194')
  .setKey('standard_2fc323115444cd8a98c7f0098af97be71f9f0d4fcc69e1ddd69507a7aad38221a52951200187da95c845562f69f7fc02342f2131812490a5047cba9d9c28bd3a69214c49e752f61de2ba6657a56536993344160ffa90218b57155f439070a493fbac7ac6ff94af9cddede79601bff8f83098b2f4a9a75f04064139b687b57614');

const databases = new Databases(client);
const DATABASE_ID = 'agentvaani_db';

async function fixBooleanAttributes() {
  try {
    console.log('🔧 Adding missing boolean attributes...');

    // Add phone_verified to workers collection
    try {
      await databases.createBooleanAttribute(
        DATABASE_ID,
        'workers',
        'phone_verified',
        true,
        false,
      );
      console.log('✅ Added phone_verified to workers');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ phone_verified already exists in workers');
      } else {
        console.error('❌ Error adding phone_verified:', error.message);
      }
    }

    // Add opted_in to customers collection
    try {
      await databases.createBooleanAttribute(
        DATABASE_ID,
        'customers',
        'opted_in',
        true,
        false,
      );
      console.log('✅ Added opted_in to customers');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ opted_in already exists in customers');
      } else {
        console.error('❌ Error adding opted_in:', error.message);
      }
    }

    // Add consent_request_sent to customers collection
    try {
      await databases.createBooleanAttribute(
        DATABASE_ID,
        'customers',
        'consent_request_sent',
        false,
        false,
      );
      console.log('✅ Added consent_request_sent to customers');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️ consent_request_sent already exists in customers');
      } else {
        console.error('❌ Error adding consent_request_sent:', error.message);
      }
    }

    console.log('🎉 Boolean attributes setup completed!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

fixBooleanAttributes();
