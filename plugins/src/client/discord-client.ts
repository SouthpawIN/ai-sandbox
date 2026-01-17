/**
 * Discord client wrapper - manages discord.js Client lifecycle
 */

import { Client, GatewayIntentBits } from 'discord.js';
import type { DiscordEvent, ConnectionStatus, ConnectionError, DiscordMessage } from '../types/discord.js';

// Discord bot token format validation
const DISCORD_TOKEN_REGEX = /^M[A-Za-z\d]{23,}\.([\w-]{6})\.([\w-]{27,})$/;

/**
 * Discord client wrapper class
 */
export class DiscordClientWrapper {
  private discordClient: Client | null = null;
  private token: string | null = null;
  private status: ConnectionStatus = 'disconnected';
  private lastError: ConnectionError | null = null;
  private eventHandlers: Array<(event: DiscordEvent) => void> = [];
  private messageCache = new Map<string, DiscordMessage>();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start at 1 second

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get last connection error if any
   */
  getLastError(): ConnectionError | null {
    return this.lastError;
  }

  /**
   * Get the Discord.js client instance
   */
  get client(): Client | null {
    return this.discordClient;
  }

  /**
   * Validate Discord bot token format
   */
  validateTokenFormat(token: string): boolean {
    return DISCORD_TOKEN_REGEX.test(token);
  }

  /**
   * Connect to Discord with given token
   */
  async connect(token: string): Promise<void> {
    // Validate token format
    if (!this.validateTokenFormat(token)) {
      const error: ConnectionError = {
        type: 'auth',
        message: 'Invalid Discord bot token format',
        code: null,
        recoverable: false,
      };
      this.setError(error);
      throw new Error('Invalid Discord bot token format');
    }

    // Disconnect existing client if any
    if (this.discordClient) {
      await this.disconnect();
    }

    this.token = token;
    this.status = 'connecting';
    this.lastError = null;
    this.emitEvent({ type: 'connecting' });

    try {
      // Create Discord client with necessary intents
      this.discordClient = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Login to Discord
      await this.discordClient.login(token);

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    } catch (error) {
      const discordError = this.classifyError(error);
      this.setError(discordError);
      this.status = 'error';
      throw discordError;
    }
  }

  /**
   * Disconnect from Discord
   */
  async disconnect(): Promise<void> {
    // Clear any pending reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Disconnect client if connected
    if (this.discordClient) {
      try {
        this.discordClient.destroy();
      } catch (error) {
        console.error('Error destroying Discord client:', error);
      }
      this.discordClient = null;
    }

    this.status = 'disconnected';
    this.token = null;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.messageCache.clear();

    this.emitEvent({ type: 'disconnect', reason: 'Disconnected by user' });
  }

  /**
   * Attempt to reconnect to Discord with exponential backoff
   */
  private async attemptReconnect(): Promise<void> {
    if (!this.token || this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.status = 'error';
      const error: ConnectionError = {
        type: 'network',
        message: 'Max reconnection attempts reached',
        code: null,
        recoverable: false,
      };
      this.setError(error);
      return;
    }

    this.status = 'reconnecting';
    this.reconnectAttempts++;
    this.emitEvent({ type: 'reconnecting' });

    // Calculate delay with exponential backoff
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Max 30s

    await new Promise((resolve) => {
      this.reconnectTimeout = setTimeout(resolve, delay);
    });

    try {
      await this.connect(this.token);
    } catch (error) {
      // If connection fails, attempt reconnect again
      this.attemptReconnect();
    }
  }

  /**
   * Set up Discord.js event handlers
   */
  private setupEventHandlers(): void {
    if (!this.discordClient) return;

    // Ready event
    this.discordClient.once('ready', () => {
      this.status = 'connected';
      this.lastError = null;
      this.reconnectAttempts = 0;
      this.emitEvent({ type: 'ready' });
      console.log(`Discord client connected as ${this.discordClient!.user?.tag}`);
    });

    // Message create event
    this.discordClient.on('messageCreate', (message) => {
      // Ignore messages from bots
      if (message.author.bot) return;

      // Ignore messages without text content
      const hasAttachments = message.attachments && message.attachments.size > 0;
      const embedsValue = message.embeds;
      const hasEmbeds = embedsValue && (Array.isArray(embedsValue) ? embedsValue.length > 0 : (embedsValue as any).size > 0);
      if (!message.content && !hasAttachments && !hasEmbeds) return;

      const discordMessage = this.transformMessage(message);
      this.messageCache.set(discordMessage.id, discordMessage);
      this.emitEvent({ type: 'message', message: discordMessage });
    });

    // Message update event
    this.discordClient.on('messageUpdate', (oldMessage, newMessage) => {
      // Ignore messages from bots
      if (newMessage.author?.bot) return;

      // Check if newMessage has content (it might be null if message was deleted)
      if (!newMessage.content && (!newMessage.embeds || newMessage.embeds.length === 0)) return;

      const discordMessage = this.transformMessage(newMessage);
      this.messageCache.set(discordMessage.id, discordMessage);
      this.emitEvent({ type: 'messageUpdate', message: discordMessage });
    });

    // Message delete event
    this.discordClient.on('messageDelete', (message) => {
      this.messageCache.delete(message.id);
      this.emitEvent({
        type: 'messageDelete',
        messageId: message.id,
        channelId: message.channelId,
      });
    });

    // Error event
    this.discordClient.on('error', (error) => {
      const discordError = this.classifyError(error);
      this.setError(discordError);

      // Attempt to reconnect if error is recoverable
      if (discordError.recoverable && this.token) {
        this.attemptReconnect();
      }
    });

    // Disconnection event
    this.discordClient.on('disconnect', () => {
      this.status = 'disconnected';
      this.emitEvent({ type: 'disconnect', reason: 'Disconnected from Discord gateway' });

      // Attempt to reconnect if we have a token
      if (this.token) {
        this.attemptReconnect();
      }
    });

    // Rate limit event
    this.discordClient.on('rateLimit', (rateLimitInfo) => {
      const error: ConnectionError = {
        type: 'rate_limit',
        message: `Rate limited for ${rateLimitInfo.timeout}ms on route ${rateLimitInfo.route}`,
        code: 429,
        recoverable: true,
      };
      this.setError(error);
    });
  }

