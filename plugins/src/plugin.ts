/**
 * OpenCode plugin registration for Discord integration
 */

import type { Plugin } from '@opencode-ai/plugin';
import { DiscordClientWrapper } from './client/discord-client.js';
import { DiscordConnectionManager } from './client/connection-manager.js';
import {
  validateTokenFormat,
  formatAndValidateToken,
  InMemoryTokenStorage,
} from './storage/token-storage.js';
import type { DiscordEvent, ConnectionStatus, DiscordMessage } from './types/discord.js';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  discordSendMessage,
  discordGetMessages,
  discordGetChannels,
  discordGetStatus,
  discordReact,
  discordSearchMessages,
  discordCreateChannel,
  discordUpdateChannel,
  discordDeleteChannel,
  discordCreateCategory,
  setMentionHandler,
  invokeMentionHandler,
} from './tools/discord-tools.js';

// Global Discord client instance
let discordClient: DiscordClientWrapper | null = null;
let connectionManager: DiscordConnectionManager | null = null;

// Connection state
let connectionState = {
  token: '',
  ownerUsername: '',
  status: 'disconnected' as ConnectionStatus,
  lastError: null as any,
  rememberToken: false,
};

// OpenCode context for sending messages back
let openCodeContext: any = null;

// Bot ID and username for mention detection
let botInfo = {
  id: '',
  username: '',
  tag: '',
};

/**
 * Load token from config.json file
 */
function loadConfig(): { token: string | null, ownerUsername: string | null } {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const configPath = join(__dirname, '..', 'config.json');
    const configData = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    const token = config.discordBotToken && typeof config.discordBotToken === 'string' ? config.discordBotToken : null;
    const ownerUsername = config.ownerUsername && typeof config.ownerUsername === 'string' ? config.ownerUsername : null;
    
    if (token) {
      console.log('[Discord Plugin] Loaded token from config.json');
    }
    if (ownerUsername) {
      console.log('[Discord Plugin] Loaded owner username from config.json');
    }
    
    return { token, ownerUsername };
  } catch (error) {
    console.log('[Discord Plugin] No config.json found or invalid, will use auth flow');
  }
  return { token: null, ownerUsername: null };
}

/**
 * Save config to config.json file
 */
function saveConfig(token: string, ownerUsername: string) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const configPath = join(__dirname, '..', 'config.json');
    const config = {
      discordBotToken: token,
      ownerUsername: ownerUsername,
    };
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('[Discord Plugin] Saved config to config.json');
  } catch (error) {
    console.error('[Discord Plugin] Error saving config:', error);
  }
}

/**
 * Load token from config.json file
 */
function loadTokenFromConfig(): string | null {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const configPath = join(__dirname, '..', 'config.json');
    const configData = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);
    
    if (config.discordBotToken && typeof config.discordBotToken === 'string') {
      console.log('[Discord Plugin] Loaded token from config.json');
      return config.discordBotToken;
    }
  } catch (error) {
    console.log('[Discord Plugin] No config.json found or invalid, will use auth flow');
  }
  return null;
}

/**
 * Discord plugin for OpenCode
 */
