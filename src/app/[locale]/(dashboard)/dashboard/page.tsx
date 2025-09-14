'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CallsList from '@/components/calls/CallsList';
import DashboardStats from '@/components/dashboard/DashboardStats';
import QuickActions from '@/components/dashboard/QuickActions';
import { authService, type AuthUser } from '@/libs/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          router.push('/sign-in');
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back,
            {' '}
            {user.name}
            . Here's your voice agent activity overview.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <QuickActions />
          </div>

          {/* Recent Calls */}
          <div className="lg:col-span-2">
            <CallsList />
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Compliance Reminder
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Remember to only call customers who have explicitly opted in. All calls are recorded for compliance and quality purposes.
                  Always start calls with the required consent disclaimer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
