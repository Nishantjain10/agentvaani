import { Buffer } from 'node:buffer';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import { geminiService } from './gemini';

export type ParsedContent = {
  text: string;
  metadata: {
    source: string;
    type: 'pdf' | 'url';
    title?: string;
    pages?: number;
    wordCount: number;
  };
};

export class FileParser {
  async parsePDF(buffer: Buffer, filename: string): Promise<ParsedContent> {
    try {
      const data = await pdfParse(buffer);

      return {
        text: data.text,
        metadata: {
          source: filename,
          type: 'pdf',
          pages: data.numpages,
          wordCount: data.text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseURL(url: string): Promise<ParsedContent> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AgentVaani/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script and style elements
      $('script, style, nav, header, footer, aside').remove();

      // Extract title
      const title = $('title').text().trim() || $('h1').first().text().trim();

      // Extract main content - try common content selectors
      let content = '';
      const contentSelectors = [
        'main',
        'article',
        '.content',
        '.post-content',
        '.entry-content',
        '#content',
        '.main-content',
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text();
          break;
        }
      }

      // Fallback to body if no specific content area found
      if (!content) {
        content = $('body').text();
      }

      // Clean up whitespace
      content = content.replace(/\s+/g, ' ').trim();

      if (!content) {
        throw new Error('No readable content found on the page');
      }

      return {
        text: content,
        metadata: {
          source: url,
          type: 'url',
          title,
          wordCount: content.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async parseContent(input: Buffer | string, source: string): Promise<ParsedContent> {
    if (Buffer.isBuffer(input)) {
      return this.parsePDF(input, source);
    } else if (typeof input === 'string' && this.isValidURL(input)) {
      return this.parseURL(input);
    } else {
      throw new Error('Invalid input: must be a PDF buffer or valid URL');
    }
  }

  private isValidURL(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Generate keywords using Gemini AI
  async generateKeywords(text: string): Promise<string[]> {
    try {
      return await geminiService.generateKeywords(text);
    } catch (error) {
      console.error('Gemini keyword generation failed:', error);
      return this.extractSimpleKeywords(text);
    }
  }

  // Fallback simple keyword extraction
  private extractSimpleKeywords(text: string): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Simple frequency-based keyword extraction
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

export const fileParser = new FileParser();
