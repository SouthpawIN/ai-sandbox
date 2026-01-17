#!/usr/bin/env python3
"""
Terminal Monitor
Monitor a named pipe to see terminal output in real-time
"""

import asyncio
import os


async def monitor_pipe(pipe_path="/tmp/senter-monitor.pipe"):
    """Monitor the named pipe for output"""

    print(f"Monitoring pipe: {pipe_path}")
    print("=" * 60)
    print("Waiting for data... (write to pipe with: echo 'text' > pipe)")
    print("=" * 60)

    # Open pipe for reading (this blocks until someone opens for writing)
    try:
        with open(pipe_path, "r") as pipe:
            print("\n✓ Pipe opened! Now reading output...\n")

            # Read lines as they come
            while True:
                line = pipe.readline()
                if not line:
                    # Empty read - pipe closed, try reopening
                    print("Pipe closed, reopening...")
                    await asyncio.sleep(0.5)
                    continue

                # Clean and display line
                clean_line = line.rstrip("\n")
                if clean_line:
                    print(f"📥 {clean_line}")

    except KeyboardInterrupt:
        print("\n\nMonitoring stopped")
    except FileNotFoundError:
        print(f"Error: Pipe not found at {pipe_path}")
        print("Create it with: mkfifo /tmp/senter-monitor.pipe")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(monitor_pipe())
