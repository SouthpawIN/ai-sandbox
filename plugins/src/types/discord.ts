/**
 * Discord-related type definitions for the Discord plugin
 */

import { type Message as DiscordJsMessage, type Guild, type Channel, type User, type TextBasedChannel } from 'discord.js';

/**
 * Connection status of the Discord client
 */
export type ConnectionStatus =
  | 'disconnected'  // Not connected
  | 'connecting'   // Connection in progress
  | 'connected'    // Connected and ready
  | 'reconnecting' // Reconnection in progress
  | 'error';       // Error state

/**
 * Stored Discord message representation
 */
export interface DiscordMessage {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    color: string | null;
  };
  content: string;
  timestamp: Date;
  editedTimestamp: Date | null;
  channelId: string;
  channelName: string;
  guildId: string | null;
  guildName: string | null;
  attachments: DiscordAttachment[];
  embeds: DiscordEmbed[];
  reactions: DiscordReaction[];
  replyTo: DiscordMessageReference | null;
}

/**
 * Discord attachment
 */
export interface DiscordAttachment {
  id: string;
  filename: string;
  url: string;
  contentType: string | null;
  size: number;
  description: string | null;
}

/**
 * Discord embed
 */
export interface DiscordEmbed {
  title: string | null;
  description: string | null;
  url: string | null;
  color: number | null;
  author: {
    name: string | null;
    url: string | null;
    iconUrl: string | null;
  };
  fields: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
  image: {
    url: string | null;
  };
  thumbnail: {
    url: string | null;
  };
  footer: {
    text: string | null;
    iconUrl: string | null;
  };
  timestamp: Date | null;
}

/**
 * Discord reaction
 */
export interface DiscordReaction {
  emoji: {
    name: string;
    id: string | null;
    animated: boolean;
  };
  count: number;
  me: boolean;
}

/**
 * Message reference (reply to another message)
 */
export interface DiscordMessageReference {
  messageId: string;
  channelId: string;
  guildId: string | null;
}

/**
 * Discord channel information
 */
export interface DiscordChannel {
  id: string;
  name: string;
  type: 'text' | 'dm' | 'voice' | 'announcement' | 'category';
  guildId: string | null;
  parentId: string | null;
  position: number;
  topic: string | null;
  permissionOverwrites: boolean; // Whether user has permissions
  unreadCount: number;
}

/**
 * Discord guild/server information
 */
export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  ownerId: string;
  roles: DiscordRole[];
  memberCount: number;
  channels: DiscordChannel[];
}

/**
 * Discord role
 */
export interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
}

/**
 * Connection error details
 */
export interface ConnectionError {
  type: 'network' | 'auth' | 'rate_limit' | 'unknown';
  message: string;
  code: number | null;
  recoverable: boolean;
}

/**
 * Discord client events
 */
export type DiscordEvent =
  | { type: 'ready' }
  | { type: 'message'; message: DiscordMessage }
  | { type: 'messageUpdate'; message: DiscordMessage }
  | { type: 'messageDelete'; messageId: string; channelId: string }
  | { type: 'connecting' }
  | { type: 'reconnecting' }
  | { type: 'disconnect'; reason: string }
  | { type: 'error'; error: ConnectionError };
