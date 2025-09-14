'use client';

import { useEffect, useState } from 'react';
import { functions } from '@/libs/appwrite';

type BatchCall = {
  batch_id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_recipients: number;
  completed_calls: number;
  successful_calls: number;
  created_at: string;
};

type CallDetail = {
  phone_number: string;
  customer_name: string;
  status: 'pending' | 'calling' | 'completed' | 'failed' | 'no_answer';
  duration?: number;
  outcome?: string;
  conversation_id?: string;
};

export default function BatchCallMonitor() {
  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchCall | null>(null);
  const [callDetails, setCallDetails] = useState<CallDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBatchCalls();
    const interval = setInterval(fetchBatchCalls, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBatchCalls = async () => {
    try {
      const result = await functions.createExecution(
        'elevenlabs-manager',
        JSON.stringify({
          action: 'list_batch_calls',
        }),
      );

      if (result.responseStatusCode === 200) {
        const response = JSON.parse(result.responseBody);
        setBatchCalls(response.batch_calls);
      }
    } catch (error) {
      console.error('Failed to fetch batch calls:', error);
      setError('Failed to load batch calls');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetails = async (batchId: string) => {
    try {
      const result = await functions.createExecution(
        'elevenlabs-manager',
        JSON.stringify({
          action: 'get_batch_call',
          batch_id: batchId,
        }),
      );

      if (result.responseStatusCode === 200) {
        const response = JSON.parse(result.responseBody);
        setCallDetails(response.call_details || []);
      }
    } catch (error) {
      console.error('Failed to fetch batch details:', error);
    }
  };

  const handleBatchSelect = (batch: BatchCall) => {
    setSelectedBatch(batch);
    fetchBatchDetails(batch.batch_id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'calling':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'no_answer':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[...Array.from({ length: 3 })].map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="mb-6 text-2xl font-bold">Batch Call Monitor</h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Batch Calls List */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Batch Calls</h3>
          </div>

          {batchCalls.length === 0
            ? (
                <div className="p-6 text-center text-gray-500">
                  No batch calls found. Create your first batch call to get started.
                </div>
              )
            : (
                <div className="divide-y divide-gray-200">
                  {batchCalls.map(batch => (
                    <div
                      key={batch.batch_id}
                      className={`cursor-pointer p-6 hover:bg-gray-50 ${
                        selectedBatch?.batch_id === batch.batch_id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleBatchSelect(batch)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{batch.name}</h4>
                          <p className="text-sm text-gray-500">
                            {batch.completed_calls}
                            /
                            {batch.total_recipients}
                            {' '}
                            calls completed
                          </p>
                          <p className="text-xs text-gray-400">
                            Created
                            {' '}
                            {new Date(batch.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(batch.status)}`}>
                            {batch.status}
                          </span>
                          {batch.status === 'running' && (
                            <div className="h-2 w-16 rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${(batch.completed_calls / batch.total_recipients) * 100}%` }}
                              >
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>

        {/* Batch Details */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedBatch ? `${selectedBatch.name} Details` : 'Select a Batch Call'}
            </h3>
          </div>

          {selectedBatch
            ? (
                <div className="p-6">
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(selectedBatch.status)}`}>
                        {selectedBatch.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Progress:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedBatch.completed_calls}
                        /
                        {selectedBatch.total_recipients}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Success Rate:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedBatch.completed_calls > 0
                          ? `${Math.round((selectedBatch.successful_calls / selectedBatch.completed_calls) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Batch ID:</span>
                      <span className="ml-2 font-mono text-xs text-gray-600">
                        {selectedBatch.batch_id}
                      </span>
                    </div>
                  </div>

                  {callDetails.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-900">Individual Calls</h4>
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {callDetails.map((call, index) => (
                          <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{call.customer_name}</p>
                              <p className="text-xs text-gray-500">{call.phone_number}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${getCallStatusColor(call.status)}`}>
                                {call.status}
                              </span>
                              {call.duration && (
                                <span className="text-xs text-gray-500">
                                  {Math.floor(call.duration / 60)}
                                  :
                                  {(call.duration % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            : (
                <div className="p-6 text-center text-gray-500">
                  Select a batch call from the list to view details
                </div>
              )}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-800">Real-time Monitoring</h3>
        <p className="text-sm text-blue-700">
          This dashboard automatically refreshes every 30 seconds to show the latest status.
          For detailed analytics and recordings, visit the ElevenLabs dashboard.
        </p>
      </div>
    </div>
  );
}
