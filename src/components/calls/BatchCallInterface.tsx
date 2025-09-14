'use client';

import type { Agent, Customer } from '@/types/agentvaani';
import { useEffect, useState } from 'react';
import { AGENTS_COLLECTION_ID, CUSTOMERS_COLLECTION_ID, DATABASE_ID, databases, functions } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

export default function BatchCallInterface() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<Array<{ phone_number_id: string; phone_number: string }>>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return;
      }

      // Fetch opted-in customers
      const customersResponse = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        [
          // Filter by worker_id and opted_in = true
        ],
      );

      // Fetch user's agents
      const agentsResponse = await databases.listDocuments(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        [
          // Filter by worker_id
        ],
      );

      const customerList = customersResponse.documents as unknown as Customer[];
      const agentList = agentsResponse.documents as unknown as Agent[];

      // Filter for opted-in customers only
      const optedInCustomers = customerList.filter(c => c.opted_in);

      setCustomers(optedInCustomers);
      setAgents(agentList);

      // Fetch ElevenLabs phone numbers
      await fetchPhoneNumbers();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data');
    }
  };

  const fetchPhoneNumbers = async () => {
    try {
      // Use Appwrite Function to get ElevenLabs phone numbers
      const result = await functions.createExecution(
        'elevenlabs-manager',
        JSON.stringify({
          action: 'get_phone_numbers',
        }),
      );

      if (result.responseStatusCode === 200) {
        const response = JSON.parse(result.responseBody);
        setPhoneNumbers(response.phone_numbers);
      }
    } catch (error) {
      console.error('Failed to fetch phone numbers:', error);
    }
  };

  const handleCustomerToggle = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId],
    );
  };

  const selectAllCustomers = () => {
    setSelectedCustomers(customers.map(c => c.$id));
  };

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  const startBatchCall = async () => {
    if (!selectedAgent || !selectedPhoneNumber || selectedCustomers.length === 0 || !batchName) {
      setError('Please fill in all fields and select at least one customer');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare recipients data
      const recipients = selectedCustomers.map((customerId) => {
        const customer = customers.find(c => c.$id === customerId);
        return {
          phone_number: customer?.phone_e164 || '',
          customer_name: customer?.name || '',
          customer_id: customerId,
          worker_name: user.name,
        };
      });

      // Create batch call using Appwrite Function
      const result = await functions.createExecution(
        'elevenlabs-manager',
        JSON.stringify({
          action: 'create_batch_call',
          batch_name: batchName,
          agent_id: selectedAgent,
          phone_number_id: selectedPhoneNumber,
          recipients,
          user_id: user.$id,
        }),
      );

      if (result.responseStatusCode === 200) {
        const response = JSON.parse(result.responseBody);
        setSuccess(`Batch call "${batchName}" created successfully! Batch ID: ${response.batch_id}`);

        // Reset form
        setBatchName('');
        setSelectedAgent('');
        setSelectedPhoneNumber('');
        setSelectedCustomers([]);
      } else {
        throw new Error('Failed to create batch call');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create batch call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Create Batch Call Campaign</h2>

      <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-800">ElevenLabs Batch Calling</h3>
        <p className="text-sm text-blue-700">
          This uses ElevenLabs' native batch calling feature to simultaneously call multiple customers
          with your AI voice agent. All calls are handled by ElevenLabs infrastructure.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded border border-green-400 bg-green-100 p-3 text-green-700">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Batch Configuration */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="batchName" className="block text-sm font-medium text-gray-700">
              Campaign Name
            </label>
            <input
              type="text"
              id="batchName"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              placeholder="e.g., Insurance Follow-up Campaign"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <select
              id="phoneNumber"
              value={selectedPhoneNumber}
              onChange={e => setSelectedPhoneNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select phone number...</option>
              {phoneNumbers.map(phone => (
                <option key={phone.phone_number_id} value={phone.phone_number_id}>
                  {phone.phone_number}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="agent" className="block text-sm font-medium text-gray-700">
            Voice Agent
          </label>
          <select
            id="agent"
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Choose an agent...</option>
            {agents.map(agent => (
              <option key={agent.$id} value={agent.elevenlabs_agent_id || agent.$id}>
                {agent.name}
                {' '}
                (
                {agent.language}
                )
              </option>
            ))}
          </select>
        </div>

        {/* Customer Selection */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Select Customers (
              {customers.length}
              {' '}
              opted-in)
            </h3>
            <div className="space-x-2">
              <button
                onClick={selectAllCustomers}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {customers.length === 0
            ? (
                <div className="py-8 text-center text-gray-500">
                  No opted-in customers available. Import customers and collect consent first.
                </div>
              )
            : (
                <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200">
                  {customers.map(customer => (
                    <div
                      key={customer.$id}
                      className={`flex items-center border-b border-gray-100 p-3 hover:bg-gray-50 ${
                        selectedCustomers.includes(customer.$id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.$id)}
                        onChange={() => handleCustomerToggle(customer.$id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.phone_e164}</p>
                        {customer.tags.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {customer.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>

        {/* Submit Button */}
        <button
          onClick={startBatchCall}
          disabled={!selectedAgent || !selectedPhoneNumber || selectedCustomers.length === 0 || !batchName || loading}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Creating Batch Call...' : `Start Batch Call (${selectedCustomers.length} customers)`}
        </button>
      </div>

      <div className="mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-yellow-800">⚠️ Important Notes</h3>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>• Only customers who have explicitly opted in are shown</li>
          <li>• All calls will start with a consent disclaimer</li>
          <li>• Calls are handled by ElevenLabs infrastructure</li>
          <li>• You can monitor progress in the ElevenLabs dashboard</li>
          <li>• Billing is handled by ElevenLabs per their pricing</li>
        </ul>
      </div>
    </div>
  );
}
