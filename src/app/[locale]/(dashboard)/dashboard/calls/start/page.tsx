import BatchCallInterface from '@/components/calls/BatchCallInterface';

export default function StartCallPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Start Voice Call</h1>
          <p className="mt-2 text-gray-600">
            Initiate a call with an opted-in customer using your voice agent
          </p>
        </div>

        <BatchCallInterface />
      </div>
    </div>
  );
}
