// src/services/alphavantage.ts
import { loadConfig } from '../utils/config';
import { logger } from '../utils/logger';

// Alpha Vantage News Sentiment API Interface
export interface AlphaVantageNewsSentimentResponse {
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
  feed: NewsItem[];
}

export interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Topic[];
  overall_sentiment_score: number;
  overall_sentiment_label: SentimentLabel;
  ticker_sentiment: TickerSentiment[];
}

interface Topic {
  topic: string;
  relevance_score: string;
}

interface TickerSentiment {
  ticker: string;
  relevance_score: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: SentimentLabel;
}

type SentimentLabel = 'Bearish' | 'Somewhat-Bearish' | 'Neutral' | 'Somewhat-Bullish' | 'Bullish';

interface FetchNewsParams {
  topics: string[];
  limit: number;
  timeFrom?: string;
  sort?: string;
}

export async function fetchFinancialNews(params: FetchNewsParams): Promise<AlphaVantageNewsSentimentResponse> {
  const config = loadConfig();
  const apiKey = config.alphavantage.apiKey;

  // Join topics with comma
  const topicsString = params.topics.join(',');

  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topicsString}&limit=${params.limit}${
    params.timeFrom ? `&time_from=${params.timeFrom}` : ''
  }${params.sort ? `&sort=${params.sort}` : ''}&apikey=${apiKey}`;

  logger.debug(`Fetching news with URL: ${url.replace(apiKey, 'REDACTED')}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: AlphaVantageNewsSentimentResponse = await response.json();

    if (!data || !data.feed) {
      logger.warn('Unexpected response format from Alpha Vantage API', data);
      return { feed: [], items: '0', sentiment_score_definition: '', relevance_score_definition: '' };
    }

    logger.info(`Retrieved ${data.feed?.length || 0} news items`);
    logger.debug('News sentiment statistics:', data.sentiment_score_definition);

    return data;
  } catch (error) {
    logger.error('Error fetching financial news:', error instanceof Error ? error.message : String(error));
    throw new Error('Failed to fetch news from Alpha Vantage');
  }
}
