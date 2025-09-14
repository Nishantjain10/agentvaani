import FileUploadForm from '@/components/uploads/FileUploadForm';

export default function UploadsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Context Documents</h1>
          <p className="mt-2 text-gray-600">
            Upload PDFs or parse web pages to provide context for your voice agents
          </p>
        </div>

        <FileUploadForm />

        <div className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-blue-800">How Context Documents Work</h3>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Upload product brochures, policy documents, or training materials</li>
            <li>• Parse company websites or knowledge base articles</li>
            <li>• Content is automatically processed and made searchable</li>
            <li>• Your voice agents will use this information during calls</li>
            <li>• All uploaded content is private to your account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
