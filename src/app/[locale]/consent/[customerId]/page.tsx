import type { Customer } from '@/types/agentvaani';
import { notFound } from 'next/navigation';
import ConsentForm from '@/components/consent/ConsentForm';
import { CUSTOMERS_COLLECTION_ID, DATABASE_ID, databases } from '@/libs/appwrite';

type ConsentPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function ConsentPage({ params }: ConsentPageProps) {
  const { customerId } = await params;

  try {
    // Get customer details
    const customer = await databases.getDocument(
      DATABASE_ID,
      CUSTOMERS_COLLECTION_ID,
      customerId,
    );

    if (customer.opted_in) {
      return (
        <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-green-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Already Consented</h2>
                <p className="mt-2 text-gray-600">
                  You have already provided consent for us to contact you.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            AgentVaani
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Consent for Communication
          </p>
        </div>

        <ConsentForm customer={customer as unknown as Customer} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching customer:', error);
    notFound();
  }
}
