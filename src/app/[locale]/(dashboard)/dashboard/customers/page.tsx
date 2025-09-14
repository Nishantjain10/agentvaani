import ConsentManagement from '@/components/customers/ConsentManagement';
import CustomerImportForm from '@/components/customers/CustomerImportForm';

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="mt-2 text-gray-600">
              Import customers and manage consent for voice agent calls
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Import Section */}
          <div>
            <CustomerImportForm />
          </div>

          {/* Consent Management Section */}
          <div>
            <ConsentManagement />
          </div>
        </div>

        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-red-800">🚨 Compliance Requirements</h3>
          <ul className="space-y-1 text-sm text-red-700">
            <li>• Never call customers without explicit consent</li>
            <li>• Honor all opt-out requests immediately</li>
            <li>• Maintain detailed logs of all consent interactions</li>
            <li>• Respect do-not-call registries and suppression lists</li>
            <li>• Provide clear identification and opt-out options in all communications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
