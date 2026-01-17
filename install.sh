#!/bin/bash

# AI Development Agents - One-Click Installation Script
# Installs Ralph, SAGA, Cartographer, and agents

set -e

echo "🚀 Installing AI Development Tools for OpenCode..."
echo ""
echo "This will install:"
echo "  - Ralph autonomous development loop"
echo "  - SAGA planning framework"
echo "  - Cartographer architecture mapper"
echo "  - SAGA-Writer agent (Tab-cyclable)"
echo "  - Ralph agent (@ralph mention)"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if OpenCode/Senter is installed
if [ ! -d "$HOME/.opencode" ] && [ ! -d "$HOME/.senter" ]; then
    echo "❌ Neither OpenCode nor Senter is installed!"
    echo "   Please install one of these first."
    exit 1
fi

# Determine which tool to install
if [ -d "$HOME/.opencode" ]; then
    AGENTS_DIR="$HOME/.opencode/agents"
    TOOL_NAME="OpenCode"
else
    AGENTS_DIR="$HOME/.senter/agents"
    TOOL_NAME="Senter"
fi

echo "📁 Installation directory: $AGENTS_DIR"
echo ""

# Step 1: Install Agents
echo "📦 Step 1/3: Installing agents..."
if [ -d "$AGENTS_DIR" ]; then
    cp "$SCRIPT_DIR/agents/saga-writer.md" "$AGENTS_DIR/saga-writer.md"
    cp "$SCRIPT_DIR/agents/ralph.md" "$AGENTS_DIR/ralph.md"
    echo "   ✅ Agents installed to $TOOL_NAME"
else
    echo "   ⚠️  Creating agents directory..."
    mkdir -p "$AGENTS_DIR"
    cp "$SCRIPT_DIR/agents/saga-writer.md" "$AGENTS_DIR/saga-writer.md"
    cp "$SCRIPT_DIR/agents/ralph.md" "$AGENTS_DIR/ralph.md"
    echo "   ✅ Agents installed to $TOOL_NAME"
fi

# Step 2: Create Discord Plugin Directory
echo "📦 Step 2/3: Setting up Discord plugin..."
DISCORD_PLUGIN_DIR="$AGENTS_DIR/discord-plugin"
if [ ! -d "$DISCORD_PLUGIN_DIR" ]; then
    mkdir -p "$DISCORD_PLUGIN_DIR"
    echo "   ✅ Discord plugin directory created"
fi

# Copy Discord plugin source
cp -r "$SCRIPT_DIR/plugins/src/"* "$DISCORD_PLUGIN_DIR/"
cp "$SCRIPT_DIR/plugins/"*.json "$DISCORD_PLUGIN_DIR/" 2>/dev/null || true
cp "$SCRIPT_DIR/plugins/"*.md "$DISCORD_PLUGIN_DIR/" 2>/dev/null || true
echo "   ✅ Discord plugin source copied"

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📦 Installed components:"
echo "   ✅ SAGA-Writer agent: $AGENTS_DIR/saga-writer.md"
echo "   ✅ Ralph agent: $AGENTS_DIR/ralph.md"
echo "   ✅ Discord plugin: $DISCORD_PLUGIN_DIR/"
echo ""
echo "📝 Next steps:"
echo "   1. Restart $TOOL_NAME"
echo "   2. Press Tab to cycle agents (should see saga-writer)"
echo "   3. To install Discord plugin dependencies:"
echo "      cd $DISCORD_PLUGIN_DIR"
echo "      npm install"
echo "      npm run build"
echo ""
echo "🎯 Available commands:"
echo "   Tab - Cycle through primary agents"
echo "   @saga-writer - Use SAGA-Writer agent"
echo "   @ralph - Use Ralph agent"
echo ""
echo "💡 Discord Plugin Setup:"
echo "   cd $DISCORD_PLUGIN_DIR"
echo "   npm install"
echo "   npm run build"
echo ""
echo "🚀 Ready to build! Transform ideas into applications in 3-5 hours."
