/**
 * Connection manager with health checks and monitoring
 */

import type { ConnectionStatus, ConnectionError } from '../types/discord.js';
import type { DiscordClientWrapper } from './discord-client.js';

/**
 * Connection health metrics
 */
export interface ConnectionHealth {
  connectedAt: Date | null;
  lastPing: Date | null;
  pingLatency: number | null; // in milliseconds
  messagesReceived: number;
  messagesSent: number;
  reconnectCount: number;
  lastDisconnectReason: string | null;
}

/**
 * Connection statistics
 */
export interface ConnectionStats {
  uptime: number; // in seconds
  avgPingLatency: number | null;
  messagesPerMinute: number;
  connectionStability: number; // 0-100 percentage
}

/**
 * Connection manager configuration
 */
export interface ConnectionManagerConfig {
  initialTimeout: number; // milliseconds
  healthCheckInterval: number; // milliseconds
  maxReconnectAttempts: number;
  reconnectDelayStart: number; // milliseconds
  reconnectDelayMax: number; // milliseconds
  enableHealthChecks: boolean;
}

/**
 * Default connection manager configuration
 */
export const DEFAULT_CONNECTION_CONFIG: ConnectionManagerConfig = {
  initialTimeout: 10000, // 10 seconds
  healthCheckInterval: 30000, // 30 seconds
  maxReconnectAttempts: 5,
  reconnectDelayStart: 1000, // 1 second
  reconnectDelayMax: 30000, // 30 seconds
  enableHealthChecks: true,
};

/**
 * Connection manager state
 */
export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnecting'
  | 'disconnected'
  | 'error';

/**
 * Connection manager events
 */
export type ConnectionManagerEvent =
  | { type: 'stateChange'; oldState: ConnectionState; newState: ConnectionState }
  | { type: 'healthUpdate'; health: ConnectionHealth }
  | { type: 'reconnectAttempt'; attempt: number; delay: number }
  | { type: 'reconnectSuccess'; attempt: number }
  | { type: 'reconnectFailed'; attempt: number; error: string }
  | { type: 'connectionLost'; reason: string };

/**
 * Connection manager
 */
export class DiscordConnectionManager {
  private client: DiscordClientWrapper;
  private config: ConnectionManagerConfig;
  private state: ConnectionState = 'idle';
  private health: ConnectionHealth;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private eventHandlers: Array<(event: ConnectionManagerEvent) => void> = [];
  private messageTimestamps: Array<number> = [];
  private pingTimestamps: Array<number> = [];

  constructor(client: DiscordClientWrapper, config: Partial<ConnectionManagerConfig> = {}) {
    this.client = client;
    this.config = { ...DEFAULT_CONNECTION_CONFIG, ...config };
    this.health = this.createEmptyHealth();
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Get current health metrics
   */
  getHealth(): ConnectionHealth {
    return { ...this.health };
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    const now = Date.now();
    const uptime = this.health.connectedAt ? (now - this.health.connectedAt.getTime()) / 1000 : 0;

    // Calculate average ping latency
    const avgPingLatency =
      this.pingTimestamps.length > 0
        ? this.pingTimestamps.reduce((sum, val) => sum + val, 0) / this.pingTimestamps.length
        : null;

    // Calculate messages per minute over last 5 minutes
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const recentMessages = this.messageTimestamps.filter(ts => ts > fiveMinutesAgo);
    const messagesPerMinute = recentMessages.length / 5;

    // Calculate connection stability (based on reconnect count vs uptime)
    const connectionStability =
      this.health.reconnectCount > 0
        ? Math.max(0, 100 - (this.health.reconnectCount / (uptime / 3600)) * 10) // Less reconnects per hour = higher stability
        : 100;

    return {
      uptime,
      avgPingLatency,
      messagesPerMinute,
      connectionStability,
    };
  }

  /**
   * Connect to Discord with given token
   */
  async connect(token: string): Promise<void> {
    if (this.state === 'connecting' || this.state === 'connected') {
      throw new Error('Already connected or connecting');
    }

    this.setState('connecting');
    this.reconnectAttempts = 0;

    try {
      // Connect with timeout
      await Promise.race([
        this.client.connect(token),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), this.config.initialTimeout)
        ),
      ]);

