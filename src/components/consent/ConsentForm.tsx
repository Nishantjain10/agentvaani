'use client';

import type { Customer } from '@/types/agentvaani';
import { useState } from 'react';
import { CUSTOMERS_COLLECTION_ID, DATABASE_ID, databases } from '@/libs/appwrite';

type ConsentFormProps = {
  customer: Customer;
};

export default function ConsentForm({ customer }: ConsentFormProps) {
  const [consent, setConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (consentGiven: boolean) => {
    setLoading(true);
    setError('');

    try {
      // Update customer consent status
      await databases.updateDocument(
        DATABASE_ID,
        CUSTOMERS_COLLECTION_ID,
        customer.$id,
        {
          opted_in: consentGiven,
          consent_record_id: `consent_${Date.now()}`,
          last_contacted_at: new Date().toISOString(),
        },
      );

      setConsent(consentGiven);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to record your response. Please try again.');
      console.error('Consent update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className={`mx-auto h-12 w-12 ${consent ? 'text-green-600' : 'text-blue-600'}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {consent
                  ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    )
                  : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    )}
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {consent ? 'Thank You!' : 'Understood'}
            </h2>
            <p className="mt-2 text-gray-600">
              {consent
                ? 'Your consent has been recorded. We may contact you about insurance products.'
                : 'Your preference has been recorded. We will not contact you.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Hello
            {customer.name}
          </h2>
          <p className="mt-2 text-gray-600">
            We would like your permission to contact you about insurance products and services.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-blue-800">What this means:</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• We may call or message you about insurance products</li>
              <li>• All communications will be professional and relevant</li>
              <li>• You can opt out at any time by replying STOP</li>
              <li>• Your information will be kept secure and private</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Yes, I Consent'}
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'No, Do Not Contact Me'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              This consent is for AgentVaani and our insurance partners only.
              We will never share your information with unauthorized third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
