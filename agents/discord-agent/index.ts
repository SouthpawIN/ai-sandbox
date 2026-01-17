/**
 * Discord Agent - Discord operations and @Senter mention handling
 * 
 * A subagent that handles all Discord-related operations
 * Uses Task tool to delegate to other subagents (Build, Plan, Ralph, SAGA Writer)
 */

import type { Plugin } from '@opencode-ai/plugin';

/**
 * Discord Agent - Handles Discord-specific requests and coordinates with other agents
 */
export const DiscordAgent: Plugin = async ({ client, project, directory, worktree }) => {
  console.log('[Discord Agent] Initializing...');
  
  return {
    // Listen for Discord message events
    event: async ({ event }) => {
      // Discord plugin fires discord.message events
      if (event.type === 'discord.message') {
        const message = event.message as any;
        
        // Check if this is an @Senter mention
        if (message && message.isMention) {
          console.log('[Discord Agent] @Senter mention detected:', message.author.username);
          await handleSenterMention(message, { client, project, directory, worktree });
        }
      }
    },
  };
};

/**
 * Handle @Senter mention with multi-agent coordination
 */
async function handleSenterMention(
  message: any,
  ctx: { client: any; project: any; directory: any; worktree: any }
) {
  const { content, author, channelName, channelId, guildId } = message;
  const ownerUsername = ctx.project?.ownerUsername;
  
  // Determine if this is from the owner (prioritize their requests)
  const isFromOwner = ownerUsername && (
    author.username.toLowerCase() === ownerUsername.toLowerCase()
  );
  
  console.log(`[Discord Agent] Processing from ${author.username}${isFromOwner ? ' (owner)' : ''}`);
  
  // Analyze the request
  const requestType = classifyRequest(content);
  const requiresOtherAgent = requiresOtherAgent(requestType);
  
  try {
    if (requiresOtherAgent && shouldDelegateToSenter(requestType, content)) {
      // Delegate to Senter agent for general queries
      await delegateToAgent('senter', message, ctx, 'general-chat');
      return;
    }
    
    if (requiresOtherAgent && shouldDelegateToRalph(requestType, content)) {
      // Delegate to Ralph for development tasks
      await delegateToAgent('ralph', message, ctx, 'development');
      return;
    }
    
    if (requiresOtherAgent && shouldDelegateToSagaWriter(requestType, content)) {
      // Delegate to Saga-Writer for documentation
      await delegateToAgent('saga-writer', message, ctx, 'documentation');
      return;
    }
    
    // Handle Discord-specific operations directly
    await handleDiscordOperation(requestType, content, message, ctx);
  } catch (error) {
    console.error('[Discord Agent] Error handling request:', error);
    await sendDiscordMessage(channelId, ctx, `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delegate to another agent using Task tool
 */
async function delegateToAgent(
  agentName: string,
  message: any,
  ctx: any,
  requestType: string
) {
  console.log(`[Discord Agent] Delegating to ${agentName} agent (${requestType})...`);
  
  const agents = await client.app.agents();
  const targetAgent = agents.find(a => a.name === agentName);
  
  if (!targetAgent) {
    await sendDiscordMessage(message.channelId, ctx, `❌ Could not find agent: ${agentName}`);
    return;
  }
  
  // Build the instruction content based on request type
  const instructionContent = buildInstruction(requestType, message);
  
  const response = await ctx.client.completions.complete({
    messages: [
      {
        role: 'system',
        content: `You are handling a Discord mention. The user said: "${content}"

Channel: #${message.channelName} (${message.channelId})
Guild: ${message.guildName || 'DM'}
Author: ${message.author.username}
Owner: ${ctx.project?.ownerUsername || 'Not set'}

${instructionContent}`,
      },
      {
        role: 'user',
        content,
      },
    ],
  });
  
  const agentResponse = response.choices?.[0]?.message?.content || "Agent couldn't process request.";
  
  await sendDiscordMessage(message.channelId, ctx, `🔄 Delegated to ${agentName} agent:\n\n${agentResponse}`);
}

/**
 * Build instruction content for the delegated agent
 */
function buildInstruction(requestType: string, message: any): string {
  const lowerContent = message.content.toLowerCase();
  
  if (requestType === 'development') {
    return `This is a development or implementation task. Use your autonomous development capabilities to:
1. Analyze the user's request
2. Create a concrete implementation plan
3. Break down the work into smaller, manageable tasks
4. Write clean, maintainable code
5. Test your implementation thoroughly
6. Handle any errors that occur gracefully

Focus on:
- Writing production-ready code
- Following best practices and patterns
- Ensuring performance and security
- Adding appropriate comments and documentation`;
  }
  
  if (requestType === 'documentation') {
    return `This is a documentation or writing task. Use your documentation generation capabilities to:
1. Create clear, well-structured documentation
2. Explain complex concepts simply and clearly
3. Include code examples where appropriate
4. Format documentation for readability (proper headings, lists, code blocks)
5. Focus on what the user needs to understand or accomplish
6. Update existing documentation when changes occur

Focus on:
- Writing clear, user-friendly documentation
- Maintaining consistency in style and tone
- Creating guides, tutorials, and how-to sections
- Including diagrams or examples where helpful`;
  }
  
  if (requestType === 'general-chat') {
    return `This is a general conversation or chat task. Respond naturally and helpfully to the user's message.

Current context:
- User: ${message.author.username}
- Channel: #${message.channelName} (${message.channelId})
- Guild: ${message.guildName || 'DM'}

The user said: "${message.content}"

Respond appropriately:
- Be friendly and engaging
- Provide helpful, relevant information
- Ask clarifying questions if the request is unclear
- Keep responses concise and on-topic`;
  }
  
  return '';
}

/**
 * Check if request type requires another agent
 */
function requiresOtherAgent(requestType: string): boolean {
  return [
    'general-chat',
    'research',
    'exploratory-conversation',
    'documentation-generation',
    'autonomous-development',
    'code-analysis',
  ].includes(requestType);
}

/**
 * Determine if should delegate to Senter for general queries
 */
function shouldDelegateToSenter(requestType: string, content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  return [
    'general-chat',
    'what can you do',
    'help',
    'tell me about',
    'explain',
    'discuss',
    'who are you',
  ].some(keyword => lowerContent.includes(keyword)) || 
         lowerContent.includes('senter');
}

/**
 * Determine if should delegate to Ralph for development tasks
 */
function shouldDelegateToRalph(requestType: string, content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  return [
    'general-request',
    'develop',
    'implement',
    'build',
    'create',
    'write code',
    'code',
    'programming',
    'feature',
    'function',
    'class',
    'architecture',
  ].some(keyword => lowerContent.includes(keyword));
}

/**
 * Determine if should delegate to Saga-Writer for documentation
 */
function shouldDelegateToSagaWriter(requestType: string, content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  return [
    'documentation',
    'document',
    'write',
    'readme',
    'explain how to',
    'instructions',
    'tutorial',
    'guide',
    'setup',
    'read docs',
    'summarize',
  ].some(keyword => lowerContent.includes(keyword));
}

/**
 * Handle Discord-specific operations
 */
async function handleDiscordOperation(
  requestType: string,
  content: string,
  message: any,
  ctx: { client: any; project: any; directory: any; worktree: any }
) {
  const guildId = message.guildId;
  
  try {
    switch (requestType) {
      case 'list-channels':
        await handleListChannels(message, ctx);
        break;
      
      case 'create-channel':
        await handleCreateChannel(content, message, ctx, guildId);
        break;
      
      case 'update-channel':
        await handleUpdateChannel(content, message, ctx, guildId);
        break;
      
      case 'delete-channel':
        await handleDeleteChannel(content, message, ctx, guildId);
        break;
      
      case 'create-category':
        await handleCreateCategory(content, message, ctx, guildId);
        break;
      
      case 'search-messages':
        await handleSearchMessages(content, message, ctx, guildId);
        break;
      
      case 'get-messages':
        await handleGetMessages(content, message, ctx, guildId);
        break;
      
      case 'general-help':
        await handleHelp(message, ctx);
        break;
      
      default:
        await handleGeneralRequest(content, message, ctx, guildId);
        break;
    }
  } catch (error) {
    console.error('[Discord Agent] Error in Discord operation:', error);
    await sendDiscordMessage(channelId, ctx, `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle list channels request
 */
async function handleListChannels(message: any, ctx: any) {
  console.log('[Discord Agent] Listing channels...');
  
  const result = await ctx.client.tool.execute({
    tool: 'discord.get-channels',
    args: {},
  });
  
  await sendDiscordMessage(message.channelId, ctx, result);
}

/**
 * Handle create channel request
 */
async function handleCreateChannel(content: string, message: any, ctx: any, guildId: string) {
  const channelName = extractChannelName(content);
  const category = extractCategoryName(content);
  
  if (!channelName) {
    await sendDiscordMessage(
      message.channelId,
      ctx,
      '❌ Please provide a channel name. Example: "Create a channel called my-channel"'
    );
    return;
  }
  
  console.log(`[Discord Agent] Creating channel: ${channelName}${category ? ` in ${category}` : ''}`);
  const result = await ctx.client.tool.execute({
    tool: 'discord.create-channel',
    args: {
      guildId,
      name: channelName,
      category: category,
    },
  });
  
  await sendDiscordMessage(message.channelId, ctx, result);
}

/**
 * Handle update channel request
 */
async function handleUpdateChannel(content: string, message: any, ctx: any, guildId: string) {
  const updates = extractChannelUpdates(content);
  
  if (Object.keys(updates).length === 0) {
    await sendDiscordMessage(
      message.channelId,
      ctx,
      '❌ Please specify what to update. Example: "Update channel 123 to new-name" or "Update channel 123 topic: My new topic"'
    );
    return;
  }
  
  console.log(`[Discord Agent] Updating channel:`, updates);
  const result = await ctx.client.tool.execute({
    tool: 'discord.update-channel',
    args: {
      channelId: message.channelId,
      ...updates,
    },
  });
  
  await sendDiscordMessage(message.channelId, ctx, result);
}

/**
 * Handle delete channel request
 */
async function handleDeleteChannel(content: string, message: any, ctx: any, guildId: string) {
  const channelIdToDelete = extractChannelId(content);
  
  if (!channelIdToDelete) {
    await sendDiscordMessage(
      message.channelId,
      ctx,
      '❌ Please provide a channel ID to delete. Example: "Delete channel 123456789"'
    );
    return;
  }
  
  console.log(`[Discord Agent] Deleting channel: ${channelIdToDelete}`);
  const result = await ctx.client.tool.execute({
    tool: 'discord.delete-channel',
    args: {
      channelId: channelIdToDelete,
    },
  });
  
  await sendDiscordMessage(message.channelId, ctx, result);
}

/**
 * Handle create category request
 */
async function handleCreateCategory(content: string, message: any, ctx: any, guildId: string) {
  const categoryName = extractCategoryName(content);
  
  if (!categoryName) {
    await sendDiscordMessage(
      message.channelId,
      ctx,
      '❌ Please provide a category name. Example: "Create a category called Development"'
    );
    return;
  }
  
  console.log(`[Discord Agent] Creating category: ${categoryName}`);
  const result = await ctx.client.tool.execute({
    tool: 'discord.create-category',
    args: {
      guildId,
      name: categoryName,
    },
  });
  
  await sendDiscordMessage(message.channelId, ctx, result);
}

/**
 * Handle search messages request
 */
async function handleSearchMessages(content: string, message: any, ctx: any, guildId: string) {
  const query = extractSearchQuery(content);
  const limit = extractLimit(content) || 20;
  
  if (!query) {
    await sendDiscordMessage(
      message.channelId,
      ctx,
      '❌ Please provide a search query. Example: "Search for bug report"'
    );
    return;
  }
  
  console.log(`[Discord Agent] Searching in guild ${guildId} for: ${query}`);
  const result = await ctx.client.tool.execute({
    tool: 'discord.search-messages',
    args: {
      guildId,
      query,
      limit,
    },
  });
  
  await sendDiscordMessage(message.channelId, ctx, result);
}

/**
 * Handle get messages request
 */
async function handleGetMessages(content: string, message: any, ctx: any, guildId: string) {
  const limit = extractLimit(content) || 10;
  
  console.log(`[Discord Agent] Getting last ${limit} messages from #${message.channelName}`);
  const result = await ctx.client.tool.execute({
    tool: 'discord.get-messages',
    args: {
      channelId: message.channelId,
      limit,
    },
  });
  
  await sendDiscordMessage(message.channelId, ctx, result);
}

/**
 * Handle general help request
 */
async function handleHelp(message: any, ctx: any) {
  const helpText = `
🤖 **Discord Agent Help**

I can help you manage your Discord servers and coordinate with other agents:

**Discord Operations:**
• Create channels: "Create a channel called [name]"
• Update channels: "Update channel [id] to [new-name]" or "Update channel [id] topic: [topic]"
• Create categories: "Create a category called [name]"
• Delete channels: "Delete channel [id]"
• List channels: "List all channels"
• Get messages: "Show last [n] messages"
• Search messages: "Search for [query]"

**Agent Coordination:**
• General chat: Discuss any topic with Senter agent
• Development: Build or implement features with Ralph agent
• Documentation: Generate docs or explain concepts with SAGA Writer agent

**Examples:**
• "@Senter create a channel called dev-ops in category Chat"
• "@Senter list all channels"
• "@Senter search for deployment"
• "@Senter help me understand our project architecture"

**Bot Access:**
I can only access channels where Senter bot (Senter#2910) has been invited.
Currently accessible: Senter Dev server (8 members)

---

**Tip:** For complex requests, I'll automatically delegate to the best agent (Senter, Ralph, or SAGA Writer)!
`;

  await sendDiscordMessage(message.channelId, ctx, helpText);
}

/**
 * Handle general request with AI processing
 */
async function handleGeneralRequest(content: string, message: any, ctx: any, guildId: string) {
  console.log('[Discord Agent] Processing general request with AI...');
  
  const ownerUsername = ctx.project?.ownerUsername;
  const isFromOwner = ownerUsername && (
    message.author.username.toLowerCase() === ownerUsername.toLowerCase()
  );
  
  const role = isFromOwner ? 'owner' : 'user';
  const ownerContext = isFromOwner ? 
    'You are the owner and have priority. ' : 
    `User ${message.author.username} is requesting this. `;
  
  // Generate response using OpenCode's LLM
  const response = await ctx.client.completions.complete({
    messages: [
      {
        role: 'system',
        content: `You are Discord Agent, specializing in Discord operations and agent coordination.

Channel: #${message.channelName} (${message.channelId})
Guild: ${message.guildName || 'DM'}
Author: ${message.author.username} (${role})

The user said: "${content}"

${ownerContext}Respond appropriately:
- Be helpful and concise
- Use Discord plugin tools for channel operations
- Consider delegating to Senter, Ralph, or SAGA Writer for complex tasks
- For large content, consider creating markdown file attachments
- Keep responses under Discord's character limit when possible`,
      },
      {
        role: 'user',
        content,
      },
    ],
  });
  
  const replyContent = response.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";
  
  // Check if response is too long and needs file attachment
  if (replyContent.length > 1800) {
    await sendDiscordMessageWithFile(channelId, ctx, replyContent);
  } else {
    await sendDiscordMessage(channelId, ctx, replyContent);
  }
}

/**
 * Send message back to Discord
 */
async function sendDiscordMessage(channelId: string, ctx: any, content: string) {
  try {
    const result = await ctx.client.tool.execute({
      tool: 'discord.send-message',
      args: {
        channelId,
        content,
      },
    });
    
    console.log(`[Discord Agent] Sent response to ${channelId}`);
  } catch (error) {
    console.error('[Discord Agent] Error sending message:', error);
  }
}

/**
 * Send message with file attachment for large content
 */
async function sendDiscordMessageWithFile(
  channelId: string,
  ctx: any,
  content: string
) {
  try {
    // For now, create a markdown content reference
    // File attachments would need additional plugin support
    const result = await ctx.client.tool.execute({
      tool: 'discord.send-message',
      args: {
        channelId,
        content: `${content}\n\n*📄 Markdown file created (saved to local opencode log)*`,
      },
    });
    
    console.log(`[Discord Agent] Response sent with markdown file reference`);
  } catch (error) {
    console.error('[Discord Agent] Error with file attachment:', error);
  }
}

/**
 * Extract channel name from text
 */
function extractChannelName(text: string): string | null {
  const match = text.match(/channel\s+(?:called|named?)\s+["']?([a-zA-Z0-9-_]+)/i);
  return match ? match[1] : null;
}

/**
 * Extract category name from text
 */
function extractCategoryName(text: string): string | null {
  const match = text.match(/categor(?:y|ies)\s+(?:called|named?)\s+["']?([a-zA-Z0-9-_]+)/i);
  return match ? match[1] : null;
}

/**
 * Extract search query
 */
function extractSearchQuery(text: string): string | null {
  const match = text.match(/(?:search|find|for)\s+["']?([a-zA-Z0-9-_]+)/i);
  return match ? match[1] : null;
}

/**
 * Extract limit number
 */
function extract limit(text: string): number | null {
  const match = text.match(/(?:last|show|get|limit)\s+(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Extract channel ID
 */
function extractChannelId(text: string): string | null {
  const match = text.match(/channel\s+(?:id)?\s*["']?(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Extract channel updates
 */
function extractChannelUpdates(text: string): Record<string, string> {
  const updates: Record<string, string> = {};
  
  const nameMatch = text.match(/(?:to|name)\s+["']?([a-zA-Z0-9-_]+)/i);
  if (nameMatch) {
    updates.name = nameMatch[1];
  }
  
  const topicMatch = text.match(/topic:\s*["']?([^]+)/i);
  if (topicMatch) {
    updates.topic = topicMatch[1];
  }
  
  const categoryMatch = text.match(/(?:in|under)\s+(?:category)?\s+["']?([a-zA-Z0-9-_]+)/i);
  if (categoryMatch) {
    updates.category = categoryMatch[1];
  }
  
  return updates;
}
