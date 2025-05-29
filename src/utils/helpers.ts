/**
 * Utility functions for Pump.fun MCP server
 */

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(decimals)}B`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(decimals)}M`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
}

export function formatUSD(amount: number): string {
  return `$${formatNumber(amount)}`;
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function calculateBondingCurveProgress(balance: number): number {
  // Formula: BondingCurveProgress = 100 - (((balance - 206900000) * 100) / 793100000)
  const progress = 100 - (((balance - 206900000) * 100) / 793100000);
  return Math.max(0, Math.min(100, progress));
}

export function calculateMarketCap(price: number, supply: number = 1_000_000_000): number {
  return price * supply;
}

export function isValidSolanaAddress(address: string): boolean {
  // Basic Solana address validation (base58, 32-44 characters)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

export function sanitizeTokenSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - (timestamp * 1000);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
}

export function calculatePriceChange(oldPrice: number, newPrice: number): {
  absolute: number;
  percentage: number;
} {
  const absolute = newPrice - oldPrice;
  const percentage = oldPrice > 0 ? (absolute / oldPrice) * 100 : 0;
  
  return { absolute, percentage };
}

export function validateTimeInterval(interval: string): boolean {
  const validIntervals = ['5m', '15m', '30m', '1h', '4h', '24h'];
  return validIntervals.includes(interval);
}

export function getTimeRangeTimestamp(range: string): number {
  const now = Math.floor(Date.now() / 1000);
  
  switch (range) {
    case '5m': return now - (5 * 60);
    case '15m': return now - (15 * 60);
    case '30m': return now - (30 * 60);
    case '1h': return now - (60 * 60);
    case '4h': return now - (4 * 60 * 60);
    case '24h': return now - (24 * 60 * 60);
    case '7d': return now - (7 * 24 * 60 * 60);
    default: return now - (60 * 60); // Default to 1 hour
  }
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(2)}T`;
  }
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  return num.toString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => (globalThis as any).setTimeout(resolve, ms));
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: Error;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          reject(lastError);
          return;
        }
        
        const delay = baseDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  });
} 