import { NextResponse } from 'next/server';
import { authService } from '@/libs/auth';

export async function POST() {
  try {
    await authService.clearAllSessions();
    return NextResponse.json({ success: true, message: 'All sessions cleared' });
  } catch (error) {
    console.warn('Error clearing sessions:', error);
    return NextResponse.json({ success: true, message: 'Sessions cleared (if any existed)' });
  }
}

