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
import type { DiscordEvent, ConnectionStatus } from './types/discord.js';
import {
  discordSendMessage,
  discordGetMessages,
  discordGetChannels,
  discordGetStatus,
  discordReact,
  discordSearchMessages,
} from './tools/discord-tools.js';

// Global Discord client instance
let discordClient: DiscordClientWrapper | null = null;
let connectionManager: DiscordConnectionManager | null = null;

// Connection state
let connectionState = {
  token: '',
  status: 'disconnected' as ConnectionStatus,
  lastError: null as any,
  rememberToken: false,
};

/**
 * Discord plugin for OpenCode
 */
export const DiscordPlugin: Plugin = async (ctx) => {
  console.log('[Discord Plugin] Initializing...');

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
              key: 'remember',
              message: 'Remember this token? (yes/no)',
              comment: 'yes',
              condition: (inputs) => {
                // Only show if token is valid
                const token = inputs?.token;
                return !!(token && validateTokenFormat(token));
              },
            },
          ],
          async authorize(inputs) {
            const token = inputs?.token;
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

            // Store token
            connectionState.token = token;
            connectionState.rememberToken = remember;

            // Attempt connection using connection manager
            try {
              await connectionManager!.connect(token);
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
