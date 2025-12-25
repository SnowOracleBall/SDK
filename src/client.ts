import type {
  SnowOracleClientOptions,
  Market,
  WatchlistItem,
  Position,
  Prediction,
  Alert,
  SpreadOpportunity,
  LeaderboardEntry,
  AIMarketAnalysis,
  AIPortfolioInsight,
  GetMarketsParams,
  CreatePredictionParams,
  CreateAlertParams,
  CreatePositionParams,
} from './types';

const DEFAULT_BASE_URL = 'https://snow-oracle-ball.replit.app';
const DEFAULT_TIMEOUT = 30000;

export class SnowOracleClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(options: SnowOracleClientOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/$/, '') || DEFAULT_BASE_URL;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error ${response.status}: ${error}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  async getMarkets(params: GetMarketsParams = {}): Promise<Market[]> {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.set('category', params.category);
    if (params.source) searchParams.set('source', params.source);
    if (params.search) searchParams.set('search', params.search);
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('offset', String(params.offset));

    const query = searchParams.toString();
    return this.request<Market[]>(`/api/markets${query ? `?${query}` : ''}`);
  }

  async getMarket(id: string): Promise<Market> {
    return this.request<Market>(`/api/markets/${encodeURIComponent(id)}`);
  }

  async getWatchlist(): Promise<WatchlistItem[]> {
    return this.request<WatchlistItem[]>('/api/watchlist');
  }

  async addToWatchlist(marketId: string): Promise<WatchlistItem> {
    return this.request<WatchlistItem>('/api/watchlist', {
      method: 'POST',
      body: JSON.stringify({ marketId }),
    });
  }

  async removeFromWatchlist(marketId: string): Promise<void> {
    await this.request(`/api/watchlist/${encodeURIComponent(marketId)}`, {
      method: 'DELETE',
    });
  }

  async getPositions(): Promise<Position[]> {
    return this.request<Position[]>('/api/positions');
  }

  async createPosition(params: CreatePositionParams): Promise<Position> {
    return this.request<Position>('/api/positions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getPredictions(walletAddress?: string): Promise<Prediction[]> {
    const query = walletAddress ? `?walletAddress=${encodeURIComponent(walletAddress)}` : '';
    return this.request<Prediction[]>(`/api/predictions${query}`);
  }

  async getMarketPredictions(marketId: string): Promise<Prediction[]> {
    return this.request<Prediction[]>(`/api/predictions/market/${encodeURIComponent(marketId)}`);
  }

  async createPrediction(params: CreatePredictionParams): Promise<Prediction> {
    return this.request<Prediction>('/api/predictions', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>('/api/alerts');
  }

  async createAlert(params: CreateAlertParams): Promise<Alert> {
    return this.request<Alert>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async deleteAlert(alertId: number): Promise<void> {
    await this.request(`/api/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  async getSpreads(): Promise<SpreadOpportunity[]> {
    return this.request<SpreadOpportunity[]>('/api/spreads');
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>('/api/leaderboard');
  }

  async getMarketAnalysis(marketId: string): Promise<AIMarketAnalysis> {
    return this.request<AIMarketAnalysis>('/api/ai/market-analysis', {
      method: 'POST',
      body: JSON.stringify({ marketId }),
    });
  }

  async getPortfolioInsights(walletAddress: string): Promise<AIPortfolioInsight> {
    return this.request<AIPortfolioInsight>('/api/ai/portfolio-insights', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    });
  }
}
