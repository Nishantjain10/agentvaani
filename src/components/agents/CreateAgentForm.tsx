'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AGENTS_COLLECTION_ID, DATABASE_ID, databases, functions } from '@/libs/appwrite';
import { authService } from '@/libs/auth';

// Voice profiles will be loaded from ElevenLabs API

export default function CreateAgentForm() {
  const [formData, setFormData] = useState({
    name: '',
    voice_id: '',
    description: '',
    system_prompt: '',
    first_message: '',
    language: 'hindi',
  });
  const [voices, setVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadVoices = async () => {
    try {
      // Try to load voices from ElevenLabs function
      const response = await functions.createExecution(
        'elevenlabs-manager',
        JSON.stringify({
          action: 'get_voices',
        }),
      );

      const result = JSON.parse(response.responseBody);
      if (result.success) {
        setVoices(result.voices || []);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err: any) {
      console.warn('ElevenLabs function not available, using mock voices:', err.message);
      
      // Fallback to mock voices for development
      setVoices([
        {
          voice_id: 'mock-hindi-female-1',
          name: 'Priya (Hindi Female)',
          language: 'hi',
          accent: 'indian',
          category: 'Mock',
        },
        {
          voice_id: 'mock-hindi-male-1',
          name: 'Raj (Hindi Male)',
          language: 'hi',
          accent: 'indian',
          category: 'Mock',
        },
        {
          voice_id: 'mock-english-female-1',
          name: 'Sarah (English Female)',
          language: 'en',
          accent: 'indian',
          category: 'Mock',
        },
        {
          voice_id: 'mock-english-male-1',
          name: 'David (English Male)',
          language: 'en',
          accent: 'american',
          category: 'Mock',
        },
      ]);
      setError('Using mock voices. Deploy ElevenLabs function for real voices.');
    } finally {
      setLoadingVoices(false);
    }
  };

  useEffect(() => {
    loadVoices();
  }, [loadVoices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create ElevenLabs voice agent
      const response = await functions.createExecution(
        'elevenlabs-manager',
        JSON.stringify({
          action: 'create_agent',
          data: {
            name: formData.name,
            voice_id: formData.voice_id,
            description: formData.description,
            system_prompt: formData.system_prompt,
            first_message: formData.first_message,
            language: formData.language,
          },
        }),
      );

      const result = JSON.parse(response.responseBody);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create ElevenLabs agent');
      }

      const elevenLabsAgent = result.data;

      // Store agent in Appwrite database
      await databases.createDocument(
        DATABASE_ID,
        AGENTS_COLLECTION_ID,
        'unique()',
        {
          worker_id: user.$id,
          name: formData.name,
          elevenlabs_agent_id: elevenLabsAgent.agent_id,
          voice_id: formData.voice_id,
          description: formData.description,
          system_prompt: formData.system_prompt,
          first_message: formData.first_message,
          language: formData.language,
          created_at: new Date().toISOString(),
        },
      );

      router.push('/dashboard/agents');
    } catch (err: any) {
      setError(err.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectedVoice = voices.find(v => v.voice_id === formData.voice_id);

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold">Create Voice Agent</h2>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Agent Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Insurance Assistant, Policy Helper"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of what this agent will do"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Primary Language
          </label>
          <select
            id="language"
            name="language"
            required
            value={formData.language}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="hindi">Hindi</option>
            <option value="english">English</option>
            <option value="hinglish">Hinglish (Hindi + English)</option>
          </select>
        </div>

        <div>
          <label htmlFor="voice_id" className="block text-sm font-medium text-gray-700">
            Voice
          </label>
          {loadingVoices
            ? (
                <div className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                  Loading voices...
                </div>
              )
            : (
                <select
                  id="voice_id"
                  name="voice_id"
                  required
                  value={formData.voice_id}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select a voice</option>
                  {voices.map(voice => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                      {' '}
                      (
                      {voice.category || 'Custom'}
                      )
                    </option>
                  ))}
                </select>
              )}
          {selectedVoice && (
            <p className="mt-1 text-sm text-gray-500">
              Category:
              {' '}
              {selectedVoice.category || 'Custom'}
              {' '}
              | Labels:
              {' '}
              {selectedVoice.labels?.join(', ') || 'None'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="system_prompt" className="block text-sm font-medium text-gray-700">
            System Prompt
          </label>
          <textarea
            id="system_prompt"
            name="system_prompt"
            rows={4}
            required
            value={formData.system_prompt}
            onChange={handleChange}
            placeholder="You are a professional insurance agent helping customers with their policies. Always be polite, helpful, and ensure you have proper consent before proceeding with any sales pitch."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            Define how the agent should behave and respond to customers
          </p>
        </div>

        <div>
          <label htmlFor="first_message" className="block text-sm font-medium text-gray-700">
            First Message
          </label>
          <textarea
            id="first_message"
            name="first_message"
            rows={3}
            required
            value={formData.first_message}
            onChange={handleChange}
            placeholder="Hello! This is [Agent Name] calling from [Company]. You have previously expressed interest in our insurance products. Do you have a few minutes to discuss your insurance needs?"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            The opening message the agent will use when calling customers
          </p>
        </div>

        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-yellow-800">Important Compliance Note</h3>
          <p className="text-sm text-yellow-700">
            This agent will only call customers who have explicitly opted in. All calls will start with a consent disclaimer and be recorded for compliance purposes.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Creating Agent...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
}
