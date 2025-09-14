'use client';

import type { Customer } from '@/types/agentvaani';
import { useEffect, useState } from 'react';
import { CUSTOMERS_COLLECTION_ID, DATABASE_ID, databases, functions } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

type ConsentManagementProps = {
  customerId?: string;
};

export default function ConsentManagement({ customerId }: ConsentManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [consentMethod, setConsentMethod] = useState<'sms' | 'call'>('sms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return;
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        [
          // Filter by worker_id and not opted in
          // Query syntax may vary based on Appwrite version
        ],
      );

      const customerList = response.documents as unknown as Customer[];
      // Filter for customers who haven't opted in yet
      const pendingConsent = customerList.filter(c => !c.opted_in);
      setCustomers(pendingConsent);

      if (customerId) {
        setSelectedCustomers([customerId]);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setError('Failed to load customers');
    }
  };

  const handleConsentRequest = async () => {
    if (selectedCustomers.length === 0) {
      setError('Please select at least one customer');
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

      // Use Appwrite Function for consent management
      const result = await functions.createExecution(
        'consent-manager',
        JSON.stringify({
          customerIds: selectedCustomers,
          method: consentMethod,
          userId: user.$id,
          workerName: user.name,
        }),
      );

      if (result.responseStatusCode !== 200) {
        throw new Error('Failed to send consent requests');
      }

      const response = JSON.parse(result.responseBody);
      setSuccess(`Consent requests sent to ${response.sent} customers`);

      // Refresh customer list
      await fetchCustomers();
      setSelectedCustomers([]);
    } catch (err: any) {
      setError(err.message || 'Failed to send consent requests');
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId],
    );
  };

  const selectAll = () => {
    setSelectedCustomers(customers.map(c => c.$id));
  };

  const clearSelection = () => {
    setSelectedCustomers([]);
  };

  return (
    <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Consent Management</h2>

      <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-800">Consent Collection Process</h3>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>
            •
            <strong>SMS:</strong>
            {' '}
            Sends a text message with a consent link
          </li>
          <li>
            •
            <strong>Call:</strong>
            {' '}
            Places a short verification call asking for consent
          </li>
          <li>• Only customers who explicitly consent will be eligible for agent calls</li>
          <li>• All consent interactions are logged for compliance</li>
        </ul>
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

      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Customers Pending Consent (
            {customers.length}
            )
          </h3>
          <div className="space-x-2">
            <button
              onClick={selectAll}
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
                No customers pending consent. Import customers first.
              </div>
            )
          : (
              <div className="rounded-md border border-gray-200">
                <div className="max-h-64 overflow-y-auto">
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
                        onChange={() => toggleCustomerSelection(customer.$id)}
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
              </div>
            )}
      </div>

      {customers.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Consent Collection Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="sms"
                  checked={consentMethod === 'sms'}
                  onChange={e => setConsentMethod(e.target.value as 'sms')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  SMS with consent link (recommended)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="call"
                  checked={consentMethod === 'call'}
                  onChange={e => setConsentMethod(e.target.value as 'call')}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Verification call (press 1 to consent)
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              {consentMethod === 'sms' ? 'SMS Template:' : 'Call Script:'}
            </h4>
            <p className="text-sm text-gray-600">
              {consentMethod === 'sms'
                ? 'Hi [Name], this is [Worker Name] from [Company]. Please confirm you allow us to contact you about insurance products by clicking: [CONSENT_LINK]. Reply STOP to opt out.'
                : 'Hi [Name], this is [Worker Name] from [Company]. We\'d like to contact you about insurance products. Press 1 to consent or hang up to decline. This call is recorded.'}
            </p>
          </div>

          <button
            onClick={handleConsentRequest}
            disabled={selectedCustomers.length === 0 || loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
          >
            {loading
              ? 'Sending Consent Requests...'
              : `Send Consent Requests (${selectedCustomers.length} selected)`}
          </button>
        </div>
      )}
    </div>
  );
}
