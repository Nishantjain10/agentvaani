'use client';

import { useState } from 'react';
import { functions, storage, UPLOADS_BUCKET_ID } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

type UploadResult = {
  id: string;
  filename: string;
  parsedText: string;
  keywords: string[];
};

export default function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload file to Appwrite storage
      const uploadResponse = await storage.createFile(
        UPLOADS_BUCKET_ID,
        'unique()',
        file,
      );

      // Parse the file using Appwrite Function
      const parseResult = await functions.createExecution(
        'parse-file',
        JSON.stringify({
          fileId: uploadResponse.$id,
          userId: user.$id,
        }),
      );

      if (parseResult.responseStatusCode !== 200) {
        throw new Error('Failed to parse file');
      }

      const result = JSON.parse(parseResult.responseBody);

      setResult({
        id: result.uploadId,
        filename: file.name,
        parsedText: result.text,
        keywords: result.keywords,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to upload and parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Parse the URL using Appwrite Function
      const parseResult = await functions.createExecution(
        'parse-file',
        JSON.stringify({
          url,
          userId: user.$id,
        }),
      );

      if (parseResult.responseStatusCode !== 200) {
        throw new Error('Failed to parse URL');
      }

      const result = JSON.parse(parseResult.responseBody);

      setResult({
        id: result.uploadId,
        filename: result.metadata.title || url,
        parsedText: result.text,
        keywords: result.keywords,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to parse URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Upload Context Documents</h2>

      <div className="mb-6">
        <div className="mb-4 flex space-x-4">
          <button
            type="button"
            onClick={() => setUploadType('file')}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              uploadType === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setUploadType('url')}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              uploadType === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Parse URL
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {uploadType === 'file'
        ? (
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  Select PDF File
                </label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload PDF documents containing product information, scripts, or training materials
                </p>
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Uploading and Parsing...' : 'Upload and Parse PDF'}
              </button>
            </form>
          )
        : (
            <form onSubmit={handleUrlParse} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  Website URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/product-info"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter URL of web pages containing relevant information for your agent
                </p>
              </div>

              <button
                type="submit"
                disabled={!url || loading}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {loading ? 'Parsing URL...' : 'Parse URL Content'}
              </button>
            </form>
          )}

      {result && (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 text-lg font-medium text-green-800">✅ Successfully Processed</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>File:</strong>
              {' '}
              {result.filename}
            </p>
            <p>
              <strong>Text Length:</strong>
              {' '}
              {result.parsedText.length}
              {' '}
              characters
            </p>
            <p>
              <strong>Keywords:</strong>
              {' '}
              {result.keywords.slice(0, 10).join(', ')}
            </p>
          </div>
          <div className="mt-3">
            <p className="text-sm font-medium text-green-800">Preview:</p>
            <p className="mt-1 max-h-32 overflow-y-auto text-sm text-green-700">
              {result.parsedText.substring(0, 300)}
              ...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
