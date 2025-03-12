# Financial News AI Agent

This Node.js application fetches financial news from AlphaVantage, processes it using Google's Gemini AI, and posts the generated content to Twitter.

## Features

- Fetches latest financial news from AlphaVantage API
- Processes news data with Google's Gemini AI to create engaging tweets
- Posts generated content to Twitter automatically
- Configurable topics, news limits, and update intervals
- Supports both fixed interval and dynamic time-based updates
- Comprehensive logging system
- Docker support for easy deployment
- Express API for manual triggering and monitoring

## Installation

### Prerequisites

- Node.js (v16+)
- npm or yarn
- API keys for:
  - AlphaVantage
  - Google Gemini AI
  - Twitter Developer Account (with v2 API access)

### Local Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/financial-news-ai-agent.git
cd financial-news-ai-agent
```

2. Install dependencies:

```bash
npm install
```

3. Update the configuration:
   Copy `config.json` and edit it with your API keys and preferences:

```bash
cp config.example.json config.json
```

4. Build the TypeScript code:

```bash
npm run build
```

5. Start the application:

```bash
npm start
```

### Docker Setup

1. Update the configuration file as mentioned above.

2. Build and run using Docker:

```bash
docker build -t financial-news-ai-agent .
docker run -p 3000:3000 -v $(pwd)/config.json:/usr/src/app/config.json financial-news-ai-agent
```

3. Alternatively, use Docker Compose:

```bash
docker-compose up -d
```

## Configuration

Edit `config.json` to customize the agent's behavior:

```json
{
  "alphavantage": {
    "apiKey": "YOUR_ALPHA_VANTAGE_API_KEY",
    "topics": ["blockchain", "earnings", "ipo", "finance"],
    "limit": 5,
    "timeFrom": "20220410T0130"
  },
  "gemini": {
    "apiKey": "YOUR_GEMINI_API_KEY",
    "model": "gemini-pro",
    "prompt": "Create an engaging tweet about these financial news items..."
  },
  "twitter": {
    "apiKey": "YOUR_TWITTER_API_KEY",
    "apiKeySecret": "YOUR_TWITTER_API_KEY_SECRET",
    "accessToken": "YOUR_TWITTER_ACCESS_TOKEN",
    "accessTokenSecret": "YOUR_TWITTER_ACCESS_TOKEN_SECRET"
  },
  "runOnStartup": false,
  "interval": {
    "enabled": true,
    "minutes": 60,
    "dynamicTimeFrom": true
  },
  "schedule": {
    "enabled": false,
    "cron": "0 */6 * * *"
  },
  "logging": {
    "level": "info",
    "saveToFile": true,
    "filePath": "logs/agent.log"
  }
}
```

### Configuration Options

- **alphavantage**: Settings for the AlphaVantage API

  - **apiKey**: Your AlphaVantage API key
  - **topics**: Array of topics to fetch news about
  - **limit**: Maximum number of news items to fetch
  - **timeFrom**: Starting time for news (format: YYYYMMDDTHHMM)

- **gemini**: Settings for Google's Gemini AI

  - **apiKey**: Your Gemini API key
  - **model**: Gemini model to use
  - **prompt**: Custom prompt for generating tweets

- **twitter**: Twitter API credentials

  - **apiKey**: Twitter API key
  - **apiKeySecret**: Twitter API key secret
  - **accessToken**: Twitter access token
  - **accessTokenSecret**: Twitter access token secret

- **runOnStartup**: Whether to run the agent when the application starts

- **interval**: Settings for interval-based execution

  - **enabled**: Whether to enable interval-based execution
  - **minutes**: Interval in minutes between executions
  - **dynamicTimeFrom**: Whether to dynamically set the timeFrom parameter based on the interval

- **schedule**: Settings for cron-based scheduling

  - **enabled**: Whether to enable cron-based scheduling
  - **cron**: Cron expression for scheduling

- **logging**: Logging configuration
  - **level**: Log level (error, warn, info, debug)
  - **saveToFile**: Whether to save logs to a file
  - **filePath**: Path to the log file

## API Endpoints

- **POST /trigger**: Manually trigger the agent to run
- **GET /status**: Get the current status of the agent

## Logs

Logs are saved to the configured file path and displayed in the console. The log level can be adjusted in the configuration.
