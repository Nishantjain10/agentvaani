const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
// const _storage = new Storage(client);

// Gemini integration for call script generation
async function generateCallScript(context, customerInfo, agentInfo) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a professional Hindi/English call script for an insurance agent. Use the following information:

Agent: ${agentInfo.name}
Customer: ${customerInfo.name}
Context: ${context.substring(0, 1000)}

Requirements:
- Start with proper introduction and consent disclaimer
- Be respectful and professional
- Focus on customer benefits
- Include natural conversation flow
- Keep it under 200 words
- Mix Hindi and English naturally (Hinglish)

Generate the script:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Script generation failed:', error);
    return `Namaste ${customerInfo.name}, main ${agentInfo.name} bol raha hun AgentVaani se. Aapka time hai kya insurance ke baare mein baat karne ke liye? Yeh call recorded hai aapki consent ke saath.`;
  }
}

// ElevenLabs TTS integration - Placeholder for future implementation
/*
async function _generateSpeech(text, voiceId) {
  try {
    // In production, integrate with ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('TTS generation failed:', error);
    // Return mock audio data or throw error
    throw new Error(`Speech generation failed: ${error.message}`);
  }
}
*/

// Twilio call orchestration - Placeholder for future implementation
/*
async function _initiateCall(customer, agent, script) {
  try {
    // In production, integrate with Twilio Voice API
    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const call = await twilio.calls.create({
      twiml: `<Response>
        <Say voice="alice" language="hi-IN">${script}</Say>
        <Record action="${process.env.APP_URL}/api/call-response" method="POST" maxLength="300"/>
      </Response>`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: customer.phone_e164,
      statusCallback: `${process.env.APP_URL}/api/call-status`,
      statusCallbackMethod: 'POST',
    });

    return {
      callSid: call.sid,
      status: call.status,
    };
  } catch (error) {
    throw new Error(`Call initiation failed: ${error.message}`);
  }
}
*/

module.exports = async ({ req, res, log, error }) => {
  try {
    const { customerId, agentId, userId } = JSON.parse(req.body || '{}');

    if (!customerId || !agentId || !userId) {
      throw new Error('Customer ID, Agent ID, and User ID are required');
    }

    // Get customer details
    const customer = await databases.getDocument(
      process.env.DATABASE_ID,
      process.env.CUSTOMERS_COLLECTION_ID,
      customerId,
    );

    // Verify customer belongs to user and has opted in
    if (customer.worker_id !== userId) {
      throw new Error('Access denied');
    }

    if (!customer.opted_in) {
      throw new Error('Customer has not opted in');
    }

    // Get agent details
    const agent = await databases.getDocument(
      process.env.DATABASE_ID,
      process.env.AGENTS_COLLECTION_ID,
      agentId,
    );

    if (agent.worker_id !== userId) {
      throw new Error('Access denied to agent');
    }

    // Get context from uploaded documents
    const uploadsResponse = await databases.listDocuments(
      process.env.DATABASE_ID,
      process.env.UPLOADS_COLLECTION_ID,
      [`owner_id=${userId}`],
    );

    let context = '';
    if (uploadsResponse.documents.length > 0) {
      context = uploadsResponse.documents
        .map(doc => doc.parsed_text)
        .join('\n\n')
        .substring(0, 2000);
    }

    // Generate call script using Gemini
    const script = await generateCallScript(context, customer, agent);

    // Create call record
    const callRecord = await databases.createDocument(
      process.env.DATABASE_ID,
      process.env.CALLS_COLLECTION_ID,
      'unique()',
      {
        customer_id: customerId,
        agent_id: agentId,
        worker_id: userId,
        call_start: new Date().toISOString(),
        raw_metadata: JSON.stringify({
          script,
          context_length: context.length,
        }),
      },
    );

    // Initiate call (mock for now)
    log('Initiating call for customer:', customer.name);

    // In production, this would initiate the actual call
    // const callResult = await initiateCall(customer, agent, script);

    // Mock call result
    const callResult = {
      callSid: `mock_call_${Date.now()}`,
      status: 'initiated',
    };

    // Update call record with call SID
    await databases.updateDocument(
      process.env.DATABASE_ID,
      process.env.CALLS_COLLECTION_ID,
      callRecord.$id,
      {
        raw_metadata: JSON.stringify({
          script,
          context_length: context.length,
          call_sid: callResult.callSid,
        }),
      },
    );

    log('Call initiated successfully:', callResult.callSid);

    return res.json({
      success: true,
      callId: callRecord.$id,
      callSid: callResult.callSid,
      script,
      message: 'Call initiated successfully',
    });
  } catch (err) {
    error('Call orchestrator function error:', err);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
