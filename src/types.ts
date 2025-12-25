export type MarketSource = 'polymarket' | 'kalshi';

export type MarketCategory = 
  | 'politics'
  | 'crypto'
  | 'sports'
  | 'entertainment'
  | 'science'
  | 'economics'
  | 'other';

export interface Market {
  id: string;
  slug: string;
  title: string;
  description: string;
  source: MarketSource;
  category: MarketCategory;
  probability: number;
  volume: number;
  liquidity: number;
  endDate: string | null;
  imageUrl: string | null;
  outcomes: MarketOutcome[];
  lastUpdated: string;
}

export interface MarketOutcome {
  name: string;
  probability: number;
  price: number;
}

export interface WatchlistItem {
  id: number;
  marketId: string;
  addedAt: string;
}

export interface Position {
  id: number;
  marketId: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  createdAt: string;
}

export interface Prediction {
  id: number;
  marketId: string;
  walletAddress: string;
  prediction: 'yes' | 'no';
  confidence: number;
  createdAt: string;
}

export interface Alert {
  id: number;
  marketId: string;
  type: 'price' | 'volume' | 'resolution';
  condition: 'above' | 'below' | 'equals';
  value: number;
  isActive: boolean;
  createdAt: string;
}

export interface SpreadOpportunity {
  marketId: string;
  title: string;
  polymarketPrice: number;
  kalshiPrice: number;
  spread: number;
  spreadPercent: number;
  direction: 'buy_poly_sell_kalshi' | 'buy_kalshi_sell_poly';
}

export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  displayName: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  score: number;
  streak: number;
}

export interface AIMarketAnalysis {
  marketId: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  confidence: number;
  generatedAt: string;
}

export interface AIPortfolioInsight {
  totalValue: number;
  totalPnL: number;
  riskScore: number;
  diversificationScore: number;
  recommendations: string[];
  topPerformers: string[];
  underperformers: string[];
  generatedAt: string;
}

export interface TradeEvent {
  marketId: string;
  slug: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

export interface SnowOracleClientOptions {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface SnowOracleWebSocketOptions {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface GetMarketsParams {
  category?: MarketCategory;
  source?: MarketSource;
  search?: string;
  sortBy?: 'volume' | 'probability' | 'endDate' | 'liquidity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreatePredictionParams {
  marketId: string;
  walletAddress: string;
  prediction: 'yes' | 'no';
  confidence?: number;
}

export interface CreateAlertParams {
  marketId: string;
  type: 'price' | 'volume' | 'resolution';
  condition: 'above' | 'below' | 'equals';
  value: number;
}

export interface CreatePositionParams {
  marketId: string;
  outcome: string;
  shares: number;
  avgPrice: number;
}
