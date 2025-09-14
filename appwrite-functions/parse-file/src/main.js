const { Buffer } = require('node:buffer');
const cheerio = require('cheerio');
const { Client, Databases, Storage } = require('node-appwrite');
const pdfParse = require('pdf-parse');

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// Gemini integration for keyword extraction
async function generateKeywords(text) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Extract 20 important keywords from the following text for search indexing. Return only the keywords separated by commas, no explanations:\n\n${text.substring(0, 2000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const keywords = response.text()
      .split(',')
      .map(keyword => keyword.trim().toLowerCase())
      .filter(keyword => keyword.length > 2)
      .slice(0, 20);

    return keywords;
  } catch (error) {
    console.error('Gemini keyword extraction failed:', error);
    // Fallback to simple extraction
    return extractSimpleKeywords(text);
  }
}

function extractSimpleKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  const wordCount = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

async function parsePDF(buffer, filename) {
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
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

async function parseURL(url) {
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

    // Extract main content
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

    if (!content) {
      content = $('body').text();
    }

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
    throw new Error(`Failed to parse URL: ${error.message}`);
  }
}

module.exports = async ({ req, res, log, error }) => {
  try {
    const { fileId, url, userId } = JSON.parse(req.body || '{}');

    let parsedContent;

    if (fileId) {
      // Parse uploaded file
      log('Parsing uploaded file:', fileId);

      // Get file from storage
      const file = await storage.getFileDownload(
        process.env.UPLOADS_BUCKET_ID,
        fileId,
      );

      const buffer = Buffer.from(file);
      parsedContent = await parsePDF(buffer, fileId);
    } else if (url) {
      // Parse URL
      log('Parsing URL:', url);
      parsedContent = await parseURL(url);
    } else {
      throw new Error('Either fileId or url must be provided');
    }

    // Generate keywords using Gemini
    const keywordsResult = await generateKeywords(parsedContent.text);

    // Store in database
    const uploadRecord = await databases.createDocument(
      process.env.DATABASE_ID,
      process.env.UPLOADS_COLLECTION_ID,
      'unique()',
      {
        owner_id: userId,
        file_url: fileId || url,
        filename: parsedContent.metadata.title || parsedContent.metadata.source,
        parsed_text: parsedContent.text,
        keywords: keywordsResult,
        metadata: JSON.stringify(parsedContent.metadata),
        created_at: new Date().toISOString(),
      },
    );

    log('File parsed successfully:', uploadRecord.$id);

    return res.json({
      success: true,
      uploadId: uploadRecord.$id,
      text: parsedContent.text,
      keywords: keywordsResult,
      metadata: parsedContent.metadata,
    });
  } catch (err) {
    error('Parse function error:', err);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
