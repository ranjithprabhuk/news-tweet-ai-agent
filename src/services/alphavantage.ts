// src/services/alphavantage.ts
import axios from 'axios';
import { loadConfig } from '../utils/config';
import { logger } from '../utils/logger';

interface FetchNewsParams {
  topics: string[];
  limit: number;
  timeFrom?: string;
}

export async function fetchFinancialNews(params: FetchNewsParams) {
  const config = loadConfig();
  const apiKey = config.alphavantage.apiKey;

  // Join topics with comma
  const topicsString = params.topics.join(',');

  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topicsString}&limit=${params.limit}${
    params.timeFrom ? `&time_from=${params.timeFrom}` : ''
  }&apikey=${apiKey}`;

  logger.debug(`Fetching news with URL: ${url.replace(apiKey, 'REDACTED')}`);

  try {
    const response = await axios.get(url);
    if (!response.data || !response.data.feed) {
      logger.warn('Unexpected response format from Alpha Vantage API', response.data);
      return { feed: [] };
    }

    logger.info(`Retrieved ${response.data.feed?.length || 0} news items`);
    logger.debug('News sentiment statistics:', response.data.sentiment_score_definition);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('AlphaVantage API error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    } else {
      logger.error('Error fetching financial news:', error);
    }
    throw new Error('Failed to fetch news from Alpha Vantage');
  }
}
