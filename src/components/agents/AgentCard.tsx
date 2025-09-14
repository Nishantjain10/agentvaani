'use client';

import type { Agent } from '@/types/agentvaani';

type AgentCardProps = {
  agent: Agent;
  onEdit?: (agent: Agent) => void;
  onDelete?: (agentId: string) => void;
};

export default function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-500">
            Created
            {' '}
            {new Date(agent.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(agent)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(agent.$id)}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-sm font-medium text-gray-700">Language:</span>
          <span className="ml-2 text-sm text-gray-600 capitalize">{agent.language}</span>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">Voice ID:</span>
          <span className="ml-2 text-sm text-gray-600">{agent.voice_id}</span>
        </div>

        {agent.description && (
          <div>
            <span className="text-sm font-medium text-gray-700">Description:</span>
            <p className="mt-1 text-sm text-gray-600">{agent.description}</p>
          </div>
        )}

        <div>
          <span className="text-sm font-medium text-gray-700">ElevenLabs Agent ID:</span>
          <span className="ml-2 font-mono text-sm text-gray-600">{agent.elevenlabs_agent_id}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Status</span>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            Active
          </span>
        </div>
      </div>
    </div>
  );
}
