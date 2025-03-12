// src/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { AlphaVantageNewsSentimentResponse, NewsItem } from './alphavantage';

export async function processNewsWithGemini(newsData: AlphaVantageNewsSentimentResponse, customPrompt?: string) {
  const config = loadConfig();
  const apiKey = config.gemini.apiKey;
  const model = config.gemini.model || 'gemini-pro';

  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model });

  try {
    // Extract relevant information from news data
    const newsItems = newsData.feed || [];

    if (newsItems.length === 0) {
      logger.warn('No news items to process');
      return 'No financial news available at this time.';
    }

    const newsHeadlines = newsItems.map((item: NewsItem) => ({
      title: item.title,
      summary: item.summary,
      url: item.url,
      banner_image: item.banner_image,
      source: item.source,
    }));

    // Create the prompt for Gemini
    const prompt =
      customPrompt ||
      `Create an engaging tweet with the data availanle in the next line. \n${JSON.stringify(newsHeadlines, null, 2)}\n
      The tweet should be insightful, include relevant hashtags, and be under 280 characters.`;

    logger.debug('Sending prompt to Gemini:', prompt);

    // Generate content with Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    logger.info('Generated tweet content:', text);
    return text;
  } catch (error) {
    logger.error('Error processing news with Gemini AI:', error);
    throw new Error('Failed to process news with Gemini AI');
  }
}