export const DiscordPlugin: Plugin = async (ctx) => {
  console.log('[Discord Plugin] Initializing...');
  
  openCodeContext = ctx;

  // Load config from config.json
  const { token: configToken, ownerUsername: configOwner } = loadConfig();

  // Initialize Discord client
  discordClient = new DiscordClientWrapper();

  // Initialize connection manager
  connectionManager = new DiscordConnectionManager(discordClient, {
    initialTimeout: 10000,
    healthCheckInterval: 30000,
    maxReconnectAttempts: 5,
    reconnectDelayStart: 1000,
    reconnectDelayMax: 30000,
    enableHealthChecks: true,
  });

  // Auto-connect if we have a token from config
  if (configToken) {
    connectionState.token = configToken;
    connectionState.rememberToken = true;
    
    if (configOwner) {
      connectionState.ownerUsername = configOwner;
    }
    
    console.log('[Discord Plugin] Auto-connecting with token from config.json');
    try {
      await connectionManager.connect(configToken);
      
      // Get bot info after connection
      if (discordClient?.isReady()) {
        const discordJsClient = (discordClient as any).client;
        if (discordJsClient?.user) {
          botInfo.id = discordJsClient.user.id;
          botInfo.username = discordJsClient.user.username;
          botInfo.tag = discordJsClient.user.tag;
          console.log(`[Discord Plugin] Bot connected: ${botInfo.tag}`);
        }
      }
    } catch (error) {
      console.error('[Discord Plugin] Auto-connect failed:', error);
    }
  }

  // Auto-connect if we have a token from config
  if (configToken) {
    console.log('[Discord Plugin] Auto-connecting with token from config.json');
    try {
      await connectionManager.connect(configToken);
    } catch (error) {
      console.error('[Discord Plugin] Auto-connect failed:', error);
    }
  }

  // Set up Discord client event handler to update state
  discordClient.on((event: DiscordEvent) => {
    switch (event.type) {
      case 'connecting':
        connectionState.status = 'connecting';
        break;
      case 'reconnecting':
        connectionState.status = 'reconnecting';
        break;
      case 'ready':
        connectionState.status = 'connected';
        connectionState.lastError = null;
        break;
      case 'disconnect':
        connectionState.status = 'disconnected';
        break;
      case 'error':
        connectionState.status = 'error';
        connectionState.lastError = event.error;
        break;
      case 'message':
        console.log(`[Discord Plugin] New message in #${event.message.channelName}`);
        // Record message in connection manager
        connectionManager?.recordMessageReceived();
        
        // Check for @Senter mention
        checkForMention(event.message);
        break;
    }
  });

  // Set up connection manager event handlers
  connectionManager.on((event) => {
    console.log('[Discord Plugin] Connection manager event:', event.type);

    if (event.type === 'stateChange') {
      connectionState.status = event.newState as ConnectionStatus;
    }

    if (event.type === 'connectionLost') {
      console.error(`[Discord Plugin] Connection lost: ${event.reason}`);
    }
  });

  return {
    // Auth hook for Discord token management
    auth: {
      provider: 'discord',
      loader: async (authFn, provider) => {
        // Load saved token from OpenCode secure storage
        try {
          const authResult = await authFn();
          if (authResult && typeof authResult === 'object' && 'key' in authResult) {
            connectionState.token = authResult.key as string;
            return { token: authResult.key };
          }
        } catch (error) {
          console.error('[Discord Plugin] Error loading auth:', error);
        }
        return {};
      },
      methods: [
        {
          type: 'api',
          label: 'Discord Bot Token',
          prompts: [
            {
              type: 'text',
              key: 'token',
              message: 'Enter your Discord bot token:',
              validate: (value: string) => {
                const validation = formatAndValidateToken(value);
                if (!validation.valid) {
                  return validation.error || 'Invalid token';
                }
                return undefined;
              },
            },
            {
              type: 'text',
              key: 'ownerUsername',
              message: 'Enter your Discord username (the user who should receive @Senter replies):',
              condition: (inputs) => {
                // Only show if token is valid and we don't have owner username
                const token = inputs?.token;
                return !!(token && validateTokenFormat(token) && !connectionState.ownerUsername);
              },
            },
            {
              type: 'text',
              key: 'remember',
              message: 'Remember this token and username? (yes/no)',
              placeholder: 'yes',
              condition: (inputs) => {
                // Only show if token is valid
                const token = inputs?.token;
                return !!(token && validateTokenFormat(token));
              },
            },
          ],
          async authorize(inputs) {
            const token = inputs?.token;
            const ownerUsername = inputs?.ownerUsername || connectionState.ownerUsername;
            const remember = inputs?.remember === 'yes' || inputs?.remember === 'true';

            if (!token) {
              return { type: 'failed' };
            }

            // Validate token format
            const validation = formatAndValidateToken(token);
            if (!validation.valid) {
              console.error('[Discord Plugin] Invalid token:', validation.error);
              return { type: 'failed' };
            }

            // Store token and owner username
            connectionState.token = token;
            connectionState.ownerUsername = ownerUsername || '';
            connectionState.rememberToken = remember;

            // Save config if requested
            if (remember) {
              saveConfig(token, ownerUsername || '');
            }

            // Attempt connection using connection manager
            try {
              await connectionManager!.connect(token);
              
              // Get bot info after connection
              if (discordClient?.isReady()) {
                const discordJsClient = (discordClient as any).client;
                if (discordJsClient?.user) {
                  botInfo.id = discordJsClient.user.id;
                  botInfo.username = discordJsClient.user.username;
                  botInfo.tag = discordJsClient.user.tag;
                  console.log(`[Discord Plugin] Bot connected: ${botInfo.tag}`);
                }
              }
              
              return {
                type: 'success',
                key: token, // Store the actual token as the key
              };
            } catch (error) {
              console.error('[Discord Plugin] Connection failed:', error);
              return { type: 'failed' };
            }
          },
        },
      ],
    },

    // Register Discord tools
    tool: {
      'discord.send-message': discordSendMessage,
      'discord.get-messages': discordGetMessages,
      'discord.get-channels': discordGetChannels,
      'discord.get-status': discordGetStatus,
      'discord.react': discordReact,
      'discord.search-messages': discordSearchMessages,
      'discord.create-channel': discordCreateChannel,
      'discord.update-channel': discordUpdateChannel,
      'discord.delete-channel': discordDeleteChannel,
      'discord.create-category': discordCreateCategory,
    },

    // Event hook to handle OpenCode events
    event: async ({ event }) => {
      // Handle OpenCode events if needed
      console.log('[Discord Plugin] Received event:', event.type);
      // Add event-specific handling as needed
    },
  };
};

