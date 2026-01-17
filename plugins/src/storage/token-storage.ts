/**
 * Secure token storage for Discord authentication
 */

import type { ConnectionStatus } from '../types/discord.js';

/**
 * Token storage interface
 */
export interface TokenStorage {
  /**
   * Store Discord bot token securely
   */
  setToken(token: string, remember?: boolean): Promise<void>;

  /**
   * Get stored Discord bot token
   */
  getToken(): Promise<string | null>;

  /**
   * Clear stored token
   */
  clearToken(): Promise<void>;

  /**
   * Check if token is persisted
   */
  isPersistent(): Promise<boolean>;
}

/**
 * Discord bot token format validation
 */
export const DISCORD_TOKEN_REGEX = /^M[A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}$/;

/**
 * Validate Discord bot token format
 */
export function validateTokenFormat(token: string): boolean {
  return DISCORD_TOKEN_REGEX.test(token);
}

/**
 * Create error message for invalid token
 */
export function getTokenValidationError(token: string): string | null {
  if (!token) {
    return 'Token is required';
  }

  if (token.length < 50 || token.length > 100) {
    return 'Token has invalid length';
  }

  if (!token.startsWith('M')) {
    return 'Token must start with "M"';
  }

  if (!DISCORD_TOKEN_REGEX.test(token)) {
    return 'Invalid Discord bot token format. Expected format: M[23 chars].[6 chars].[27 chars]';
  }

  return null;
}

/**
 * In-memory token storage (for development)
 */
export class InMemoryTokenStorage implements TokenStorage {
  private token: string | null = null;
  private persistent: boolean = false;

  async setToken(token: string, remember = false): Promise<void> {
    this.token = token;
    this.persistent = remember;
  }

  async getToken(): Promise<string | null> {
    return this.token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
    this.persistent = false;
  }

  async isPersistent(): Promise<boolean> {
    return this.persistent;
  }
}

/**
 * Token validation result
 */
export interface TokenValidationResult {
  valid: boolean;
  error: string | null;
  formatted: string;
}

/**
 * Format and validate Discord token
 */
export function formatAndValidateToken(token: string): TokenValidationResult {
  // Trim whitespace
  const formatted = token.trim();

  // Validate format
  const error = getTokenValidationError(formatted);

  return {
    valid: error === null,
    error,
    formatted,
  };
}

/**
 * Mask token for display (show only first 10 and last 4 characters)
 */
export function maskToken(token: string): string {
  if (!token || token.length < 14) {
    return '••••••••••••••';
  }
  return `${token.substring(0, 10)}${'•'.repeat(token.length - 14)}${token.substring(token.length - 4)}`;
}
