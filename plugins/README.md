# Discord Plugin

Discord integration plugin for ai-sandbox that enables real-time Discord interaction through chat tools.

## Features

- **Secure Discord Authentication**: Token-based authentication with config file support
- **Connection Management**: Automatic reconnection with exponential backoff, health monitoring, and error recovery
- **Message Tools**: Send messages, retrieve messages, and interact with Discord channels
- **Channel Discovery**: List and discover available Discord channels
- **Reaction Support**: Add emoji reactions to Discord messages
- **Rate Limiting**: Built-in rate limiting through discord.js
- **Error Handling**: Comprehensive error detection and classification

## Installation

```bash
cd plugins
npm install
npm run build
```

## Configuration

Create a `config.json` file in the plugin directory:

```json
{
  "discordBotToken": "YOUR_DISCORD_BOT_TOKEN_HERE"
}
```

Or copy the example and fill in your token:

```bash
cp config.json.example config.json
# Edit config.json with your bot token
```

The plugin will automatically load the token and connect on startup.

## Discord Bot Setup

To use this plugin, you need a Discord bot token:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Enable the necessary intents:
   - Message Content Intent
   - Server Members Intent
   - Presence Intent (optional)
5. Copy the bot token
6. Invite the bot to your servers with required permissions

## Available Tools

| Tool | Description | Usage |
|-------|-------------|---------|
| `discord.send-message` | Send text messages | "Send message to #general: Hello!" |
| `discord.get-messages` | Get message history | "Show me last 10 messages" |
| `discord.get-channels` | List channels | "Show me all channels" |
| `discord.get-status` | Check connection | "Check Discord status" |
| `discord.react` | Add reactions | "React with 👍 to last message" |
| `discord.search-messages` | Search messages | "Search for 'bug'" |

## Development

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Watch Mode

```bash
npm run dev
```

## License

MIT
