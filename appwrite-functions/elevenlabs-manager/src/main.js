const { ElevenLabsApi } = require('elevenlabs');
const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsApi({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

module.exports = async ({ req, res, log, error }) => {
  try {
    const { action, ...params } = JSON.parse(req.body || '{}');

    log('ElevenLabs Manager action:', action);

    switch (action) {
      case 'create_agent':
        return await createAgent(params, res, log, error);

      case 'get_agent':
        return await getAgent(params, res, log, error);

      case 'update_agent':
        return await updateAgent(params, res, log, error);

      case 'delete_agent':
        return await deleteAgent(params, res, log, error);

      case 'get_voices':
        return await getVoices(params, res, log, error);

      case 'get_phone_numbers':
        return await getPhoneNumbers(params, res, log, error);

      case 'create_batch_call':
        return await createBatchCall(params, res, log, error);

      case 'get_batch_call':
        return await getBatchCall(params, res, log, error);

      case 'list_batch_calls':
        return await listBatchCalls(params, res, log, error);

      case 'add_knowledge_base':
        return await addKnowledgeBase(params, res, log, error);

      case 'get_conversation':
        return await getConversation(params, res, log, error);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (err) {
    error('ElevenLabs Manager error:', err);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};

// Agent Management Functions
async function createAgent(params, res, log, error) {
  const { name, voice_id, system_prompt, first_message, language, llm_model } = params;

  try {
    const agent = await elevenlabs.agents.createAgent({
      name,
      voice_id,
      system_prompt,
      first_message,
      language: language || 'en',
      llm: {
        model: llm_model || 'gemini-2.0-flash',
        provider: 'google',
      },
      conversation_config: {
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          silence_duration_ms: 1000,
        },
      },
    });

    // Update the agent record in Appwrite with ElevenLabs agent ID
    if (params.agent_record_id) {
      await databases.updateDocument(
        process.env.DATABASE_ID,
        process.env.AGENTS_COLLECTION_ID,
        params.agent_record_id,
        {
          elevenlabs_agent_id: agent.agent_id,
        },
      );
    }

    log('ElevenLabs agent created:', agent.agent_id);

    return res.json({
      success: true,
      agent: {
        agent_id: agent.agent_id,
        name: agent.name,
        voice_id: agent.voice_id,
        system_prompt: agent.system_prompt,
        first_message: agent.first_message,
        language: agent.language,
        llm: agent.llm,
      },
    });
  } catch (err) {
    error('Failed to create ElevenLabs agent:', err);
    throw new Error(`Failed to create agent: ${err.message}`);
  }
}

async function getAgent(params, res, log, error) {
  const { agent_id } = params;

  try {
    const agent = await elevenlabs.agents.getAgent(agent_id);

    return res.json({
      success: true,
      agent: {
        agent_id: agent.agent_id,
        name: agent.name,
        voice_id: agent.voice_id,
        system_prompt: agent.system_prompt,
        first_message: agent.first_message,
        language: agent.language,
        llm: agent.llm,
      },
    });
  } catch (err) {
    error('Failed to get ElevenLabs agent:', err);
    throw new Error(`Failed to get agent: ${err.message}`);
  }
}

async function updateAgent(params, res, log, error) {
  const { agent_id, ...updates } = params;

  try {
    const agent = await elevenlabs.agents.updateAgent(agent_id, updates);

    return res.json({
      success: true,
      agent: {
        agent_id: agent.agent_id,
        name: agent.name,
        voice_id: agent.voice_id,
        system_prompt: agent.system_prompt,
        first_message: agent.first_message,
        language: agent.language,
        llm: agent.llm,
      },
    });
  } catch (err) {
    error('Failed to update ElevenLabs agent:', err);
    throw new Error(`Failed to update agent: ${err.message}`);
  }
}

async function deleteAgent(params, res, log, error) {
  const { agent_id } = params;

  try {
    await elevenlabs.agents.deleteAgent(agent_id);

    return res.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (err) {
    error('Failed to delete ElevenLabs agent:', err);
    throw new Error(`Failed to delete agent: ${err.message}`);
  }
}

// Voice Management
async function getVoices(params, res, log, error) {
  try {
    const voices = await elevenlabs.voices.getVoices();

    // Filter for Hindi and English voices
    const filteredVoices = voices.voices
      .filter(voice => voice.language === 'hi' || voice.language === 'en')
      .map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        language: voice.language,
        accent: voice.accent || '',
        preview_url: voice.preview_url,
      }));

    return res.json({
      success: true,
      voices: filteredVoices,
    });
  } catch (err) {
    error('Failed to get voices:', err);
    throw new Error(`Failed to get voices: ${err.message}`);
  }
}

// Phone Number Management
async function getPhoneNumbers(params, res, log, error) {
  try {
    const phoneNumbers = await elevenlabs.phoneNumbers.listPhoneNumbers();

    return res.json({
      success: true,
      phone_numbers: phoneNumbers.phone_numbers.map(phone => ({
        phone_number_id: phone.phone_number_id,
        phone_number: phone.phone_number,
        country: phone.country,
      })),
    });
  } catch (err) {
    error('Failed to get phone numbers:', err);
    throw new Error(`Failed to get phone numbers: ${err.message}`);
  }
}

// Batch Calling
async function createBatchCall(params, res, log, error) {
  const { batch_name, agent_id, phone_number_id, recipients, user_id } = params;

  try {
    const batchCall = await elevenlabs.batchCalling.createBatchCall({
      name: batch_name,
      agent_id,
      phone_number_id,
      recipients,
    });

    // Store batch call record in Appwrite
    await databases.createDocument(
      process.env.DATABASE_ID,
      process.env.BATCH_CALLS_COLLECTION_ID,
      'unique()',
      {
        user_id,
        elevenlabs_batch_id: batchCall.batch_id,
        name: batch_name,
        agent_id,
        phone_number_id,
        total_recipients: recipients.length,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    );

    log('Batch call created:', batchCall.batch_id);

    return res.json({
      success: true,
      batch_id: batchCall.batch_id,
      name: batchCall.name,
      status: batchCall.status,
    });
  } catch (err) {
    error('Failed to create batch call:', err);
    throw new Error(`Failed to create batch call: ${err.message}`);
  }
}

async function getBatchCall(params, res, log, error) {
  const { batch_id } = params;

  try {
    const batchCall = await elevenlabs.batchCalling.getBatchCall(batch_id);

    return res.json({
      success: true,
      batch_call: {
        batch_id: batchCall.batch_id,
        name: batchCall.name,
        status: batchCall.status,
        total_recipients: batchCall.recipients.length,
        completed_calls: batchCall.completed_calls || 0,
        successful_calls: batchCall.successful_calls || 0,
      },
      call_details: batchCall.recipients.map(recipient => ({
        phone_number: recipient.phone_number,
        customer_name: recipient.customer_name,
        status: recipient.status || 'pending',
        duration: recipient.duration,
        outcome: recipient.outcome,
        conversation_id: recipient.conversation_id,
      })),
    });
  } catch (err) {
    error('Failed to get batch call:', err);
    throw new Error(`Failed to get batch call: ${err.message}`);
  }
}

async function listBatchCalls(params, res, log, error) {
  try {
    const batchCalls = await elevenlabs.batchCalling.listBatchCalls();

    return res.json({
      success: true,
      batch_calls: batchCalls.batch_calls.map(batch => ({
        batch_id: batch.batch_id,
        name: batch.name,
        status: batch.status,
        total_recipients: batch.recipients ? batch.recipients.length : 0,
        completed_calls: batch.completed_calls || 0,
        successful_calls: batch.successful_calls || 0,
        created_at: batch.created_at,
      })),
    });
  } catch (err) {
    error('Failed to list batch calls:', err);
    throw new Error(`Failed to list batch calls: ${err.message}`);
  }
}

// Knowledge Base Management
async function addKnowledgeBase(params, res, log, error) {
  const { agent_id, content, name } = params;

  try {
    const knowledgeBase = await elevenlabs.agents.addKnowledgeBase(agent_id, {
      name,
      content,
      type: 'text',
    });

    return res.json({
      success: true,
      knowledge_base_id: knowledgeBase.knowledge_base_id,
    });
  } catch (err) {
    error('Failed to add knowledge base:', err);
    throw new Error(`Failed to add knowledge base: ${err.message}`);
  }
}

// Conversation Analysis
async function getConversation(params, res, log, error) {
  const { conversation_id } = params;

  try {
    const conversation = await elevenlabs.agents.getConversation(conversation_id);

    // Simple analysis of the conversation
    const analysis = analyzeConversation(conversation.transcript);

    return res.json({
      success: true,
      conversation: {
        conversation_id: conversation.conversation_id,
        transcript: conversation.transcript,
        duration_seconds: conversation.duration_seconds,
        summary: analysis.summary,
        outcome: analysis.outcome,
        sentiment: analysis.sentiment,
      },
    });
  } catch (err) {
    error('Failed to get conversation:', err);
    throw new Error(`Failed to get conversation: ${err.message}`);
  }
}

// Helper function for conversation analysis
function analyzeConversation(transcript) {
  const lowerTranscript = transcript.toLowerCase();

  let outcome = 'no_answer';
  let sentiment = 'neutral';

  // Outcome detection
  if (lowerTranscript.includes('interested') || lowerTranscript.includes('yes') || lowerTranscript.includes('haan')) {
    outcome = 'interested';
    sentiment = 'positive';
  } else if (lowerTranscript.includes('not interested') || lowerTranscript.includes('no') || lowerTranscript.includes('nahi')) {
    outcome = 'not_interested';
    sentiment = 'negative';
  } else if (lowerTranscript.includes('call back') || lowerTranscript.includes('later') || lowerTranscript.includes('baad mein')) {
    outcome = 'follow_up_required';
  } else if (transcript.length < 50) {
    outcome = 'no_answer';
  }

  return {
    summary: `Call completed. Transcript length: ${transcript.length} characters.`,
    outcome,
    sentiment,
  };
}
