/**
 * Message store for Discord messages with LRU caching
 */

import type { DiscordMessage, DiscordChannel, DiscordGuild } from '../types/discord.js';
import { LRUCache } from '../utils/lru-cache.js';

/**
 * Message store configuration
 */
export interface MessageStoreConfig {
  maxMessagesPerChannel: number;
  maxTotalMessages: number;
  enableDeduplication: boolean;
}

/**
 * Default message store configuration
 */
export const DEFAULT_MESSAGE_STORE_CONFIG: MessageStoreConfig = {
  maxMessagesPerChannel: 1000,
  maxTotalMessages: 10000,
  enableDeduplication: true,
};

/**
 * Channel store with message cache
 */
export class ChannelMessageStore {
  private channelId: string;
  private messages: LRUCache<string, DiscordMessage>;
  private maxMessages: number;

  constructor(channelId: string, maxMessages: number) {
    this.channelId = channelId;
    this.messages = new LRUCache<string, DiscordMessage>(maxMessages);
    this.maxMessages = maxMessages;
  }

  /**
   * Add message to store
   */
  addMessage(message: DiscordMessage): void {
    if (message.channelId !== this.channelId) {
      throw new Error(`Message channel ${message.channelId} does not match store channel ${this.channelId}`);
    }
    this.messages.set(message.id, message);
  }

  /**
   * Get message by ID
   */
  getMessage(messageId: string): DiscordMessage | undefined {
    return this.messages.get(messageId);
  }

  /**
   * Get all messages in channel (newest first)
   */
  getAllMessages(): DiscordMessage[] {
    return Array.from(this.messages.values()).sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get messages with pagination
   */
  getMessagesPag(limit: number, before?: Date, after?: Date): DiscordMessage[] {
    let messages = this.getAllMessages();

    if (before) {
      messages = messages.filter(msg => msg.timestamp <= before);
    }

    if (after) {
      messages = messages.filter(msg => msg.timestamp >= after);
    }

    return messages.slice(0, limit);
  }

  /**
   * Update message
   */
  updateMessage(message: DiscordMessage): void {
    if (message.channelId !== this.channelId) {
      throw new Error(`Message channel ${message.channelId} does not match store channel ${this.channelId}`);
    }
    this.messages.set(message.id, message);
  }

  /**
   * Delete message
   */
  deleteMessage(messageId: string): boolean {
    return this.messages.delete(messageId);
  }

  /**
   * Get message count
   */
  count(): number {
    return this.messages.size();
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages.clear();
  }

  /**
   * Search messages by content
   */
  searchMessages(query: string, limit?: number): DiscordMessage[] {
    const allMessages = this.getAllMessages();
    const results = allMessages.filter(msg =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    return limit ? results.slice(0, limit) : results;
  }
}

/**
 * Main message store
 */
export class DiscordMessageStore {
  private channelStores: Map<string, ChannelMessageStore>;
  private channels: Map<string, DiscordChannel>;
  private guilds: Map<string, DiscordGuild>;
  private config: MessageStoreConfig;

  constructor(config: Partial<MessageStoreConfig> = {}) {
    this.config = { ...DEFAULT_MESSAGE_STORE_CONFIG, ...config };
    this.channelStores = new Map();
    this.channels = new Map();
    this.guilds = new Map();
  }

  /**
   * Add or update message
   */
  addMessage(message: DiscordMessage): void {
    let channelStore = this.channelStores.get(message.channelId);

    if (!channelStore) {
      channelStore = new ChannelMessageStore(message.channelId, this.config.maxMessagesPerChannel);
      this.channelStores.set(message.channelId, channelStore);
    }

    channelStore.addMessage(message);
  }

  /**
   * Get message by ID
   */
  getMessage(messageId: string): DiscordMessage | undefined {
    for (const channelStore of this.channelStores.values()) {
      const message = channelStore.getMessage(messageId);
      if (message) {
        return message;
      }
    }
    return undefined;
  }

  /**
   * Get messages for channel
   */
  getChannelMessages(channelId: string, limit?: number): DiscordMessage[] {
    const channelStore = this.channelStores.get(channelId);
    if (!channelStore) {
      return [];
    }
    return limit ? channelStore.getMessagesPag(limit) : channelStore.getAllMessages();
  }

  /**
   * Update message
   */
  updateMessage(message: DiscordMessage): void {
    const channelStore = this.channelStores.get(message.channelId);
    if (!channelStore) {
      return;
    }
    channelStore.updateMessage(message);
  }

  /**
   * Delete message
   */
  deleteMessage(messageId: string, channelId?: string): boolean {
    if (channelId) {
      const channelStore = this.channelStores.get(channelId);
      if (channelStore) {
        return channelStore.deleteMessage(messageId);
      }
      return false;
    }

    // Search all channels
    for (const channelStore of this.channelStores.values()) {
      if (channelStore.deleteMessage(messageId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add or update channel
   */
  addChannel(channel: DiscordChannel): void {
    this.channels.set(channel.id, channel);
  }

  /**
   * Get channel by ID
   */
  getChannel(channelId: string): DiscordChannel | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Get all channels
   */
  getAllChannels(): DiscordChannel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Get channels for guild
   */
  getGuildChannels(guildId: string): DiscordChannel[] {
    return this.getAllChannels().filter(ch => ch.guildId === guildId);
  }

  /**
   * Add or update guild
   */
  addGuild(guild: DiscordGuild): void {
    this.guilds.set(guild.id, guild);
    // Update channels from guild
    guild.channels.forEach(channel => {
      this.addChannel(channel);
    });
  }

  /**
   * Get guild by ID
   */
  getGuild(guildId: string): DiscordGuild | undefined {
    return this.guilds.get(guildId);
  }

  /**
   * Get all guilds
   */
  getAllGuilds(): DiscordGuild[] {
    return Array.from(this.guilds.values());
  }

  /**
   * Search messages across all channels
   */
  searchMessages(query: string, limit?: number): DiscordMessage[] {
    const allMessages: DiscordMessage[] = [];
    for (const channelStore of this.channelStores.values()) {
      allMessages.push(...channelStore.searchMessages(query));
    }
    // Sort by timestamp (newest first)
    allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? allMessages.slice(0, limit) : allMessages;
  }

  /**
   * Get DM channels
   */
  getDMChannels(): DiscordChannel[] {
    return this.getAllChannels().filter(ch => ch.type === 'dm');
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalMessages: Array.from(this.channelStores.values()).reduce((sum, store) => sum + store.count(), 0),
      totalChannels: this.channels.size,
      totalGuilds: this.guilds.size,
      channelStoreCount: this.channelStores.size,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.channelStores.clear();
    this.channels.clear();
    this.guilds.clear();
  }
}
