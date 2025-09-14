'use client';

import type { Agent } from '@/types/agentvaani';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgentCard from '@/components/agents/AgentCard';
import { AGENTS_COLLECTION_ID, DATABASE_ID, databases } from '@/libs/appwrite';
import { authService, type AuthUser } from '@/libs/auth';

export default function AgentsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializePage = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          router.push('/sign-in');
          return;
        }
        setUser(currentUser);

        // Fetch agents
        try {
          const response = await databases.listDocuments(
            DATABASE_ID,
            AGENTS_COLLECTION_ID,
            [
              // Filter by worker_id (using user ID for now)
              // In production, you'd query the workers collection first to get the worker_id
            ],
          );
          setAgents(response.documents as unknown as Agent[]);
        } catch (error) {
          console.error('Failed to fetch agents:', error);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    initializePage();
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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Voice Agents</h1>
            <p className="mt-2 text-gray-600">
              Manage your AI voice agents for customer outreach
            </p>
          </div>
          <Link
            href="/dashboard/agents/create"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Create Agent
          </Link>
        </div>

        {agents.length === 0
          ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No agents yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first voice agent.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/agents/create"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Create Your First Agent
                  </Link>
                </div>
              </div>
            )
          : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {agents.map(agent => (
                  <AgentCard
                    key={agent.$id}
                    agent={agent}
                    onEdit={(agent) => {
                      // TODO: Implement edit functionality
                      console.warn('Edit agent not implemented:', agent);
                    }}
                    onDelete={(agentId) => {
                      // TODO: Implement delete functionality
                      console.warn('Delete agent not implemented:', agentId);
                    }}
                  />
                ))}
              </div>
            )}
      </div>
    </div>
  );
}
