import { NextResponse } from 'next/server';
import { AGENTS_COLLECTION_ID, DATABASE_ID, databases } from '@/libs/appwrite';

export async function GET() {
  try {
    // Test database connection by listing documents from agents collection
    const response = await databases.listDocuments(DATABASE_ID, AGENTS_COLLECTION_ID);

    return NextResponse.json({
      success: true,
      message: 'Appwrite connection successful',
      agents_count: response.total,
    });
  } catch (error) {
    console.error('Appwrite connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
