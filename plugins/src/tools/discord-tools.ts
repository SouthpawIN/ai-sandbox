/**
 * Discord tools for OpenCode - send messages, get channels, etc.
 */

import { tool, type ToolDefinition } from '@opencode-ai/plugin/tool';
import { getDiscordClient } from '../plugin.js';
import type { DiscordMessage, DiscordChannel, DiscordGuild } from '../types/discord.js';

/**
 * Send message to Discord channel or DM
 */
export const discordSendMessage: ToolDefinition = tool({
  description: 'Send a message to a Discord channel or direct message. Use this when you need to send notifications, replies, or updates to Discord.',
  args: {
    channelId: tool.schema.string().describe('Discord channel ID or recipient user ID for DM'),
    content: tool.schema.string().describe('Message content to send'),
  },
  async execute(args, context) {
    const client = getDiscordClient();

    if (!client) {
      return 'Error: Discord client not initialized';
    }

    if (!client.isReady()) {
      return 'Error: Discord client is not connected';
    }

    try {
      // Get the Discord.js client instance
      const discordJsClient = (client as any).client;

      if (!discordJsClient) {
        return 'Error: Discord.js client not available';
      }

      const channel = await discordJsClient.channels.fetch(args.channelId);

      if (!channel) {
        return `Error: Channel ${args.channelId} not found`;
      }

      if (!channel.isTextBased()) {
        return 'Error: Channel does not support text messages';
      }

      const sentMessage = await channel.send(args.content);

      return `Message sent successfully to channel ${args.channelId}. Message ID: ${sentMessage.id}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Error sending message: ${errorMessage}`;
    }
  },
});

/**
 * Get messages from a Discord channel
 */
export const discordGetMessages: ToolDefinition = tool({
  description: 'Get recent messages from a Discord channel. Useful for checking conversation history or monitoring activity.',
  args: {
    channelId: tool.schema.string().describe('Discord channel ID'),
    limit: tool.schema.number().optional().describe('Number of messages to retrieve (default: 10, max: 100)'),
  },
  async execute(args, context) {
    const client = getDiscordClient();

    if (!client) {
      return 'Error: Discord client not initialized';
    }

    if (!client.isReady()) {
      return 'Error: Discord client is not connected';
    }

    const limit = Math.min(args.limit || 10, 100);

    try {
      const messages = client.getChannelMessages(args.channelId);

      if (messages.length === 0) {
        return `No messages found in channel ${args.channelId}`;
      }

      const messageList = messages
        .slice(0, limit)
        .map((msg: DiscordMessage) => {
          const timestamp = msg.timestamp.toLocaleString();
          return `[${timestamp}] ${msg.author.username}: ${msg.content}`;
        })
        .join('\n');

      return `Recent messages from channel ${args.channelId}:\n\n${messageList}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Error getting messages: ${errorMessage}`;
    }
  },
});

/**
 * Get list of Discord channels
 */
export const discordGetChannels: ToolDefinition = tool({
  description: 'Get list of Discord channels and guilds the bot has access to. Useful for discovering available channels.',
  args: {
    guildId: tool.schema.string().optional().describe('Filter by specific guild ID (optional)'),
  },
  async execute(args, context) {
    const client = getDiscordClient();

    if (!client) {
      return 'Error: Discord client not initialized';
    }

    if (!client.isReady()) {
      return 'Error: Discord client is not connected';
    }

    try {
      // This would need access to the message store
      // For now, return a placeholder response
      return 'Discord channels listing would be available after full implementation';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Error getting channels: ${errorMessage}`;
    }
  },
});

/**
 * Get Discord connection status
 */
export const discordGetStatus: ToolDefinition = tool({
  description: 'Get current Discord connection status and health information.',
  args: {},
  async execute(args, context) {
    const client = getDiscordClient();

    if (!client) {
      return 'Discord client not initialized';
    }

    const status = client.getStatus();
    const lastError = client.getLastError();

    let response = `Discord Status: ${status}\n`;

    if (lastError) {
      response += `\nLast Error:\n`;
      response += `  Type: ${lastError.type}\n`;
      response += `  Message: ${lastError.message}\n`;
      response += `  Recoverable: ${lastError.recoverable}\n`;
    }

    if (status === 'connected') {
      response += '\nDiscord is connected and ready to send/receive messages.';
    } else if (status === 'connecting') {
      response += '\nDiscord is currently connecting...';
    } else if (status === 'reconnecting') {
      response += '\nDiscord is attempting to reconnect...';
    } else if (status === 'disconnected') {
      response += '\nDiscord is disconnected. Please authenticate with your bot token.';
    } else if (status === 'error') {
      response += '\nDiscord encountered an error. Check the error details above.';
    }

    return response;
  },
});

/**
 * React to a Discord message
 */
export const discordReact: ToolDefinition = tool({
  description: 'Add an emoji reaction to a Discord message.',
  args: {
    channelId: tool.schema.string().describe('Discord channel ID'),
    messageId: tool.schema.string().describe('Discord message ID'),
    emoji: tool.schema.string().describe('Emoji to react with (e.g., 👍, 🎉, or custom emoji name)'),
  },
  async execute(args, context) {
    const client = getDiscordClient();

    if (!client) {
      return 'Error: Discord client not initialized';
    }

    if (!client.isReady()) {
      return 'Error: Discord client is not connected';
    }

    try {
      const discordJsClient = (client as any).client;

      if (!discordJsClient) {
        return 'Error: Discord.js client not available';
      }

      const channel = await discordJsClient.channels.fetch(args.channelId);

      if (!channel || !channel.isTextBased()) {
        return `Error: Channel ${args.channelId} not found or does not support messages`;
      }

      const message = await channel.messages.fetch(args.messageId);

      if (!message) {
        return `Error: Message ${args.messageId} not found`;
      }

      await message.react(args.emoji);

      return `Reaction ${args.emoji} added to message ${args.messageId}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Error adding reaction: ${errorMessage}`;
    }
  },
});

/**
 * Search Discord messages
 */
export const discordSearchMessages: ToolDefinition = tool({
  description: 'Search for Discord messages containing specific text across channels.',
  args: {
    query: tool.schema.string().describe('Search query'),
    limit: tool.schema.number().optional().describe('Maximum number of results (default: 20)'),
  },
  async execute(args, context) {
    const client = getDiscordClient();

    if (!client) {
      return 'Error: Discord client not initialized';
    }

    if (!client.isReady()) {
      return 'Error: Discord client is not connected';
    }

    const limit = Math.min(args.limit || 20, 100);

    try {
      // This would need access to the message store
      // For now, return a placeholder
      return `Searching for "${args.query}" in Discord messages... (Full search implementation pending)`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return `Error searching messages: ${errorMessage}`;
    }
  },
});
