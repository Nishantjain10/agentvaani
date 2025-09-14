'use client';

import { useEffect, useState } from 'react';
import { AGENTS_COLLECTION_ID, CALLS_COLLECTION_ID, CUSTOMERS_COLLECTION_ID, DATABASE_ID, databases } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

type DashboardStatsType = {
  totalCalls: number;
  successfulCalls: number;
  totalCustomers: number;
  optedInCustomers: number;
  activeAgents: number;
  callsToday: number;
};

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsType>({
    totalCalls: 0,
    successfulCalls: 0,
    totalCustomers: 0,
    optedInCustomers: 0,
    activeAgents: 0,
    callsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return;
      }

      // Fetch all relevant data
      const [callsResponse, customersResponse, agentsResponse] = await Promise.all([
        databases.listDocuments(DATABASE_ID, CALLS_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, CUSTOMERS_COLLECTION_ID),
        databases.listDocuments(DATABASE_ID, AGENTS_COLLECTION_ID),
      ]);

      const calls = callsResponse.documents;
      const customers = customersResponse.documents;
      const agents = agentsResponse.documents;

      // Filter by worker
      const workerCalls = calls.filter((call: any) => call.worker_id === user.$id);
      const workerCustomers = customers.filter((customer: any) => customer.worker_id === user.$id);
      const workerAgents = agents.filter((agent: any) => agent.worker_id === user.$id);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const callsToday = workerCalls.filter((call: any) =>
        call.call_start?.startsWith(today),
      ).length;

      const successfulCalls = workerCalls.filter((call: any) =>
        call.outcome === 'interested' || call.outcome === 'follow_up_required',
      ).length;

      const optedInCustomers = workerCustomers.filter((customer: any) =>
        customer.opted_in === true,
      ).length;

      setStats({
        totalCalls: workerCalls.length,
        successfulCalls,
        totalCustomers: workerCustomers.length,
        optedInCustomers,
        activeAgents: workerAgents.length,
        callsToday,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      title: 'Total Calls',
      value: stats.totalCalls,
      subtitle: `${stats.callsToday} today`,
      color: 'blue',
    },
    {
      title: 'Success Rate',
      value: stats.totalCalls > 0 ? `${Math.round((stats.successfulCalls / stats.totalCalls) * 100)}%` : '0%',
      subtitle: `${stats.successfulCalls} successful`,
      color: 'green',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      subtitle: `${stats.optedInCustomers} opted in`,
      color: 'purple',
    },
    {
      title: 'Active Agents',
      value: stats.activeAgents,
      subtitle: 'Voice agents',
      color: 'orange',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array.from({ length: 4 })].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white p-6 shadow">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="mb-2 h-8 w-1/2 rounded bg-gray-200"></div>
            <div className="h-3 w-2/3 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <div key={index} className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            </div>
            <div className={`bg- h-12 w-12 rounded-full${stat.color}-100 flex items-center justify-center`}>
              <div className={`bg- h-6 w-6${stat.color}-500 rounded`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
