import CreateAgentForm from '@/components/agents/CreateAgentForm';

export default function CreateAgentPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Voice Agent</h1>
          <p className="mt-2 text-gray-600">
            Set up a new AI voice agent for your customer outreach campaigns
          </p>
        </div>

        <CreateAgentForm />
      </div>
    </div>
  );
}
