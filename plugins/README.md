# Discord Plugin for AI Sandbox

Real-time Discord integration with channel management and intelligent mention responses.

---

## Features

### Core Functionality
- **Secure Discord Authentication**: Token-based authentication with config file support
- **Connection Management**: Automatic reconnection with exponential backoff, health monitoring, and error recovery
- **@Senter Mention Detection**: Respond to @Senter mentions by routing to OpenCode agents
- **Owner Tracking**: Knows your Discord username to prioritize your requests

### Channel Management
- **Create Channels**: Create new text channels in servers
- **Update Channels**: Modify channel names, topics, and categories
- **Delete Channels**: Remove channels when needed
- **Create Categories**: Organize channels with categories

### Message Tools
- **Send Messages**: Send direct responses or messages to channels
- **Get Message History**: Retrieve recent messages from any accessible channel
- **Search Messages**: Search across all channels for specific content
- **Reaction Support**: Add emoji reactions to Discord messages

### Smart Responses
- **Markdown File Attachments**: Large content sent as `.md` file attachments
- **Character Limit Awareness**: Keeps direct responses under Discord's 2000 character limit
- **Code Block Support**: Makes code and agent files shareable

---

## Installation

```bash
cd plugins
npm install
npm run build
```

---

## Configuration

Create a `config.json` file in the plugin directory:

```json
{
  "discordBotToken": "YOUR_DISCORD_BOT_TOKEN_HERE",
  "ownerUsername": "YOUR_DISCORD_USERNAME"
}
```

Or copy the example:

```bash
cp config.json.example config.json
# Edit config.json with your bot token and username
```

The plugin will automatically load the config and connect on startup.

### First-Time Setup

When you first use the plugin without a config file, you'll be prompted for:
1. **Discord Bot Token** - Your bot's token from Discord Developer Portal
2. **Owner Username** - Your Discord username (for prioritizing your requests)
3. **Remember Config** - Whether to save these settings for future use

---

## Discord Bot Setup

To use this plugin, you need a Discord bot:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Enable the necessary intents:
   - **Message Content Intent** (required)
   - **Server Members Intent** (required)
   - Presence Intent (optional)
5. Copy the bot token
6. Invite the bot to your servers with **Manage Channels** permission

### Important Note on DMs

**Discord bots cannot access user private DMs or group DMs.** Bots can only:
- See DMs sent TO the bot
- Access channels in servers they've been invited to

To interact with the bot, use channels in servers where the bot has access (like your "Senter Dev" server).

---

## Usage

### Responding to @Senter Mentions

When you mention `@Senter` in any channel the bot has access to:

1. The plugin detects the mention
2. Routes the message to OpenCode agents
3. Agent processes the request
4. Response sent back to the same channel:
   - **Direct response** in the message body (under 2000 chars)
   - **Large content** as attached `.md` files for sharing

Example in Discord:
```
@Senter create a new channel called "dev-ops" under the "Chat" category
```

### Available Tools

| Tool | Description | Usage |
|-------|-------------|---------|
| `discord.send-message` | Send text messages | "Send message to #general: Hello!" |
| `discord.get-messages` | Get message history | "Show me last 10 messages from #team-chat" |
| `discord.get-channels` | List all channels | "Show me all my channels" |
| `discord.create-channel` | Create new channel | "Create channel 'dev-ops' in guild 123" |
| `discord.update-channel` | Update channel | "Rename channel 456 to 'general'" |
| `discord.delete-channel` | Delete channel | "Delete channel 789" |
| `discord.create-category` | Create category | "Create category 'Projects' in guild 123" |
| `discord.get-status` | Check connection | "Check Discord status" |
| `discord.react` | Add reactions | "React with 👍 to message 456" |
| `discord.search-messages` | Search messages | "Search for 'bug' across channels" |

---

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

---

## Architecture

```
discord-plugin/
├── src/
│   ├── client/                # Discord.js wrapper and connection manager
│   ├── storage/                # Token management and validation
│   ├── tools/                  # Discord tool implementations
│   ├── types/                  # TypeScript definitions
│   ├── utils/                  # Utilities (LRU cache, etc.)
│   ├── plugin.ts               # Plugin entry point with mention handling
│   └── index.ts               # Main export
├── dist/                       # Compiled JavaScript
├── config.json.example          # Configuration template
└── package.json
```

---

## License

MIT
