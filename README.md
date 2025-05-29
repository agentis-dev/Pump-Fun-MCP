# Pump.fun MCP Server

A Model Context Protocol (MCP) server that provides live Pump.fun data and analytics. Get real-time information about tokens, trading activity, market metrics, and more from the Solana-based Pump.fun platform.

## 🚀 Features

- **Live Token Data**: Get real-time information about Pump.fun tokens
- **Market Analytics**: Trading volume, price changes, and market metrics
- **King of the Hill**: Track tokens in the competitive 30-35k market cap range
- **Token Discovery**: Find new tokens and search by name/symbol
- **Holder Analysis**: View top token holders and distribution
- **Trading Analytics**: Comprehensive trade data with time periods
- **No Mock Data**: Built to use live APIs (currently using demo data structure)

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Install Dependencies

```bash
cd pump-fun-mcp
npm install
```

### Build the Project

```bash
npm run build
```

## 🏃‍♂️ Usage

### Running with Claude Desktop

Add the following configuration to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pump-fun-mcp": {
      "command": "node",
      "args": ["path/to/pump-fun-mcp/dist/index.js"],
      "env": {
        "PUMPPORTAL_API_KEY": "your-api-key-here",
        "BITQUERY_API_KEY": "your-bitquery-key-here"
      }
    }
  }
}
```

### Running with npx

```bash
npx @agentis/pump-fun-mcp
```

### Development Mode

```bash
npm run dev
```

## 🔧 Available Tools

### `get-top-tokens`
Get the top Pump.fun tokens by market capitalization.
- **Parameters**: `limit` (optional, default: 10, max: 50)

### `get-king-of-hill`
Get King of the Hill tokens currently competing in the 30-35k market cap range.

### `get-token-metrics`
Get detailed metrics for a specific token.
- **Parameters**: `tokenAddress` (required) - The token mint address

### `get-new-tokens`
Get recently created Pump.fun tokens.
- **Parameters**: `limit` (optional, default: 20, max: 100)

### `get-token-holders`
Get top holders for a specific token.
- **Parameters**: 
  - `tokenAddress` (required) - The token mint address
  - `limit` (optional, default: 10, max: 50)

### `get-trade-analytics`
Get trading analytics for a specific token.
- **Parameters**: 
  - `tokenAddress` (required) - The token mint address
  - `period` (optional) - Time period: "5m", "1h", "24h" (default: "1h")

### `search-tokens`
Search for tokens by name or symbol.
- **Parameters**: 
  - `query` (required) - Search term
  - `limit` (optional, default: 10, max: 50)

## 📊 Example Queries

Ask Claude Desktop:

- "Show me the top 10 Pump.fun tokens by market cap"
- "What are the King of the Hill tokens right now?"
- "Get metrics for token address ABC123..."
- "Show me the latest 20 new tokens on Pump.fun"
- "Who are the top holders of token XYZ456?"
- "Get 24h trading analytics for token DEF789"
- "Search for tokens containing 'DOGE'"

## 🏗️ Architecture

```
src/
├── types/           # TypeScript type definitions
├── api/            # API clients (PumpPortal, Bitquery)
├── services/       # Business logic and data processing
├── utils/          # Helper functions and utilities
└── index.ts        # Main MCP server entry point
```

### Key Components

- **PumpFunService**: Main service layer handling data aggregation and caching
- **API Clients**: Interfaces for external data sources
- **Type System**: Comprehensive TypeScript types for all data structures
- **Utilities**: Formatting, validation, and helper functions

## 🌐 Data Sources

This MCP server is designed to work with multiple live data sources:

1. **PumpPortal API**: Real-time WebSocket data and REST endpoints
2. **Bitquery API**: GraphQL-based blockchain data queries
3. **Direct Solana RPC**: For on-chain data verification

> **Note**: Current implementation includes demo data structure. Live API integration requires proper API keys and endpoints.

## 🔑 API Keys

The server supports multiple API providers:

- `PUMPPORTAL_API_KEY`: For PumpPortal real-time data
- `BITQUERY_API_KEY`: For Bitquery blockchain analytics

Add these to your environment or MCP configuration.

## 🚦 Rate Limiting & Caching

- **Smart Caching**: 30-second cache for frequently requested data
- **Rate Limiting**: Respects API provider limits
- **Error Handling**: Robust retry mechanisms with exponential backoff

## 🧪 Development

### Project Structure

Following the architecture pattern from the referenced CoinCap MCP project but adapted for Pump.fun:

- Clean separation of concerns
- Modular API clients
- Comprehensive type system
- Utility-first helper functions
- Robust error handling

### Adding New Features

1. Define types in `src/types/`
2. Add API methods in `src/api/`
3. Implement business logic in `src/services/`
4. Add MCP tools in `src/index.ts`

### Testing

```bash
npm test
```

## 📝 Sample Prompts

Use these with Claude Desktop once the MCP server is configured:

```
"What are the hottest Pump.fun tokens right now?"
"Show me King of the Hill tokens competing for the crown"
"Get detailed metrics for this token: [address]"
"What new tokens were just created on Pump.fun?"
"Who holds the most of token [address]?"
"Show me 24h trading data for [token]"
"Search for meme tokens on Pump.fun"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the [CoinCap MCP project](https://github.com/wazzan/mcp-coincap-jj) architecture
- Built for the Model Context Protocol ecosystem
- Uses live Pump.fun and Solana blockchain data

## 🆘 Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Review the documentation
3. Join our community discussions

---

**Built with ❤️ for the Pump.fun and MCP communities** 