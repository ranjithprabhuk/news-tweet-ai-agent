// src/services/twitter.ts
import { TwitterApi } from 'twitter-api-v2';
import { loadConfig } from '../utils/config';

export async function postTweet(content: string) {
  const config = loadConfig();

  const client = new TwitterApi({
    appKey: config.twitter.apiKey,
    appSecret: config.twitter.apiKeySecret,
    accessToken: config.twitter.accessToken,
    accessSecret: config.twitter.accessTokenSecret,
  });

  try {
    // Ensure content is within Twitter's character limit
    const tweetContent = content.length <= 280 ? content : content.substring(0, 277) + '...';

    // Post the tweet
    const response = await client.v2.tweet(tweetContent);
    console.log('Tweet posted successfully:', response.data.id);

    return response.data;
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw new Error('Failed to post tweet to Twitter');
  }
}
