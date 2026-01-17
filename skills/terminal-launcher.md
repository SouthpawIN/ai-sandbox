# Terminal Launcher

Open and monitor terminal sessions for real-time interaction.

## Overview

Launch GUI terminals (alacritty/gnome-terminal), run commands, and monitor output in real-time.

## Quick Start

### Start Terminal with Monitoring

```bash
python3 /tmp/open-senter-terminal.py
```

Opens alacritty, runs `senter`, monitors output via named pipe.

### Start with Custom Command

Edit line 30 in `/tmp/open-senter-terminal.py`:
```python
# From: f'senter; '
# To:   f'your-command; '
```

## How It Works

### Architecture

```
Python Script → Create Pipe → Launch Terminal → Run Command
                                        ↓
                                    script → Pipe
                                        ↓
Python Script ← Monitor Pipe ← Display Output
```

### Components

1. **Named Pipe**: `/tmp/sender-terminal.pipe` for output capture
2. **Terminal Emulator**: alacritty (primary) or gnome-terminal (fallback)
3. **Script Command**: `script -f /path/to/pipe -c "command"` records terminal I/O
4. **Real-time Monitor**: Python reads pipe, cleans ANSI codes, displays output

## Usage

### Pattern 1: Run and Monitor

```bash
python3 /tmp/open-senter-terminal.py

# Output:
# ✓ Created monitoring pipe: /tmp/sender-terminal.pipe
# 🖥️  Opening alacritty with Senter...
# [0001] Script started on 2026-01-17 15:42:00
# [0002] GPU Detection Results
# [0003] ✅ Detected 4 GPU(s)
```

### Pattern 2: Multiple Terminals

```bash
# Terminal 1
PIPE1=/tmp/term1.pipe TERM1="senter" python3 /tmp/term1-runner.py &

# Terminal 2  
PIPE2=/tmp/term2.pipe TERM2="htop" python3 /tmp/term2-runner.py &

# Monitor both
tail -f $PIPE1 $PIPE2
```

### Pattern 3: Background Process

```bash
python3 /tmp/open-senter-terminal.py &
PID=$!

# Check logs later
cat /tmp/sender-terminal.log

# Stop
kill $PID
```

## Output Processing

### ANSI Code Stripping

```python
import re

# Remove colors and cursor movements
clean = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', data)

# Remove title sequences
clean = re.sub(r'\x1b\]0;.*\x07', '', clean)

# Display line
print(clean)
```

### Line Numbering

Each line is numbered for reference:
- `[0001]` - First line
- `[0042]` - 42nd line

## Troubleshooting

### Terminal Not Opening

```bash
# Check display
echo $DISPLAY  # Should be :0

# Check alacritty
which alacritty

# Try gnome-terminal fallback
```

### Pipe Errors

```bash
# Remove old pipe
rm /tmp/sender-terminal.pipe

# Create new
mkfifo /tmp/sender-terminal.pipe
```

## Customization

### Different Terminal Emulators

Edit `/tmp/open-senter-terminal.py` line 12:
```python
terminals = [
    'alacritty',      # Primary
    'gnome-terminal',  # Fallback
    'xfce4-terminal', # Other option
]
```

### Different Commands

```python
# Run multiple commands
bash_cmd = f'script -f {pipe_path} -c "echo Starting; cmd1; cmd2; exec bash"'
```

## Files

| File | Purpose |
|------|---------|
| `/tmp/open-senter-terminal.py` | Main terminal launcher |
| `/tmp/terminal-monitor.py` | Pipe monitoring utility |
| `/tmp/sender-terminal.pipe` | Default named pipe |

## Cleanup

```bash
# Kill terminal
pkill -f "alacritty"

# Remove pipe
rm -f /tmp/sender-terminal.pipe

# Kill monitor
pkill -f "open-senter-terminal.py"
```