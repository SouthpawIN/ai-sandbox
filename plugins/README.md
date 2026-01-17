# Discord Plugin for OpenCode

Real-time Discord integration for OpenCode with natural language interaction.

---

## 🎯 Overview

A Discord integration plugin for OpenCode that enables real-time message monitoring and interaction through chat tools.

**Architecture:** This plugin implements Discord functionality as invocable tools rather than UI panels. This provides a more natural integration with OpenCode's existing workflow.

---

## 🚀 Installation

### From GitHub Repository

Clone and run the install script:

```bash
cd /home/sovthpaw/.opencode/agents/discord-plugin
npm install
npm run build
```

---

## 💡 Usage

### Connect to Discord

In an OpenCode session, type:
```
Connect to Discord with my bot token [YOUR_BOT_TOKEN]
```

The plugin will authenticate and connect to Discord automatically.

### Available Tools

| Tool | Description | Usage Example |
|-------|-------------|---------------|
| `discord.send-message` | Send text messages to channels or DMs | "Send message to #general: Hello!" |
| `discord.get-messages` | Retrieve message history from channels | "Show me last 10 messages from #random" |
| `discord.get-channels` | List available channels and guilds | "Show me all my channels" |
| `discord.get-status` | Check connection status and health | "Check Discord connection status" |
| `discord.react` | Add emoji reactions to messages | "React with 👍 to the last message" |
| `discord.search-messages` | Search Discord message content | "Search for 'bug' in messages" |

---

## 🔒 Getting a Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Enable necessary intents:
   - Message Content Intent
   - Server Members Intent
   - Presence Intent (optional)
5. Copy bot token (72 characters, starts with `MTAw...`)
6. Invite bot to your servers with required permissions

---

## 🏗️ Architecture

```
discord-plugin/
├── src/                        # TypeScript source code
│   ├── client/                # Discord.js wrapper
│   ├── storage/                # Token management
│   ├── store/                  # Message and channel storage
│   ├── tools/                  # Discord tool implementations
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utilities (LRU cache, etc.)
│   ├── plugin.ts               # Plugin entry point
│   └── index.ts               # Main export
├── dist/                       # Compiled JavaScript
│   ├── *.js                   # Output files
│   └── *.d.ts                 # TypeScript declarations
├── package.json                # Package manifest
└── tsconfig.json               # TypeScript configuration
```

---

## 🔒 Security Features

- **Token Storage** - Uses OpenCode's secure storage API
- **Token Validation** - Validates Discord bot token format
- **Rate Limiting** - Automatic handling of Discord API rate limits
- **No Hardcoded Secrets** - No tokens or secrets in code

---

## 📊 Features

### Connection Management
- **Auto-Reconnect** - Exponential backoff (1s → 30s max)
- **Connection Health** - Ping Discord gateway every 30s
- **Error Classification** - Network, auth, and rate limit errors
- **Graceful Shutdown** - Proper cleanup on disconnect

### Message Handling
- **LRU Cache** - 1000 messages per channel limit
- **Deduplication** - Prevent duplicate message IDs
- **History Pagination** - Load older messages on scroll
- **Search Across Channels** - Full-text search capability

---

## 🛠️ Troubleshooting

### Plugin Not Loading

```bash
# Check if plugin is built
ls dist/

# Check package.json exists
cat package.json
```

### Connection Issues

```bash
# Verify bot token format
# Discord bot tokens are 72 characters: [A-Za-z0-9_-]{59}

# Verify bot is in servers
# Make sure bot has proper intents enabled
```

---

## 📄 License

MIT License

---

**Part of the [AI Development Tools Collection](../README.md)**
