# Snow Oracle SDK

<div align="center">

![Snow Oracle SDK](https://img.shields.io/badge/Snow%20Oracle%20SDK-Prediction%20Markets-0ea5e9?style=for-the-badge&logo=snowflake&logoColor=white)

**Official SDK for Snow Oracle Ball - Prediction Market Aggregator**

[![npm version](https://img.shields.io/npm/v/snow-oracle-sdk?style=flat-square)](https://www.npmjs.com/package/snow-oracle-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## Overview

Snow Oracle SDK provides a simple, type-safe way to interact with prediction markets aggregated from Polymarket and Kalshi. It includes both REST API client and WebSocket support for real-time trade updates.

## Installation

```bash
npm install snow-oracle-sdk
```

For Node.js WebSocket support:
```bash
npm install snow-oracle-sdk ws
```

## Quick Start

### REST API Client

```typescript
import { SnowOracleClient } from 'snow-oracle-sdk';

const client = new SnowOracleClient();

// Get all markets
const markets = await client.getMarkets();
console.log(markets);

// Get markets by category
const politicsMarkets = await client.getMarkets({ 
  category: 'politics',
  sortBy: 'volume',
  sortOrder: 'desc'
});

// Get a specific market
const market = await client.getMarket('market-id');

// Create a prediction
const prediction = await client.createPrediction({
  marketId: 'market-id',
  walletAddress: '0x...',
  prediction: 'yes',
  confidence: 80
});

// Get AI market analysis
const analysis = await client.getMarketAnalysis('market-id');
console.log(analysis.sentiment, analysis.recommendation);
```

### WebSocket (Real-time Trades)

```typescript
import { SnowOracleWebSocket } from 'snow-oracle-sdk';

const ws = new SnowOracleWebSocket();

// Connect to WebSocket
ws.connect();

// Listen for connection status
ws.onConnectionChange((connected) => {
  console.log('Connected:', connected);
});

// Subscribe to market trades
const unsubscribe = ws.subscribe('will-trump-win-2024', (trade) => {
  console.log('New trade:', trade);
  console.log(`Price: ${trade.price}, Size: ${trade.size}, Side: ${trade.side}`);
});

// Unsubscribe when done
unsubscribe();

// Disconnect
ws.disconnect();
```

## API Reference

### SnowOracleClient

#### Constructor Options

```typescript
interface SnowOracleClientOptions {
  baseUrl?: string;      // Default: 'https://snow-oracle-ball.replit.app'
  timeout?: number;      // Default: 30000 (30s)
  headers?: Record<string, string>;
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `getMarkets(params?)` | Get all markets with optional filters |
| `getMarket(id)` | Get a specific market by ID |
| `getWatchlist()` | Get user's watchlist |
| `addToWatchlist(marketId)` | Add market to watchlist |
| `removeFromWatchlist(marketId)` | Remove from watchlist |
| `getPositions()` | Get all positions |
| `createPosition(params)` | Create a new position |
| `getPredictions(walletAddress?)` | Get predictions |
| `getMarketPredictions(marketId)` | Get predictions for a market |
| `createPrediction(params)` | Create a prediction |
| `getAlerts()` | Get all alerts |
| `createAlert(params)` | Create an alert |
| `deleteAlert(alertId)` | Delete an alert |
| `getSpreads()` | Get arbitrage opportunities |
| `getLeaderboard()` | Get prediction leaderboard |
| `getMarketAnalysis(marketId)` | Get AI analysis for a market |
| `getPortfolioInsights(walletAddress)` | Get AI portfolio insights |

### SnowOracleWebSocket

#### Constructor Options

```typescript
interface SnowOracleWebSocketOptions {
  url?: string;                    // Default: Polymarket RTDS
  reconnect?: boolean;             // Default: true
  reconnectInterval?: number;      // Default: 5000ms
  maxReconnectAttempts?: number;   // Default: 10
}
```

#### Methods

| Method | Description |
|--------|-------------|
| `connect()` | Connect to WebSocket |
| `disconnect()` | Disconnect from WebSocket |
| `subscribe(marketSlug, callback)` | Subscribe to market trades |
| `onConnectionChange(callback)` | Listen for connection changes |

## Types

### Market

```typescript
interface Market {
  id: string;
  slug: string;
  title: string;
  description: string;
  source: 'polymarket' | 'kalshi';
  category: MarketCategory;
  probability: number;
  volume: number;
  liquidity: number;
  endDate: string | null;
  imageUrl: string | null;
  outcomes: MarketOutcome[];
  lastUpdated: string;
}
```

### TradeEvent

```typescript
interface TradeEvent {
  marketId: string;
  slug: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: string;
}
```

### AIMarketAnalysis

```typescript
interface AIMarketAnalysis {
  marketId: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  confidence: number;
  generatedAt: string;
}
```

## Examples

### Filter Markets by Category

```typescript
const cryptoMarkets = await client.getMarkets({
  category: 'crypto',
  sortBy: 'volume',
  sortOrder: 'desc',
  limit: 10
});
```

### Monitor Multiple Markets

```typescript
const ws = new SnowOracleWebSocket();
ws.connect();

const markets = ['bitcoin-100k', 'eth-5000', 'trump-2024'];

markets.forEach(slug => {
  ws.subscribe(slug, (trade) => {
    console.log(`[${slug}] ${trade.side.toUpperCase()} @ $${trade.price}`);
  });
});
```

### Create Watchlist and Alerts

```typescript
// Add to watchlist
await client.addToWatchlist('market-123');

// Create price alert
await client.createAlert({
  marketId: 'market-123',
  type: 'price',
  condition: 'above',
  value: 0.75
});
```

## Error Handling

```typescript
try {
  const market = await client.getMarket('invalid-id');
} catch (error) {
  if (error.message.includes('404')) {
    console.log('Market not found');
  } else if (error.message.includes('timeout')) {
    console.log('Request timed out');
  } else {
    console.error('API Error:', error.message);
  }
}
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Part of the Snow Oracle Ball ecosystem**

[Main App](https://snow-oracle-ball.replit.app) | [Documentation](https://github.com/yourusername/snow-oracle-ball)

</div>
