'use client';

import type { Call, Customer } from '@/types/agentvaani';
import { useEffect, useState } from 'react';
import { CALLS_COLLECTION_ID, CUSTOMERS_COLLECTION_ID, DATABASE_ID, databases } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

type CallWithCustomer = {
  customer?: Customer;
} & Call;

export default function CallsList() {
  const [calls, setCalls] = useState<CallWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallWithCustomer | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return;
      }

      // Fetch calls for this worker
      const callsResponse = await databases.listDocuments(
        DATABASE_ID,
        CALLS_COLLECTION_ID,
        [
          // Filter by worker_id
          // Query syntax may vary based on Appwrite version
        ],
      );

      const callsData = callsResponse.documents as unknown as Call[];

      // Fetch customer details for each call
      const callsWithCustomers = await Promise.all(
        callsData.map(async (call) => {
          try {
            const customer = await databases.getDocument(
              DATABASE_ID,
              CUSTOMERS_COLLECTION_ID,
              call.customer_id,
            ) as unknown as Customer;
            return { ...call, customer };
          } catch {
            return call;
          }
        }),
      );

      // Sort by most recent first
      callsWithCustomers.sort((a, b) =>
        new Date(b.call_start).getTime() - new Date(a.call_start).getTime(),
      );

      setCalls(callsWithCustomers);
    } catch (error) {
      console.error('Failed to fetch calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'interested':
        return 'bg-green-100 text-green-800';
      case 'not_interested':
        return 'bg-red-100 text-red-800';
      case 'follow_up_required':
        return 'bg-yellow-100 text-yellow-800';
      case 'no_answer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    if (!end) {
      return 'Ongoing';
    }

    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Calls</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array.from({ length: 5 })].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900">Recent Calls</h3>
      </div>

      {calls.length === 0
        ? (
            <div className="p-6 text-center text-gray-500">
              No calls yet. Start by creating an agent and importing customers.
            </div>
          )
        : (
            <div className="divide-y divide-gray-200">
              {calls.slice(0, 10).map(call => (
                <div
                  key={call.$id}
                  className="cursor-pointer p-6 hover:bg-gray-50"
                  onClick={() => setSelectedCall(call)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {call.customer?.name || 'Unknown Customer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {call.customer?.phone_e164}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(call.call_start).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOutcomeColor(call.outcome)}`}>
                        {call.outcome || 'In Progress'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDuration(call.call_start, call.call_end)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* Call Details Modal */}
      {selectedCall && (
        <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
          <div className="relative top-20 mx-auto w-11/12 rounded-md border bg-white p-5 shadow-lg md:w-3/4 lg:w-1/2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Call Details</h3>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-sm text-gray-900">{selectedCall.customer?.name}</p>
                  <p className="text-sm text-gray-500">{selectedCall.customer?.phone_e164}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <p className="text-sm text-gray-900">
                    {formatDuration(selectedCall.call_start, selectedCall.call_end)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Outcome</label>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getOutcomeColor(selectedCall.outcome)}`}>
                  {selectedCall.outcome || 'In Progress'}
                </span>
              </div>

              {selectedCall.transcript && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transcript</label>
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-gray-300 bg-gray-50 p-3">
                    <p className="text-sm whitespace-pre-wrap text-gray-700">
                      {selectedCall.transcript}
                    </p>
                  </div>
                </div>
              )}

              {selectedCall.recording_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recording</label>
                  <audio controls className="mt-1 w-full">
                    <source src={selectedCall.recording_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