/**
 * Get Discord client instance (for internal use)
 */
export function getDiscordClient(): DiscordClientWrapper | null {
  return discordClient;
}

/**
 * Get connection manager instance (for internal use)
 */
export function getConnectionManager(): DiscordConnectionManager | null {
  return connectionManager;
}

/**
 * Get connection state
 */
export function getConnectionState() {
  return connectionState;
}

/**
 * Check if message mentions the bot and route to OpenCode
 */
async function checkForMention(message: DiscordMessage) {
  // Ignore messages from bots
  if (message.author.id === botInfo.id) return;
  
  // Check if message mentions bot by username
  const botMention = `<@${botInfo.id}>`;
  const usernameMention = `@${botInfo.username}`;
  
  const mentionsBot = 
    message.content.includes(botMention) ||
    message.content.toLowerCase().includes(usernameMention.toLowerCase());
  
  if (!mentionsBot) return;
  
  console.log(`[Discord Plugin] @${botInfo.username} mentioned by ${message.author.username}`);
  
  // Log to OpenCode activity panel
  if (openCodeContext?.client) {
    await openCodeContext.client.app.log({
      service: 'discord',
      level: 'info',
      message: `@${message.author.username} mentioned @Senter in #${message.channelName}: ${message.content.substring(0, 100)}`,
      extra: {
        channelId: message.channelId,
        messageId: message.id,
        author: message.author.username,
        guild: message.guildName,
        channel: message.channelName,
      },
    });
  }
  
  // Try to show toast notification (TUI only)
  if (openCodeContext?.tui) {
    try {
      openCodeContext.tui.toast.show({
        message: `@Senter mentioned by ${message.author.username}`,
        title: 'Discord',
        duration: 5000,
      });
    } catch (error) {
      // Toast might not be available in all interfaces
      console.log('[Discord Plugin] Toast notification not available (tui.toast.show failed):', error);
    }
  }
  
  // Send to OpenCode via mention handler
  await invokeMentionHandler(message);
}

/**
 * Get bot info for mention detection
 */
export function getBotInfo() {
  return botInfo;
}

/**
 * Get owner username
 */
export function getOwnerUsername() {
  return connectionState.ownerUsername;
}

/**
 * Send message back to Discord (called by OpenCode agent)
 */
export async function sendToDiscord(channelId: string, content: string, files?: any[]) {
  if (!discordClient || !discordClient.isReady()) {
    console.error('[Discord Plugin] Cannot send: bot not connected');
    return;
  }
  
  try {
    const discordJsClient = (discordClient as any).client;
    const channel = await discordJsClient.channels.fetch(channelId);
    
    if (!channel || !channel.isTextBased()) {
      console.error(`[Discord Plugin] Cannot send to channel ${channelId}`);
      return;
    }
    
    if (files && files.length > 0) {
      await channel.send({ content, files });
    } else {
      await channel.send(content);
    }
    
    console.log(`[Discord Plugin] Sent message to ${channelId}`);
  } catch (error) {
    console.error('[Discord Plugin] Error sending to Discord:', error);
  }
}

/**
 * Set up mention handler that connects to OpenCode agent
 */
setMentionHandler(async (message: DiscordMessage) => {
  if (!openCodeContext) {
    console.error('[Discord Plugin] No OpenCode context available');
    return;
  }
  
  // Prepare context for OpenCode agent
  const agentPrompt = `
User @${message.author.username} mentioned @Senter in #${message.channelName} (channel ID: ${message.channelId}):

Message: ${message.content}

Guild: ${message.guildName || 'DM'}
Channel: ${message.channelName}
User ID: ${message.author.id}

Please respond to this user. Your response will be sent back to Discord.
- Send a direct response message first
- For large code or content, create markdown file attachments
- Keep responses under Discord's character limit when possible
`;

  // This would trigger the OpenCode agent
  // In practice, the agent system would need to call this
  console.log('[Discord Plugin] Routing mention to OpenCode agent...');
  console.log('[Discord Plugin] Channel to respond to:', message.channelId);
});
