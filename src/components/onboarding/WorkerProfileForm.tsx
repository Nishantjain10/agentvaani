'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DATABASE_ID, databases, WORKERS_COLLECTION_ID } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

export default function WorkerProfileForm() {
  const [formData, setFormData] = useState({
    role: '',
    city: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create worker profile in Appwrite database
      await databases.createDocument(
        DATABASE_ID,
        WORKERS_COLLECTION_ID,
        'unique()',
        {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          phone_verified: user.phoneVerification || false,
          role: formData.role,
          city: formData.city,
          company: formData.company,
          appwrite_user_id: user.$id,
          created_at: new Date().toISOString(),
        },
      );

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-center text-2xl font-bold">Complete Your Profile</h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select your role</option>
            <option value="insurance_agent">Insurance Agent</option>
            <option value="sales_representative">Sales Representative</option>
            <option value="customer_service">Customer Service</option>
            <option value="team_lead">Team Lead</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            placeholder="Mumbai, Delhi, Bangalore, etc."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company/Organization
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            placeholder="Your insurance company or organization"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Creating Profile...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
}
