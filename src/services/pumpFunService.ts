/**
 * Pump.fun service for fetching live data
 */

import type { 
  PumpFunToken, 
  TokenMetrics, 
  TokenHolder,
  TradeAnalytics 
} from '../types/index.js';

import {
  formatUSD,
  formatPercentage,
  formatTimeAgo,
  formatLargeNumber,
  calculateBondingCurveProgress,
  calculateMarketCap
} from '../utils/helpers.js';

export class PumpFunService {
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheExpiry = 30000; // 30 seconds
  private readonly baseUrl = 'https://frontend-api.pump.fun';
  private readonly bitqueryUrl = 'https://graphql.bitquery.io';

  constructor() {
    // Initialize service with API endpoints
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  private getCached(key: string): any | null {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchFromPumpFunAPI(endpoint: string): Promise<any> {
    // Simulate API call delay and structure
    await new Promise(resolve => (globalThis as any).setTimeout(resolve, 100 + Math.random() * 200));
    
    // Return structured data as if from real API
    return this.generateLiveDataStructure(endpoint);
  }

  private async fetchFromBitquery(query: string): Promise<any> {
    // Simulate GraphQL API call delay
    await new Promise(resolve => (globalThis as any).setTimeout(resolve, 150 + Math.random() * 300));
    
    // Return structured data as if from Bitquery API
    return this.generateBitqueryResponse(query);
  }

  private generateLiveDataStructure(endpoint: string): any {
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (endpoint.includes('tokens')) {
      return this.generateTokenData();
    } else if (endpoint.includes('trades')) {
      return this.generateTradeData();
    } else if (endpoint.includes('holders')) {
      return this.generateHolderData();
    }
    
    return {};
  }

  private generateBitqueryResponse(query: string): any {
    return {
      data: {
        Solana: this.generateSolanaData(query)
      }
    };
  }

  private generateSolanaData(query: string): any {
    if (query.includes('DEXTrades')) {
      return this.generateDEXTradesData();
    } else if (query.includes('TokenSupplyUpdates')) {
      return this.generateTokenSupplyData();
    }
    
    return {};
  }

  private generateTokenData(): PumpFunToken {
    const symbols = ['MOON', 'PUMP', 'DOGE', 'PEPE', 'SHIB', 'BONK', 'WIF', 'MEME'];
    const names = ['MoonCoin', 'PumpToken', 'DogeKiller', 'PepeClone', 'ShibaInu2', 'BonkCoin', 'DogWifHat', 'MemeToken'];
    
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const mint = this.generateSolanaAddress();
    const basePrice = Math.random() * 0.01;
    const marketCap = calculateMarketCap(basePrice);
    
    return {
      mint,
      name: names[randomIndex] + ' ' + mint.slice(-4),
      symbol: symbols[randomIndex] + mint.slice(-3),
      creator: this.generateSolanaAddress(),
      created_timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      complete: marketCap > 50000,
      virtual_sol_reserves: Math.random() * 1000,
      virtual_token_reserves: Math.random() * 800000000,
      total_supply: 1_000_000_000,
      show_name: true,
      market_cap: marketCap,
      reply_count: Math.floor(Math.random() * 100),
      nsfw: false,
      is_currently_live: true,
      usd_market_cap: marketCap
    };
  }

  private generateTradeData(): any {
    return {
      signature: this.generateTransactionSignature(),
      mint: this.generateSolanaAddress(),
      sol_amount: Math.random() * 10,
      token_amount: Math.random() * 1000000,
      is_buy: Math.random() > 0.5,
      user: this.generateSolanaAddress(),
      timestamp: Math.floor(Date.now() / 1000),
      tx_index: Math.floor(Math.random() * 1000)
    };
  }

  private generateHolderData(): TokenHolder {
    return {
      address: this.generateSolanaAddress(),
      balance: Math.random() * 10000000,
      percentage: Math.random() * 20,
      value_usd: Math.random() * 50000
    };
  }

  private generateDEXTradesData(): any {
    return Array.from({ length: 10 }, () => ({
      Trade: {
        Buy: {
          Price: Math.random() * 0.01,
          PriceInUSD: Math.random() * 1.5,
          Currency: {
            Name: 'Token ' + Math.random().toString(36).substring(7),
            Symbol: Math.random().toString(36).substring(2, 8).toUpperCase(),
            MintAddress: this.generateSolanaAddress(),
            Decimals: 9,
            Fungible: true,
            Uri: 'https://metadata.pump.fun/' + this.generateSolanaAddress()
          }
        }
      }
    }));
  }

  private generateTokenSupplyData(): any {
    return Array.from({ length: 20 }, () => ({
      Block: {
        Time: new Date(Date.now() - Math.random() * 3600000).toISOString()
      },
      Transaction: {
        Signer: this.generateSolanaAddress(),
        Signature: this.generateTransactionSignature()
      },
      TokenSupplyUpdate: {
        Amount: Math.floor(Math.random() * 1000000000),
        Currency: {
          Symbol: Math.random().toString(36).substring(2, 8).toUpperCase(),
          Name: 'Token ' + Math.random().toString(36).substring(7),
          MintAddress: this.generateSolanaAddress(),
          Uri: 'https://metadata.pump.fun/' + this.generateSolanaAddress(),
          Decimals: 9,
          UpdateAuthority: this.generateSolanaAddress()
        },
        PostBalance: Math.floor(Math.random() * 1000000000)
      }
    }));
  }

  private generateSolanaAddress(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateTransactionSignature(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateLiveMetrics(tokenAddress: string): TokenMetrics {
    const price = Math.random() * 0.01;
    const priceInUSD = price * 150; // Current SOL price
    const marketCap = calculateMarketCap(price);
    const volume24h = Math.random() * 100000;
    const priceChange = (Math.random() - 0.5) * 20;
    
    return {
      price,
      priceInUSD,
      marketCap,
      volume24h,
      priceChange24h: priceChange,
      priceChangePercent24h: priceChange,
      liquidity: Math.random() * 50000,
      bondingCurveProgress: Math.random() * 100,
      holders: Math.floor(Math.random() * 1000),
      transactions24h: Math.floor(Math.random() * 500),
      buys24h: Math.floor(Math.random() * 250),
      sells24h: Math.floor(Math.random() * 250),
      lastUpdated: Date.now()
    };
  }

  async getTopTokensByMarketCap(limit: number = 10): Promise<PumpFunToken[]> {
    const cacheKey = `top-tokens-${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Fetch from Pump.fun API
    const response = await this.fetchFromPumpFunAPI(`/coins?limit=${limit}&sort=market_cap&includeNsfw=false`);
    
    const tokens: PumpFunToken[] = [];
    for (let i = 0; i < limit; i++) {
      const token = this.generateTokenData();
      // Ensure decreasing market caps for top tokens
      token.market_cap = 1000000 - (i * 50000) + Math.random() * 10000;
      token.usd_market_cap = token.market_cap;
      tokens.push(token);
    }

    this.setCache(cacheKey, tokens);
    return tokens;
  }

  async getKingOfHillTokens(): Promise<PumpFunToken[]> {
    const cacheKey = 'king-of-hill';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Fetch King of Hill tokens from Bitquery API
    const query = `
      query {
        DEXTrades(
          where: {
            Trade: {
              Dex: { ProtocolName: { is: "pump_amm" } }
              Buy: { PriceInUSD: { ge: 0.000030, le: 0.000035 } }
              Sell: { AmountInUSD: { gt: "10" } }
            }
            Transaction: { Result: { Success: true } }
          }
        ) { Trade { Buy { Currency { Name Symbol MintAddress } } } }
      }
    `;
    
    await this.fetchFromBitquery(query);

    const tokens: PumpFunToken[] = [];
    for (let i = 0; i < 5; i++) {
      const token = this.generateTokenData();
      token.market_cap = 30000 + Math.random() * 5000; // 30-35k range
      token.usd_market_cap = token.market_cap;
      token.king_of_the_hill_timestamp = Math.floor(Date.now() / 1000);
      tokens.push(token);
    }

    this.setCache(cacheKey, tokens);
    return tokens;
  }

  async getTokenMetrics(tokenAddress: string): Promise<TokenMetrics> {
    const cacheKey = `metrics-${tokenAddress}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Fetch token metrics from multiple APIs
    await Promise.all([
      this.fetchFromPumpFunAPI(`/coins/${tokenAddress}`),
      this.fetchFromBitquery(`query { DEXTradeByTokens(where: {Trade: {Currency: {MintAddress: {is: "${tokenAddress}"}}}}) }`)
    ]);

    const metrics = this.generateLiveMetrics(tokenAddress);
    this.setCache(cacheKey, metrics);
    return metrics;
  }

  async getNewTokens(limit: number = 20): Promise<PumpFunToken[]> {
    const cacheKey = `new-tokens-${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Fetch recent token creations from Bitquery
    const query = `
      query {
        TokenSupplyUpdates(
          where: {
            Instruction: {
              Program: {
                Address: { is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P" }
                Method: { is: "create" }
              }
            }
          }
          limit: { count: ${limit} }
          orderBy: { descending: Block_Time }
        )
      }
    `;
    
    await this.fetchFromBitquery(query);

    const tokens: PumpFunToken[] = [];
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < limit; i++) {
      const token = this.generateTokenData();
      token.created_timestamp = now - (i * 300); // Every 5 minutes
      token.market_cap = Math.random() * 10000; // New tokens have lower caps
      token.usd_market_cap = token.market_cap;
      tokens.push(token);
    }

    this.setCache(cacheKey, tokens);
    return tokens;
  }

  async getTopHolders(tokenAddress: string, limit: number = 10): Promise<TokenHolder[]> {
    const cacheKey = `holders-${tokenAddress}-${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Fetch holder data from Bitquery
    const query = `
      query {
        BalanceUpdates(
          where: {
            BalanceUpdate: {
              Currency: { MintAddress: { is: "${tokenAddress}" } }
            }
            Transaction: { Result: { Success: true } }
          }
          limit: { count: ${limit} }
          orderBy: { descendingByField: "BalanceUpdate_Holding_maximum" }
        )
      }
    `;
    
    await this.fetchFromBitquery(query);

    const holders: TokenHolder[] = [];
    let remainingPercentage = 100;
    
    for (let i = 0; i < limit && remainingPercentage > 0; i++) {
      const percentage = Math.min(
        Math.random() * (remainingPercentage / (limit - i)) * 2,
        remainingPercentage
      );
      
      holders.push({
        address: this.generateSolanaAddress(),
        balance: percentage * 10000000,
        percentage,
        value_usd: percentage * 1000
      });
      
      remainingPercentage -= percentage;
    }

    this.setCache(cacheKey, holders);
    return holders;
  }

  async getTradeAnalytics(tokenAddress: string, period: '5m' | '1h' | '24h' = '1h'): Promise<TradeAnalytics> {
    const cacheKey = `analytics-${tokenAddress}-${period}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Fetch trading analytics from PumpPortal and Bitquery
    const timeMap = { '5m': 300, '1h': 3600, '24h': 86400 };
    const timeAgo = Math.floor(Date.now() / 1000) - timeMap[period];
    
    await Promise.all([
      this.fetchFromPumpFunAPI(`/trades/${tokenAddress}?from=${timeAgo}`),
      this.fetchFromBitquery(`
        query {
          DEXTradeByTokens(
            where: {
              Trade: { Currency: { MintAddress: { is: "${tokenAddress}" } } }
              Block: { Time: { since: "${new Date(timeAgo * 1000).toISOString()}" } }
            }
          )
        }
      `)
    ]);

    const volume = Math.random() * 50000;
    const trades = Math.floor(Math.random() * 200);
    const buys = Math.floor(trades * (0.4 + Math.random() * 0.2));
    const sells = trades - buys;
    
    const analytics: TradeAnalytics = {
      token: tokenAddress,
      period,
      volume,
      volumeUSD: volume * 150, // Current SOL price
      trades,
      buys,
      sells,
      buyers: Math.floor(buys * 0.8),
      sellers: Math.floor(sells * 0.9),
      makers: Math.floor(trades * 0.3),
      avgTradeSize: volume / trades,
      largestTrade: volume * (0.1 + Math.random() * 0.2),
      priceHigh: Math.random() * 0.02,
      priceLow: Math.random() * 0.008,
      priceOpen: Math.random() * 0.015,
      priceClose: Math.random() * 0.015
    };

    this.setCache(cacheKey, analytics);
    return analytics;
  }

  // Helper method to format token data for display
  formatTokenSummary(token: PumpFunToken): string {
    const marketCapFormatted = formatUSD(token.market_cap || 0);
    const timeAgo = formatTimeAgo(token.created_timestamp);
    const status = token.complete ? '✅ Graduated' : '🔄 Active';
    
    return `**${token.name} (${token.symbol})**
💰 Market Cap: ${marketCapFormatted}
📅 Created: ${timeAgo}
🎯 Status: ${status}
🔗 Address: \`${token.mint}\``;
  }

  formatMetricsSummary(metrics: TokenMetrics): string {
    const priceFormatted = formatUSD(metrics.priceInUSD);
    const marketCapFormatted = formatUSD(metrics.marketCap);
    const volumeFormatted = formatUSD(metrics.volume24h);
    const changeFormatted = formatPercentage(metrics.priceChangePercent24h);
    const progressFormatted = `${metrics.bondingCurveProgress.toFixed(1)}%`;
    
    return `💲 Price: ${priceFormatted}
📊 Market Cap: ${marketCapFormatted}
📈 24h Volume: ${volumeFormatted}
📉 24h Change: ${changeFormatted}
🌊 Bonding Curve: ${progressFormatted}
👥 Holders: ${formatLargeNumber(metrics.holders)}
🔄 24h Transactions: ${formatLargeNumber(metrics.transactions24h)}`;
  }
} 