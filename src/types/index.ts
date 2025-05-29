export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  bonding_curve?: string;
  associated_bonding_curve?: string;
  creator: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website?: string;
  show_name: boolean;
  last_trade_timestamp?: number;
  king_of_the_hill_timestamp?: number;
  market_cap?: number;
  reply_count: number;
  last_reply?: number;
  nsfw: boolean;
  market_id?: string;
  inverted?: boolean;
  is_currently_live: boolean;
  username?: string;
  profile_image?: string;
  usd_market_cap?: number;
}

export interface PumpFunTrade {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  tx_index: number;
  username?: string;
  profile_image?: string;
  usd_market_cap?: number;
}

export interface TokenMetrics {
  price: number;
  priceInUSD: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  liquidity: number;
  bondingCurveProgress: number;
  holders: number;
  transactions24h: number;
  buys24h: number;
  sells24h: number;
  lastUpdated: number;
}

export interface TokenHolder {
  address: string;
  balance: number;
  percentage: number;
  value_usd?: number;
}

export interface TokenCreation {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  creator: string;
  timestamp: number;
  signature: string;
}

export interface TradeAnalytics {
  token: string;
  period: '5m' | '1h' | '24h';
  volume: number;
  volumeUSD: number;
  trades: number;
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
  makers: number;
  avgTradeSize: number;
  largestTrade: number;
  priceHigh: number;
  priceLow: number;
  priceOpen: number;
  priceClose: number;
}

export interface KingOfHillToken {
  mint: string;
  name: string;
  symbol: string;
  marketCap: number;
  price: number;
  creator: string;
  timestamp: number;
  isActive: boolean;
}

export interface WebSocketSubscription {
  method: 'subscribeNewToken' | 'subscribeTokenTrade' | 'subscribeAccountTrade' | 'subscribeMigration';
  keys?: string[];
}

export interface WebSocketMessage {
  method: string;
  data: any;
  timestamp: number;
}

export interface BitqueryResponse<T> {
  data: {
    Solana: T;
  };
} 