/**
 * Bitquery API client for Pump.fun data
 */

import fetch from 'node-fetch';
import type { BitqueryResponse } from '../types/index.js';

export class BitqueryClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://graphql.bitquery.io';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BITQUERY_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  No Bitquery API key provided. Some features may be limited.');
    }
  }

  private async makeRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-KEY'] = this.apiKey;
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Bitquery API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as BitqueryResponse<T>;
    return data.data.Solana;
  }

  async getTopTokensByMarketCap(limit: number = 10): Promise<any[]> {
    const query = `
      {
        DEXTrades(
          limitBy: { by: Trade_Buy_Currency_MintAddress, count: 1 }
          limit: { count: ${limit} }
          orderBy: { descending: Trade_Buy_Price }
          where: {
            Trade: {
              Dex: { ProtocolName: { is: "pump" } }
              Buy: {
                Currency: {
                  MintAddress: { notIn: ["11111111111111111111111111111111"] }
                }
              }
              PriceAsymmetry: { le: 0.1 }
              Sell: { AmountInUSD: { gt: "10" } }
            }
            Transaction: { Result: { Success: true } }
            Block: { Time: { since: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}" } }
          }
        ) {
          Trade {
            Buy {
              Price(maximum: Block_Time)
              PriceInUSD(maximum: Block_Time)
              Currency {
                Name
                Symbol
                MintAddress
                Decimals
                Fungible
                Uri
              }
            }
          }
        }
      }
    `;

    return this.makeRequest(query);
  }

  async getKingOfHillTokens(): Promise<any[]> {
    const query = `
      {
        DEXTrades(
          where: {
            Trade: {
              Dex: { ProtocolName: { is: "pump_amm" } }
              Buy: { PriceInUSD: { ge: 0.000030, le: 0.000035 } }
              Sell: { AmountInUSD: { gt: "10" } }
            }
            Transaction: { Result: { Success: true } }
          }
          limit: { count: 20 }
          orderBy: { descending: Block_Time }
        ) {
          Trade {
            Buy {
              Price
              PriceInUSD
              Currency {
                Name
                Symbol
                MintAddress
                Decimals
                Fungible
                Uri
              }
            }
            Market {
              MarketAddress
            }
          }
          Block {
            Time
          }
        }
      }
    `;

    return this.makeRequest(query);
  }

  async getTokenMetrics(tokenAddress: string): Promise<any> {
    const timeHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const query = `
      query GetTokenMetrics($token: String!, $time_1h_ago: DateTime!) {
        volume: DEXTradeByTokens(
          where: {
            Trade: {
              Currency: { MintAddress: { is: $token } }
              Side: { Currency: { MintAddress: { is: "11111111111111111111111111111111" } } }
            }
            Block: { Time: { since: $time_1h_ago } }
            Transaction: { Result: { Success: true } }
          }
        ) {
          VolumeInUSD: sum(of: Trade_Side_AmountInUSD)
        }
        liquidity_and_BondingCurve: DEXPools(
          where: {
            Pool: {
              Market: {
                BaseCurrency: { MintAddress: { is: $token } }
                QuoteCurrency: { MintAddress: { is: "11111111111111111111111111111111" } }
              }
            }
            Transaction: { Result: { Success: true } }
          }
          limit: { count: 1 }
          orderBy: { descending: Block_Time }
        ) {
          Pool {
            Market {
              BaseCurrency {
                Name
                Symbol
              }
              QuoteCurrency {
                Name
                Symbol
              }
            }
            Base {
              Balance: PostAmount
              PostAmountInUSD
            }
            Quote {
              PostAmount
              PostAmountInUSD
            }
          }
        }
        marketcap_and_supply: TokenSupplyUpdates(
          where: {
            TokenSupplyUpdate: { Currency: { MintAddress: { is: $token } } }
            Transaction: { Result: { Success: true } }
          }
          limitBy: { by: TokenSupplyUpdate_Currency_MintAddress, count: 1 }
          orderBy: { descending: Block_Time }
        ) {
          TokenSupplyUpdate {
            MarketCap: PostBalanceInUSD
            Supply: PostBalance
            Currency {
              Name
              MintAddress
              Symbol
            }
          }
        }
        Price: DEXTradeByTokens(
          limit: { count: 1 }
          orderBy: { descending: Block_Time }
          where: {
            Transaction: { Result: { Success: true } }
            Trade: { Currency: { MintAddress: { is: $token } } }
          }
        ) {
          Trade {
            Price
            PriceInUSD
          }
        }
      }
    `;

    const variables = {
      token: tokenAddress,
      time_1h_ago: timeHourAgo,
    };

    return this.makeRequest(query, variables);
  }

  async getLatestTrades(tokenAddress: string, limit: number = 50): Promise<any[]> {
    const query = `
      query GetLatestTrades($token: String!) {
        DEXTradeByTokens(
          orderBy: { descending: Block_Time }
          limit: { count: ${limit} }
          where: {
            Trade: {
              Currency: { MintAddress: { is: $token } }
              Price: { gt: 0 }
              Dex: { ProtocolName: { is: "pump" } }
            }
            Transaction: { Result: { Success: true } }
          }
        ) {
          Block {
            Time
          }
          Trade {
            Account {
              Address
              Owner
            }
            Side {
              Type
            }
            Price
            Amount
            Side {
              AmountInUSD
              Amount
            }
          }
          Transaction {
            Signature
          }
        }
      }
    `;

    const variables = { token: tokenAddress };
    return this.makeRequest(query, variables);
  }

  async getNewTokens(limit: number = 20): Promise<any[]> {
    const query = `
      {
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
        ) {
          Block {
            Time
          }
          Transaction {
            Signer
            Signature
          }
          TokenSupplyUpdate {
            Amount
            Currency {
              Symbol
              Name
              MintAddress
              Uri
              Decimals
              UpdateAuthority
            }
            PostBalance
          }
        }
      }
    `;

    return this.makeRequest(query);
  }

  async getTopHolders(tokenAddress: string, limit: number = 10): Promise<any[]> {
    const query = `
      query GetTopHolders($token: String!) {
        BalanceUpdates(
          limit: { count: ${limit} }
          orderBy: { descendingByField: "BalanceUpdate_Holding_maximum" }
          where: {
            BalanceUpdate: {
              Currency: { MintAddress: { is: $token } }
            }
            Transaction: { Result: { Success: true } }
          }
        ) {
          BalanceUpdate {
            Currency {
              Name
              MintAddress
              Symbol
            }
            Account {
              Address
            }
            Holding: PostBalance(maximum: Block_Slot, selectWhere: { gt: "0" })
          }
        }
      }
    `;

    const variables = { token: tokenAddress };
    return this.makeRequest(query, variables);
  }

  async getTokenCreationInfo(tokenAddress: string): Promise<any> {
    const query = `
      query GetTokenCreation($token: String!) {
        Instructions(
          where: {
            Instruction: {
              Accounts: { includes: { Address: { is: $token } } }
              Program: { Name: { is: "pump" }, Method: { is: "create" } }
            }
          }
        ) {
          Block {
            Time
          }
          Transaction {
            Signer
            Signature
          }
          Instruction {
            Accounts {
              Address
            }
          }
        }
      }
    `;

    const variables = { token: tokenAddress };
    return this.makeRequest(query, variables);
  }

  async getOHLCData(tokenAddress: string, interval: string = '1', limit: number = 50): Promise<any[]> {
    const query = `
      {
        DEXTradeByTokens(
          limit: { count: ${limit} }
          orderBy: { descendingByField: "Block_Timefield" }
          where: {
            Trade: {
              Currency: { MintAddress: { is: "${tokenAddress}" } }
              Dex: {
                ProgramAddress: { is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P" }
              }
              PriceAsymmetry: { lt: 0.1 }
            }
          }
        ) {
          Block {
            Timefield: Time(interval: { in: minutes, count: ${interval} })
          }
          volume: sum(of: Trade_Amount)
          Trade {
            high: Price(maximum: Trade_Price)
            low: Price(minimum: Trade_Price)
            open: Price(minimum: Block_Slot)
            close: Price(maximum: Block_Slot)
          }
          count
        }
      }
    `;

    return this.makeRequest(query);
  }
} 