      this.setState('connected');
      this.health.connectedAt = new Date();
      this.health.lastDisconnectReason = null;

      // Start health checks
      if (this.config.enableHealthChecks) {
        this.startHealthChecks();
      }
    } catch (error) {
      this.setState('error');
      throw error;
    }
  }

  /**
   * Disconnect from Discord
   */
  async disconnect(): Promise<void> {
    if (this.state === 'idle' || this.state === 'disconnected') {
      return;
    }

    this.setState('disconnecting');

    // Stop health checks
    this.stopHealthChecks();

    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Disconnect client
    await this.client.disconnect();
    this.setState('disconnected');
  }

  /**
   * Manual reconnect
   */
  async reconnect(): Promise<void> {
    if (this.state === 'connecting' || this.state === 'reconnecting') {
      throw new Error('Already connecting or reconnecting');
    }

    // Store current token for reconnection
    const status = this.client.getStatus();
    if (status === 'connected') {
      await this.disconnect();
    }

    // Note: We'd need to access the stored token here
    // For now, this would need to be called with a token
    throw new Error('Token must be provided for manual reconnect');
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.stopHealthChecks();

    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    if (this.state !== 'connected') {
      return;
    }

    const now = Date.now();

    // Update ping latency
    if (this.health.lastPing) {
      const latency = now - this.health.lastPing.getTime();
      this.pingTimestamps.push(latency);
      this.health.pingLatency = latency;

      // Keep only last 10 ping measurements
      if (this.pingTimestamps.length > 10) {
        this.pingTimestamps.shift();
      }
    }

    this.health.lastPing = new Date();

    // Check if client is still ready
    if (!this.client.isReady()) {
      this.handleConnectionLost('Client not ready');
    }

    // Emit health update
    this.emitEvent({ type: 'healthUpdate', health: this.getHealth() });
  }

  /**
   * Handle connection loss
   */
  private handleConnectionLost(reason: string): void {
    this.health.lastDisconnectReason = reason;
    this.stopHealthChecks();
    this.emitEvent({ type: 'connectionLost', reason });

    // Attempt to reconnect if enabled
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.setState('error');
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectDelayStart * Math.pow(2, this.reconnectAttempts - 1),
      this.config.reconnectDelayMax
    );

    this.emitEvent({ type: 'reconnectAttempt', attempt: this.reconnectAttempts, delay });

    this.reconnectTimer = setTimeout(() => {
      // Note: Reconnection would need token storage
      // This is a placeholder for reconnection logic
      console.log(`Reconnection attempt ${this.reconnectAttempts} scheduled`);
    }, delay);
  }

  /**
   * Set connection state
   */
  private setState(newState: ConnectionState): void {
    const oldState = this.state;
    this.state = newState;

    this.emitEvent({ type: 'stateChange', oldState, newState });
  }

  /**
   * Create empty health object
   */
  private createEmptyHealth(): ConnectionHealth {
    return {
      connectedAt: null,
      lastPing: null,
      pingLatency: null,
      messagesReceived: 0,
      messagesSent: 0,
      reconnectCount: 0,
      lastDisconnectReason: null,
    };
  }

  /**
   * Register event handler
   */
  on(handler: (event: ConnectionManagerEvent) => void): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  off(handler: (event: ConnectionManagerEvent) => void): void {
    this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
  }

  /**
   * Emit event to all handlers
   */
  private emitEvent(event: ConnectionManagerEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('[DiscordConnectionManager] Error in event handler:', error);
      }
    });
  }

  /**
   * Record message received
   */
  recordMessageReceived(): void {
    this.health.messagesReceived++;
    this.messageTimestamps.push(Date.now());

    // Keep only last 100 message timestamps
    if (this.messageTimestamps.length > 100) {
      this.messageTimestamps.shift();
    }
  }

  /**
   * Record message sent
   */
  recordMessageSent(): void {
    this.health.messagesSent++;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopHealthChecks();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.eventHandlers = [];
  }
}
