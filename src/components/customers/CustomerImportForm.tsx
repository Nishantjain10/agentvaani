'use client';

import { useState } from 'react';
import { CUSTOMERS_COLLECTION_ID, DATABASE_ID, databases, SUPPRESSION_LIST_COLLECTION_ID } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

type CustomerData = {
  name: string;
  phone_e164: string;
  tags: string[];
};

type ImportResult = {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
};

export default function CustomerImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  const parseCSV = (csvText: string): CustomerData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase()) || [];

    const nameIndex = headers.findIndex(h => h.includes('name'));
    const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('mobile'));
    const tagsIndex = headers.findIndex(h => h.includes('tag') || h.includes('category'));

    if (nameIndex === -1 || phoneIndex === -1) {
      throw new Error('CSV must contain "name" and "phone" columns');
    }

    const customers: CustomerData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]?.split(',').map(v => v.trim().replace(/"/g, '')) || [];

      if (values.length < Math.max(nameIndex, phoneIndex) + 1) {
        continue; // Skip incomplete rows
      }

      const name = values[nameIndex];
      let phone = values[phoneIndex];
      const tags = tagsIndex >= 0 && values[tagsIndex]
        ? values[tagsIndex].split(';').map(t => t.trim()).filter(Boolean)
        : [];

      // Normalize phone number to E.164 format
      if (phone) {
        phone = normalizePhoneNumber(phone);
      }

      if (name && phone) {
        customers.push({
          name,
          phone_e164: phone,
          tags,
        });
      }
    }

    return customers;
  };

  const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Add country code if missing (assuming India +91)
    if (digits.length === 10) {
      return `+91${digits}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    } else if (digits.length === 13 && digits.startsWith('91')) {
      return `+${digits.substring(1)}`;
    }

    return `+${digits}`;
  };

  const checkSuppressionList = async (phoneNumbers: string[]): Promise<Set<string>> => {
    try {
      const suppressedNumbers = new Set<string>();

      // Get all suppressed numbers
      const response = await databases.listDocuments(
        DATABASE_ID,
        SUPPRESSION_LIST_COLLECTION_ID,
      );

      response.documents.forEach((doc: any) => {
        if (phoneNumbers.includes(doc.phone_e164)) {
          suppressedNumbers.add(doc.phone_e164);
        }
      });

      return suppressedNumbers;
    } catch (error) {
      console.error('Error checking suppression list:', error);
      return new Set();
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Read and parse CSV file
      const csvText = await file.text();
      const customers = parseCSV(csvText);

      if (customers.length === 0) {
        throw new Error('No valid customer data found in CSV');
      }

      // Check suppression list
      const phoneNumbers = customers.map(c => c.phone_e164);
      const suppressedNumbers = await checkSuppressionList(phoneNumbers);

      // Filter out suppressed numbers
      const validCustomers = customers.filter(c => !suppressedNumbers.has(c.phone_e164));
      const skippedCount = customers.length - validCustomers.length;

      // Import customers in batches
      const imported: string[] = [];
      const errors: string[] = [];
      const batchSize = 10;

      for (let i = 0; i < validCustomers.length; i += batchSize) {
        const batch = validCustomers.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (customer) => {
            try {
              await databases.createDocument(
                DATABASE_ID,
                CUSTOMERS_COLLECTION_ID,
                'unique()',
                {
                  worker_id: user.$id,
                  name: customer.name,
                  phone_e164: customer.phone_e164,
                  opted_in: false, // Must be explicitly set to true via consent
                  tags: customer.tags,
                  created_at: new Date().toISOString(),
                },
              );
              imported.push(customer.phone_e164);
            } catch (err) {
              errors.push(`${customer.name} (${customer.phone_e164}): ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }),
        );
      }

      setResult({
        total: customers.length,
        imported: imported.length,
        skipped: skippedCount,
        errors,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to import customers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Import Customer List</h2>

      <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-yellow-800">⚠️ Important Compliance Notice</h3>
        <ul className="space-y-1 text-sm text-yellow-700">
          <li>• Only import customers who have given prior consent to be contacted</li>
          <li>• All imported customers will be marked as "not opted in" initially</li>
          <li>• You must collect explicit consent before making any calls</li>
          <li>• Numbers on the suppression list will be automatically excluded</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleImport} className="space-y-4">
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            CSV File
          </label>
          <input
            type="file"
            id="file"
            accept=".csv"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            CSV file with columns: name, phone, tags (optional)
          </p>
        </div>

        <div className="rounded-md bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700">CSV Format Example:</h4>
          <pre className="rounded border bg-white p-2 text-xs text-gray-600">
            {`name,phone,tags
John Doe,9876543210,premium;existing
Jane Smith,+919876543211,new;interested
Raj Kumar,91-9876-543212,callback`}
          </pre>
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Importing...' : 'Import Customers'}
        </button>
      </form>

      {result && (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 text-lg font-medium text-green-800">Import Results</h3>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Total records:</strong>
              {' '}
              {result.total}
            </p>
            <p>
              <strong>Successfully imported:</strong>
              {' '}
              {result.imported}
            </p>
            <p>
              <strong>Skipped (suppressed):</strong>
              {' '}
              {result.skipped}
            </p>
            {result.errors.length > 0 && (
              <div>
                <p>
                  <strong>Errors:</strong>
                  {' '}
                  {result.errors.length}
                </p>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-700">
              <strong>Next step:</strong>
              {' '}
              Collect consent from imported customers before making any calls.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
