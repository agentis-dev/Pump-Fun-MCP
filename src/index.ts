#!/usr/bin/env node

/**
 * Pump.fun MCP Server
 * A Model Context Protocol server for live Pump.fun data and analytics
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
  CallToolResult,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { PumpFunService } from './services/pumpFunService.js';

// Initialize services
const pumpFunService = new PumpFunService();

// Available tools
const TOOLS: Tool[] = [
  {
    name: 'get-top-tokens',
    description: 'Get top Pump.fun tokens by market capitalization',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of tokens to fetch (default: 10, max: 50)',
          minimum: 1,
          maximum: 50,
          default: 10
        }
      }
    }
  },
  {
    name: 'get-king-of-hill',
    description: 'Get King of the Hill tokens (tokens in the 30-35k market cap range)',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get-token-metrics',
    description: 'Get detailed metrics for a specific Pump.fun token',
    inputSchema: {
      type: 'object',
      properties: {
        tokenAddress: {
          type: 'string',
          description: 'The token mint address (contract address)',
          pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
        }
      },
      required: ['tokenAddress']
    }
  },
  {
    name: 'get-new-tokens',
    description: 'Get recently created Pump.fun tokens',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of tokens to fetch (default: 20, max: 100)',
          minimum: 1,
          maximum: 100,
          default: 20
        }
      }
    }
  },
  {
    name: 'get-token-holders',
    description: 'Get top holders for a specific Pump.fun token',
    inputSchema: {
      type: 'object',
      properties: {
        tokenAddress: {
          type: 'string',
          description: 'The token mint address (contract address)',
          pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
        },
        limit: {
          type: 'number',
          description: 'Number of holders to fetch (default: 10, max: 50)',
          minimum: 1,
          maximum: 50,
          default: 10
        }
      },
      required: ['tokenAddress']
    }
  },
  {
    name: 'get-trade-analytics',
    description: 'Get trading analytics for a specific Pump.fun token',
    inputSchema: {
      type: 'object',
      properties: {
        tokenAddress: {
          type: 'string',
          description: 'The token mint address (contract address)',
          pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$'
        },
        period: {
          type: 'string',
          description: 'Time period for analytics',
          enum: ['5m', '1h', '24h'],
          default: '1h'
        }
      },
      required: ['tokenAddress']
    }
  },
  {
    name: 'search-tokens',
    description: 'Search for Pump.fun tokens by name or symbol',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (token name or symbol)',
          minLength: 1
        },
        limit: {
          type: 'number',
          description: 'Number of results to return (default: 10, max: 50)',
          minimum: 1,
          maximum: 50,
          default: 10
        }
      },
      required: ['query']
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: 'pump-fun-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get-top-tokens': {
        const limit = args?.limit ?? 10;
        const tokens = await pumpFunService.getTopTokensByMarketCap(limit);
        
        const summary = `# 🏆 Top ${limit} Pump.fun Tokens by Market Cap\n\n` +
          tokens.map((token, index) => 
            `## ${index + 1}. ${pumpFunService.formatTokenSummary(token)}\n`
          ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: summary
            }
          ]
        };
      }

      case 'get-king-of-hill': {
        const tokens = await pumpFunService.getKingOfHillTokens();
        
        const summary = `# 👑 King of the Hill Tokens\n\n` +
          `*Tokens currently in the 30-35k market cap range competing for the crown*\n\n` +
          tokens.map((token, index) => 
            `## ${index + 1}. ${pumpFunService.formatTokenSummary(token)}\n`
          ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: summary
            }
          ]
        };
      }

      case 'get-token-metrics': {
        const { tokenAddress } = args as { tokenAddress: string };
        
        if (!tokenAddress) {
          throw new Error('Token address is required');
        }

        const metrics = await pumpFunService.getTokenMetrics(tokenAddress);
        
        const summary = `# 📊 Token Metrics\n\n` +
          `**Token Address:** \`${tokenAddress}\`\n\n` +
          `## Current Metrics\n\n` +
          pumpFunService.formatMetricsSummary(metrics);

        return {
          content: [
            {
              type: 'text',
              text: summary
            }
          ]
        };
      }

      case 'get-new-tokens': {
        const limit = args?.limit ?? 20;
        const tokens = await pumpFunService.getNewTokens(limit);
        
        const summary = `# 🆕 Recently Created Pump.fun Tokens\n\n` +
          `*Showing the latest ${limit} tokens*\n\n` +
          tokens.map((token, index) => 
            `## ${index + 1}. ${pumpFunService.formatTokenSummary(token)}\n`
          ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: summary
            }
          ]
        };
      }

      case 'get-token-holders': {
        const { tokenAddress, limit = 10 } = args as { tokenAddress: string; limit?: number };
        
        if (!tokenAddress) {
          throw new Error('Token address is required');
        }

        const holders = await pumpFunService.getTopHolders(tokenAddress, limit);
        
        const summary = `# 👥 Top ${limit} Holders\n\n` +
          `**Token Address:** \`${tokenAddress}\`\n\n` +
          holders.map((holder, index) => 
            `## ${index + 1}. Holder \`${holder.address.slice(0, 8)}...${holder.address.slice(-8)}\`\n` +
            `💰 Balance: ${holder.balance.toLocaleString()} tokens (${holder.percentage.toFixed(2)}%)\n` +
            `💵 Value: $${(holder.value_usd || 0).toLocaleString()}\n`
          ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: summary
            }
          ]
        };
      }

      case 'get-trade-analytics': {
        const { tokenAddress, period = '1h' } = args as { tokenAddress: string; period?: string };
        
        if (!tokenAddress) {
          throw new Error('Token address is required');
        }

        const analytics = await pumpFunService.getTradeAnalytics(tokenAddress, period as '5m' | '1h' | '24h');
        
        const summary = `# 📈 Trading Analytics (${period})\n\n` +
          `**Token Address:** \`${tokenAddress}\`\n\n` +
          `## Trading Activity\n` +
          `🔄 Total Trades: ${analytics.trades.toLocaleString()}\n` +
          `📈 Buys: ${analytics.buys} (${(analytics.buys / analytics.trades * 100).toFixed(1)}%)\n` +
          `📉 Sells: ${analytics.sells} (${(analytics.sells / analytics.trades * 100).toFixed(1)}%)\n` +
          `💰 Volume: ${analytics.volume.toFixed(4)} SOL ($${analytics.volumeUSD.toLocaleString()})\n` +
          `📊 Avg Trade Size: ${analytics.avgTradeSize.toFixed(6)} SOL\n` +
          `🎯 Largest Trade: ${analytics.largestTrade.toFixed(4)} SOL\n\n` +
          `## Participants\n` +
          `👥 Unique Buyers: ${analytics.buyers}\n` +
          `👥 Unique Sellers: ${analytics.sellers}\n` +
          `🏭 Market Makers: ${analytics.makers}\n\n` +
          `## Price Action\n` +
          `🔼 High: ${analytics.priceHigh.toFixed(8)} SOL\n` +
          `🔽 Low: ${analytics.priceLow.toFixed(8)} SOL\n` +
          `🚀 Open: ${analytics.priceOpen.toFixed(8)} SOL\n` +
          `🎯 Close: ${analytics.priceClose.toFixed(8)} SOL`;

        return {
          content: [
            {
              type: 'text',
              text: summary
            }
          ]
        };
      }

      case 'search-tokens': {
        const { query, limit = 10 } = args as { query: string; limit?: number };
        
        if (!query) {
          throw new Error('Search query is required');
        }

        // For demonstration, we'll search through top tokens
        // In a real implementation, this would use a proper search API
        const allTokens = await pumpFunService.getTopTokensByMarketCap(50);
        const filteredTokens = allTokens
          .filter(token => 
            token.name.toLowerCase().includes(query.toLowerCase()) ||
            token.symbol.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, limit);

        if (filteredTokens.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `# 🔍 Search Results\n\nNo tokens found matching "${query}"`
              }
            ]
          };
        }

        const summary = `# 🔍 Search Results for "${query}"\n\n` +
          `Found ${filteredTokens.length} token(s)\n\n` +
          filteredTokens.map((token, index) => 
            `## ${index + 1}. ${pumpFunService.formatTokenSummary(token)}\n`
          ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: summary
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // This will never resolve, keeping the server running
  await new Promise(() => {});
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
}); 