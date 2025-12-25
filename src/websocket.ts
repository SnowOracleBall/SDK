import type { SnowOracleWebSocketOptions, TradeEvent } from './types';

type WebSocketLike = {
  send(data: string): void;
  close(): void;
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  readyState: number;
};

const DEFAULT_WS_URL = 'wss://ws-live-data.polymarket.com';
const DEFAULT_RECONNECT_INTERVAL = 5000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;

export class SnowOracleWebSocket {
  private url: string;
  private reconnect: boolean;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private ws: WebSocketLike | null = null;
  private subscriptions: Set<string> = new Set();
  private listeners: Map<string, Set<(event: TradeEvent) => void>> = new Map();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  constructor(options: SnowOracleWebSocketOptions = {}) {
    this.url = options.url || DEFAULT_WS_URL;
    this.reconnect = options.reconnect ?? true;
    this.reconnectInterval = options.reconnectInterval || DEFAULT_RECONNECT_INTERVAL;
    this.maxReconnectAttempts = options.maxReconnectAttempts || DEFAULT_MAX_RECONNECT_ATTEMPTS;
  }

  connect(): void {
    if (typeof WebSocket === 'undefined') {
      try {
        const WS = require('ws');
        this.ws = new WS(this.url) as WebSocketLike;
      } catch {
        throw new Error('WebSocket is not available. Install the "ws" package for Node.js.');
      }
    } else {
      this.ws = new WebSocket(this.url) as unknown as WebSocketLike;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
      this.resubscribe();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data));
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      this.notifyConnectionListeners(false);
      if (this.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };
  }

  disconnect(): void {
    this.reconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(marketSlug: string, callback: (event: TradeEvent) => void): () => void {
    this.subscriptions.add(marketSlug);
    
    if (!this.listeners.has(marketSlug)) {
      this.listeners.set(marketSlug, new Set());
    }
    this.listeners.get(marketSlug)!.add(callback);

    if (this.ws && this.ws.readyState === 1) {
      this.sendSubscription(marketSlug);
    }

    return () => {
      this.listeners.get(marketSlug)?.delete(callback);
      if (this.listeners.get(marketSlug)?.size === 0) {
        this.listeners.delete(marketSlug);
        this.subscriptions.delete(marketSlug);
        this.sendUnsubscription(marketSlug);
      }
    };
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  private sendSubscription(marketSlug: string): void {
    if (this.ws && this.ws.readyState === 1) {
      const message = JSON.stringify({
        type: 'subscribe',
        channel: 'activity/trades',
        market: marketSlug,
      });
      this.ws.send(message);
    }
  }

  private sendUnsubscription(marketSlug: string): void {
    if (this.ws && this.ws.readyState === 1) {
      const message = JSON.stringify({
        type: 'unsubscribe',
        channel: 'activity/trades',
        market: marketSlug,
      });
      this.ws.send(message);
    }
  }

  private resubscribe(): void {
    for (const marketSlug of this.subscriptions) {
      this.sendSubscription(marketSlug);
    }
  }

  private handleMessage(data: unknown): void {
    if (!data || typeof data !== 'object') return;
    
    const message = data as Record<string, unknown>;
    if (message.channel === 'activity/trades' && message.data) {
      const tradeData = message.data as Record<string, unknown>;
      const trade: TradeEvent = {
        marketId: String(tradeData.market_id || ''),
        slug: String(tradeData.slug || ''),
        price: Number(tradeData.price || 0),
        size: Number(tradeData.size || 0),
        side: tradeData.side === 'sell' ? 'sell' : 'buy',
        timestamp: String(tradeData.timestamp || new Date().toISOString()),
      };

      const listeners = this.listeners.get(trade.slug);
      if (listeners) {
        for (const listener of listeners) {
          listener(trade);
        }
      }
    }
  }

  private notifyConnectionListeners(connected: boolean): void {
    for (const listener of this.connectionListeners) {
      listener(connected);
    }
  }
}