  /**
   * Transform discord.js Message to our DiscordMessage format
   */
  private transformMessage(message: any): DiscordMessage {
    const guild = message.guild;
    const channel = message.channel;
    const author = message.author;
    const embedsArray = message.embeds;
    const reactionsCache = message.reactions?.cache;

    return {
      id: message.id,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatar: author.avatarURL(),
        color: message.member?.displayColor ? `#${message.member.displayColor.toString(16)}` : null,
      },
      content: message.content,
      timestamp: message.createdAt,
      editedTimestamp: message.editedAt,
      channelId: message.channelId,
      channelName: channel?.name || 'DM',
      guildId: guild?.id || null,
      guildName: guild?.name || null,
      attachments: Array.from(message.attachments.values()).map((att: any) => ({
        id: att.id,
        filename: att.name,
        url: att.url,
        contentType: att.contentType,
        size: att.size,
        description: att.description,
      })),
      embeds: Array.isArray(embedsArray) ? embedsArray.map((embed: any) => ({
        title: embed.title,
        description: embed.description,
        url: embed.url,
        color: embed.color,
        author: {
          name: embed.author?.name,
          url: embed.author?.url,
          iconUrl: embed.author?.iconURL,
        },
        fields: embed.fields?.map((field: any) => ({
          name: field.name,
          value: field.value,
          inline: field.inline,
        })) || [],
        image: {
          url: embed.image?.url,
        },
        thumbnail: {
          url: embed.thumbnail?.url,
        },
        footer: {
          text: embed.footer?.text,
          iconUrl: embed.footer?.iconURL,
        },
        timestamp: embed.timestamp,
      })) : [],
      reactions: reactionsCache ? Array.from(reactionsCache.values()).map((reaction: any) => ({
        emoji: {
          name: reaction.emoji.name,
          id: reaction.emoji.id,
          animated: reaction.emoji.animated,
        },
        count: reaction.count,
        me: reaction.me,
      })) : [],
      replyTo: message.reference ? {
        messageId: message.reference.messageId || '',
        channelId: message.reference.channelId,
        guildId: message.reference.guildId || null,
      } : null,
    };
  }

  /**
   * Classify an error and determine if it's recoverable
   */
  private classifyError(error: any): ConnectionError {
    const message = error?.message || 'Unknown error';

    // Network errors
    if (message.includes('ECONNRESET') || message.includes('ETIMEDOUT') || message.includes('ENOTFOUND')) {
      return {
        type: 'network',
        message,
        code: null,
        recoverable: true,
      };
    }

    // Authentication errors
    if (message.includes('Invalid token') || message.includes('401') || message.includes('403')) {
      return {
        type: 'auth',
        message,
        code: error?.code || null,
        recoverable: false,
      };
    }

    // Rate limit errors
    if (message.includes('429') || message.includes('rate limit')) {
      return {
        type: 'rate_limit',
        message,
        code: 429,
        recoverable: true,
      };
    }

    // Unknown error
    return {
      type: 'unknown',
      message,
      code: null,
      recoverable: true,
    };
  }

  /**
   * Set error state
   */
  private setError(error: ConnectionError): void {
    this.lastError = error;
    this.emitEvent({ type: 'error', error });
  }

  /**
   * Register an event handler
   */
  on(eventHandler: (event: DiscordEvent) => void): void {
    this.eventHandlers.push(eventHandler);
  }

  /**
   * Remove an event handler
   */
  off(eventHandler: (event: DiscordEvent) => void): void {
    this.eventHandlers = this.eventHandlers.filter(handler => handler !== eventHandler);
  }

  /**
   * Emit an event to all registered handlers
   */
  private emitEvent(event: DiscordEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in Discord event handler:', error);
      }
    });
  }

  /**
   * Get message from cache by ID
   */
  getMessage(messageId: string): DiscordMessage | undefined {
    return this.messageCache.get(messageId);
  }

  /**
   * Get all cached messages for a channel
   */
  getChannelMessages(channelId: string): DiscordMessage[] {
    return Array.from(this.messageCache.values()).filter(msg => msg.channelId === channelId);
  }

  /**
   * Check if client is ready
   */
  isReady(): boolean {
    return this.status === 'connected' && this.discordClient?.isReady() || false;
  }
}
