const { Client, Databases } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Gemini integration for transcript analysis
async function analyzeTranscriptWithGemini(transcript) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this call transcript and provide analysis in JSON format:

Transcript: "${transcript}"

Provide analysis with these fields:
- outcome: "interested" | "not_interested" | "follow_up_required" | "no_answer" | "unknown"
- sentiment: "positive" | "neutral" | "negative"
- followUpRequired: true | false
- summary: Brief summary of the call (max 100 words)
- keyPoints: Array of key discussion points
- nextAction: Recommended next action

Respond only with valid JSON:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Clean up the response to ensure valid JSON
    const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, '').trim();

    try {
      return JSON.parse(cleanedResponse);
    } catch {
      console.error('Failed to parse Gemini response:', cleanedResponse);
      throw new Error('Invalid JSON response from Gemini');
    }
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    throw error;
  }
}

// Fallback analysis for when Gemini fails
function fallbackAnalysis(transcript) {
  const lowerTranscript = transcript.toLowerCase();

  // Simple keyword-based analysis
  let outcome = 'unknown';
  let sentiment = 'neutral';
  let followUpRequired = false;

  // Outcome detection
  if (lowerTranscript.includes('interested') || lowerTranscript.includes('yes') || lowerTranscript.includes('haan')) {
    outcome = 'interested';
    sentiment = 'positive';
  } else if (lowerTranscript.includes('not interested') || lowerTranscript.includes('no') || lowerTranscript.includes('nahi')) {
    outcome = 'not_interested';
    sentiment = 'negative';
  } else if (lowerTranscript.includes('call back') || lowerTranscript.includes('later') || lowerTranscript.includes('baad mein')) {
    outcome = 'follow_up_required';
    followUpRequired = true;
  } else if (transcript.length < 50) {
    outcome = 'no_answer';
  }

  return {
    outcome,
    sentiment,
    followUpRequired,
    summary: `Call completed. Transcript length: ${transcript.length} characters.`,
    keyPoints: ['Call transcript analyzed'],
    nextAction: followUpRequired ? 'Schedule follow-up call' : 'No action required',
  };
}

module.exports = async ({ req, res, log, error }) => {
  try {
    const { transcript, callId } = JSON.parse(req.body || '{}');

    if (!transcript) {
      throw new Error('Transcript is required');
    }

    log('Analyzing transcript for call:', callId);

    let analysis;
    try {
      // Try Gemini analysis first
      analysis = await analyzeTranscriptWithGemini(transcript);
      log('Gemini analysis completed successfully');
    } catch (geminiError) {
      log('Gemini analysis failed, using fallback:', geminiError.message);
      analysis = fallbackAnalysis(transcript);
    }

    // Update call record if callId is provided
    if (callId) {
      try {
        await databases.updateDocument(
          process.env.DATABASE_ID,
          process.env.CALLS_COLLECTION_ID,
          callId,
          {
            transcript,
            outcome: analysis.outcome,
            call_end: new Date().toISOString(),
            raw_metadata: JSON.stringify({
              ...analysis,
              analyzed_at: new Date().toISOString(),
            }),
          },
        );
        log('Call record updated with analysis');
      } catch (updateError) {
        error('Failed to update call record:', updateError);
      }
    }

    return res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    error('Transcript analyzer function error:', err);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
