import { Account, Client, Databases, Functions, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { client };

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
export const WORKERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_WORKERS_COLLECTION_ID || '';
export const AGENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID || '';
export const CUSTOMERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CUSTOMERS_COLLECTION_ID || '';
export const CALLS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CALLS_COLLECTION_ID || '';
export const UPLOADS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_COLLECTION_ID || '';
export const SUPPRESSION_LIST_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SUPPRESSION_LIST_COLLECTION_ID || '';

// Storage Bucket IDs
export const RECORDINGS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_RECORDINGS_BUCKET_ID || '';
export const UPLOADS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID || '';
