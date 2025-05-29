/**
 * Basic tests for Pump.fun MCP Server
 */

import { PumpFunService } from '../services/pumpFunService.js';

describe('PumpFunService', () => {
  let service: PumpFunService;

  beforeEach(() => {
    service = new PumpFunService();
  });

  test('should fetch top tokens', async () => {
    const tokens = await service.getTopTokensByMarketCap(5);
    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toHaveProperty('mint');
    expect(tokens[0]).toHaveProperty('name');
    expect(tokens[0]).toHaveProperty('symbol');
    expect(tokens[0]).toHaveProperty('market_cap');
  });

  test('should fetch king of hill tokens', async () => {
    const tokens = await service.getKingOfHillTokens();
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0]).toHaveProperty('mint');
    expect(tokens[0].market_cap).toBeGreaterThanOrEqual(30000);
    expect(tokens[0].market_cap).toBeLessThanOrEqual(35000);
  });

  test('should fetch new tokens', async () => {
    const tokens = await service.getNewTokens(10);
    expect(tokens).toHaveLength(10);
    expect(tokens[0]).toHaveProperty('created_timestamp');
  });

  test('should fetch token metrics', async () => {
    const tokenAddress = 'ABCD1234567890EFGH';
    const metrics = await service.getTokenMetrics(tokenAddress);
    
    expect(metrics).toHaveProperty('price');
    expect(metrics).toHaveProperty('priceInUSD');
    expect(metrics).toHaveProperty('marketCap');
    expect(metrics).toHaveProperty('volume24h');
    expect(typeof metrics.price).toBe('number');
  });

  test('should fetch token holders', async () => {
    const tokenAddress = 'ABCD1234567890EFGH';
    const holders = await service.getTopHolders(tokenAddress, 5);
    
    expect(holders).toHaveLength(5);
    expect(holders[0]).toHaveProperty('address');
    expect(holders[0]).toHaveProperty('balance');
    expect(holders[0]).toHaveProperty('percentage');
  });

  test('should fetch trade analytics', async () => {
    const tokenAddress = 'ABCD1234567890EFGH';
    const analytics = await service.getTradeAnalytics(tokenAddress, '1h');
    
    expect(analytics).toHaveProperty('token');
    expect(analytics).toHaveProperty('period');
    expect(analytics).toHaveProperty('volume');
    expect(analytics).toHaveProperty('trades');
    expect(analytics.token).toBe(tokenAddress);
    expect(analytics.period).toBe('1h');
  });

  test('should format token summary', () => {
    const token = {
      mint: 'ABC123',
      name: 'Test Token',
      symbol: 'TEST',
      market_cap: 50000,
      created_timestamp: Math.floor(Date.now() / 1000) - 3600,
      complete: false,
      creator: 'test',
      virtual_sol_reserves: 100,
      virtual_token_reserves: 800000000,
      total_supply: 1000000000,
      show_name: true,
      reply_count: 10,
      nsfw: false,
      is_currently_live: true
    };

    const summary = service.formatTokenSummary(token);
    expect(summary).toContain('Test Token');
    expect(summary).toContain('TEST');
    expect(summary).toContain('$50.00K');
    expect(summary).toContain('ABC123');
  });

  test('should format metrics summary', () => {
    const metrics = {
      price: 0.005,
      priceInUSD: 0.75,
      marketCap: 50000,
      volume24h: 10000,
      priceChange24h: 5.5,
      priceChangePercent24h: 5.5,
      liquidity: 25000,
      bondingCurveProgress: 75.5,
      holders: 1000,
      transactions24h: 250,
      buys24h: 150,
      sells24h: 100,
      lastUpdated: Date.now()
    };

    const summary = service.formatMetricsSummary(metrics);
    expect(summary).toContain('$0.75');
    expect(summary).toContain('$50.00K');
    expect(summary).toContain('$10.00K');
    expect(summary).toContain('+5.50%');
    expect(summary).toContain('75.5%');
  });
}); 