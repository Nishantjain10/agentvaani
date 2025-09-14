import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export class GeminiService {
  async generateText(prompt: string): Promise<string> {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateKeywords(text: string): Promise<string[]> {
    const prompt = `Extract 20 important keywords from the following text for search indexing. Return only the keywords separated by commas, no explanations:

${text.substring(0, 2000)}`;

    try {
      const result = await this.generateText(prompt);
      return result
        .split(',')
        .map(keyword => keyword.trim().toLowerCase())
        .filter(keyword => keyword.length > 2)
        .slice(0, 20);
    } catch (error) {
      console.error('Error generating keywords:', error);
      // Fallback to simple keyword extraction
      return this.extractSimpleKeywords(text);
    }
  }

  async summarizeText(text: string, maxLength: number = 500): Promise<string> {
    const prompt = `Summarize the following text in ${maxLength} characters or less. Focus on key information that would be useful for a voice agent:

${text.substring(0, 5000)}`;

    try {
      const result = await this.generateText(prompt);
      return result.substring(0, maxLength);
    } catch (error) {
      console.error('Error summarizing text:', error);
      return `${text.substring(0, maxLength)}...`;
    }
  }

  async generateCallScript(context: string, customerInfo: string): Promise<string> {
    const prompt = `Generate a professional Hindi/English call script for an insurance agent. Use the following context and customer information:

Context: ${context.substring(0, 1000)}
Customer: ${customerInfo}

Requirements:
- Start with proper introduction and consent disclaimer
- Be respectful and professional
- Focus on customer benefits
- Include natural conversation flow
- Keep it under 200 words
- Mix Hindi and English naturally (Hinglish)

Generate the script:`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating call script:', error);
      return `Namaste ${customerInfo}, main [Agent Name] bol raha hun [Company] se. Aapka time hai kya insurance ke baare mein baat karne ke liye? Yeh call recorded hai aapki consent ke saath.`;
    }
  }

  async analyzeCallTranscript(transcript: string): Promise<{
    outcome: string;
    sentiment: string;
    followUpRequired: boolean;
    summary: string;
  }> {
    const prompt = `Analyze this call transcript and provide:
1. Outcome (interested/not_interested/follow_up_required/no_answer)
2. Sentiment (positive/neutral/negative)
3. Follow-up required (true/false)
4. Brief summary

Transcript: ${transcript}

Respond in JSON format:`;

    try {
      const result = await this.generateText(prompt);
      const analysis = JSON.parse(result);
      return {
        outcome: analysis.outcome || 'unknown',
        sentiment: analysis.sentiment || 'neutral',
        followUpRequired: analysis.followUpRequired || false,
        summary: analysis.summary || 'Call completed',
      };
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      return {
        outcome: 'unknown',
        sentiment: 'neutral',
        followUpRequired: false,
        summary: 'Analysis failed',
      };
    }
  }

  private extractSimpleKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount: Record<string, number> = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }
}

export const geminiService = new GeminiService();
