#!/bin/bash

# ai-sandbox Agent Bootstrap Script
# Downloads agents from ai-sandbox repo if they don't exist locally

AGENTS_REPO="https://github.com/SouthpawIN/ai-sandbox"
AGENTS_DIR="$HOME/.opencode/agents"
LOCAL_REPO="$HOME/ai-sandbox"

echo "[Agent Bootstrap] Initializing..."
echo "[Agent Bootstrap] Agents repo: $AGENTS_REPO"
echo "[Agent Bootstrap] Local agents dir: $AGENTS_DIR"
echo "[Agent Bootstrap] Local repo: $LOCAL_REPO"

# Create local agents directory if it doesn't exist
mkdir -p "$AGENTS_DIR"

# Handle discord-agent directory (contains multiple files)
echo "[Agent Bootstrap] Checking agent: discord-agent"
if [ ! -d "$AGENTS_DIR/discord-agent" ]; then
  echo "[Agent Bootstrap]   Creating discord-agent directory..."
  mkdir -p "$AGENTS_DIR/discord-agent"
fi

# Download all discord-agent files
DISCORD_AGENT_FILES=("agent.md" "discord-agent.md" "index.ts" "package.json" "tsconfig.json")
for file in "${DISCORD_AGENT_FILES[@]}"; do
  file_url="$AGENTS_REPO/raw/main/agents/discord-agent/$file"
  local_path="$AGENTS_DIR/discord-agent/$file"
  if curl -sf "$file_url" -o "$local_path" 2>/dev/null; then
    echo "[Agent Bootstrap]   Downloaded: discord-agent/$file"
  else
    echo "[Agent Bootstrap]   Warning: Failed to download discord-agent/$file"
  fi
done

# Handle standalone markdown agents
STANDALONE_AGENTS=("ralph" "saga-writer")
for agent in "${STANDALONE_AGENTS[@]}"; do
  echo "[Agent Bootstrap] Checking agent: $agent"
  agent_md="$AGENTS_DIR/${agent}.md"
  agent_url="$AGENTS_REPO/raw/main/agents/${agent}.md"
  
  if curl -sf "$agent_url" -o "$agent_md" 2>/dev/null; then
    echo "[Agent Bootstrap]   Downloaded: ${agent}.md"
  else
    echo "[Agent Bootstrap]   Warning: Failed to download ${agent}.md"
  fi
done

echo "[Agent Bootstrap] Agent bootstrap complete!"
echo "[Agent Bootstrap] Available agents:"
ls -1 "$AGENTS_DIR"
