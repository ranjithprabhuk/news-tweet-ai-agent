// src/index.ts
import express from 'express';
import cron from 'node-cron';
import { fetchFinancialNews } from './services/alphavantage';
import { processNewsWithGemini } from './services/gemini';
import { postTweet } from './services/twitter';
import { loadConfig } from './utils/config';
import { setupLogger, logger } from './utils/logger';
import { formatDate } from './utils/date';

const app = express();
const PORT = process.env.PORT || 3010;

// Add this before your fetch call
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Setup logger
setupLogger();

app.use(express.json());

// Route to manually trigger the agent
app.post('/trigger', async (req, res) => {
  try {
    logger.info('Manual trigger requested');
    await runAgent();
    res.json({ success: true, message: 'Agent executed successfully' });
  } catch (error) {
    logger.error('Error triggering agent:', error);
    res.status(500).json({ success: false, error: 'Failed to execute agent' });
  }
});

// Route to get agent status
app.get('/status', (req, res) => {
  const config = loadConfig();
  const status = {
    status: 'running',
    version: '1.0.0',
    lastRun: global.lastRunTime || 'Never',
    intervalEnabled: config.interval?.enabled || false,
    intervalMinutes: config.interval?.minutes || 0,
    scheduleEnabled: config.schedule?.enabled || false,
    scheduleCron: config.schedule?.cron || '',
  };

  res.json(status);
});

// Initialize interval timer
let intervalTimer: NodeJS.Timeout | null = null;

// Function to setup interval-based execution
function setupIntervalExecution() {
  const config = loadConfig();

  // Clear existing interval if any
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }

  // Setup new interval if enabled
  if (config.interval && config.interval.enabled) {
    const intervalMinutes = config.interval.minutes || 60;
    const intervalMs = intervalMinutes * 60 * 1000;

    logger.info(`Setting up interval execution every ${intervalMinutes} minutes`);

    intervalTimer = setInterval(async () => {
      try {
        logger.info(`Executing agent on interval (${intervalMinutes} minutes)`);
        await runAgent();
      } catch (error) {
        logger.error('Error in interval execution:', error);
      }
    }, intervalMs);
  }
}

// Start the server
app.listen(PORT, () => {
  logger.info(`Financial News AI Agent is running on port ${PORT}`);

  // Setup scheduled execution
  const config = loadConfig();
  if (config.schedule && config.schedule.enabled) {
    logger.info(`Scheduled to run ${config.schedule.cron}`);
    cron.schedule(config.schedule.cron, async () => {
      try {
        logger.info(`Executing agent on schedule (${config.schedule.cron})`);
        await runAgent();
      } catch (error) {
        logger.error('Error in scheduled run:', error);
      }
    });
  }

  // Setup interval execution
  setupIntervalExecution();
});

// Main agent function
async function runAgent() {
  try {
    // Record execution time
    global.lastRunTime = new Date().toISOString();

    const config = loadConfig();
    let timeFrom = config.alphavantage.timeFrom;
    let sort = config.alphavantage.sort;

    // If dynamic time from is enabled, calculate the time from based on interval
    if (config.interval?.dynamicTimeFrom) {
      const intervalMinutes = config.interval?.minutes || 60;
      const date = new Date();
      date.setMinutes(date.getMinutes() - intervalMinutes);
      timeFrom = formatDate(date);
      logger.info(`Using dynamic timeFrom: ${timeFrom}`);
    }

    let newsData;

    if (!config.skipAlphaVantageApi) {
      logger.info('Fetching financial news...');
      newsData = await fetchFinancialNews({
        topics: config.alphavantage.topics,
        limit: config.alphavantage.limit,
        timeFrom: timeFrom,
        sort,
      });

      logger.info(`Processing ${newsData.feed.length} news items with Gemini AI...`);

      if (!newsData.feed || newsData.feed.length === 0) {
        logger.warn('No news items found in the specified time range');
        return false;
      }
    } else {
      logger.info('Skipping Alpha Vantage API call');
    }

    const tweetContent = await processNewsWithGemini(newsData, config.gemini.prompt, config.gemini.topics);

    logger.info('Posting tweet to Twitter...');
    await postTweet(tweetContent);

    logger.info('Agent execution completed successfully');
    return true;
  } catch (error) {
    logger.error('Agent execution failed:', error);
    throw error;
  }
}

// Execute once on startup if configured
(async () => {
  const config = loadConfig();
  if (config.runOnStartup) {
    try {
      logger.info('Running agent on startup...');
      await runAgent();
    } catch (error) {
      logger.error('Error running on startup:', error);
    }
  }
})();

// Global declaration for TypeScript
declare global {
  var lastRunTime: string | undefined;
}
