/**
 * PumpPortal API client for real-time Pump.fun data
 */

import WebSocket from 'ws';
import type { 
  PumpFunToken, 
  PumpFunTrade, 
  WebSocketSubscription, 
  WebSocketMessage 
} from '../types/index.js';

export class PumpPortalClient {
  private ws: WebSocket | null = null;
  private readonly wsUrl = 'wss://pumpportal.fun/api/data';
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 5000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.on('open', () => {
        console.log('🔗 Connected to PumpPortal WebSocket');
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        console.log(`🔌 WebSocket closed: ${code} ${reason.toString()}`);
        this.attemptReconnect();
      });

      this.ws.on('error', (error: Error) => {
        console.error('❌ WebSocket error:', error);
      });

    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.initWebSocket();
      }, this.reconnectDelay);
    } else {
      console.error('❌ Max reconnection attempts reached. Please restart the service.');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const { method, data } = message;
    
    // Emit to all listeners for this method
    const methodListeners = this.listeners.get(method);
    if (methodListeners) {
      methodListeners.forEach(listener => listener(data));
    }

    // Emit to all listeners (wildcard)
    const allListeners = this.listeners.get('*');
    if (allListeners) {
      allListeners.forEach(listener => listener(message));
    }
  }

  private subscribe(subscription: WebSocketSubscription): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(subscription));
    } else {
      console.warn('⚠️  WebSocket not connected. Cannot subscribe.');
    }
  }

  // Public subscription methods
  subscribeToNewTokens(): void {
    this.subscribe({ method: 'subscribeNewToken' });
  }

  subscribeToTokenTrades(tokenAddresses: string[]): void {
    this.subscribe({ 
      method: 'subscribeTokenTrade',
      keys: tokenAddresses 
    });
  }

  subscribeToAccountTrades(accountAddresses: string[]): void {
    this.subscribe({ 
      method: 'subscribeAccountTrade',
      keys: accountAddresses 
    });
  }

  subscribeToMigrations(): void {
    this.subscribe({ method: 'subscribeMigration' });
  }

  // Event listeners
  onNewToken(callback: (token: PumpFunToken) => void): void {
    this.addListener('subscribeNewToken', callback);
  }

  onTokenTrade(callback: (trade: PumpFunTrade) => void): void {
    this.addListener('subscribeTokenTrade', callback);
  }

  onAccountTrade(callback: (trade: PumpFunTrade) => void): void {
    this.addListener('subscribeAccountTrade', callback);
  }

  onMigration(callback: (migration: any) => void): void {
    this.addListener('subscribeMigration', callback);
  }

  onAnyMessage(callback: (message: WebSocketMessage) => void): void {
    this.addListener('*', callback);
  }

  private addListener(method: string, callback: (data: any) => void): void {
    if (!this.listeners.has(method)) {
      this.listeners.set(method, new Set());
    }
    this.listeners.get(method)!.add(callback);
  }

  removeListener(method: string, callback: (data: any) => void): void {
    const methodListeners = this.listeners.get(method);
    if (methodListeners) {
      methodListeners.delete(callback);
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  // REST API methods for historical data
  async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    const maxRetries = 3;
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          throw lastError;
        }

        // Wait before retry with exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Note: PumpPortal doesn't have direct REST endpoints for historical data
  // These would need to be implemented when such endpoints become available
  async getTokenInfo(tokenAddress: string): Promise<any> {
    // This would be implemented when PumpPortal adds REST endpoints
    throw new Error('REST endpoints not yet available in PumpPortal API');
  }

  async getHistoricalTrades(tokenAddress: string, limit: number = 50): Promise<any[]> {
    // This would be implemented when PumpPortal adds REST endpoints
    throw new Error('REST endpoints not yet available in PumpPortal API');
  }
} 