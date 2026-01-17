#!/usr/bin/env python3
"""
Open Terminal with Senter
Opens alacritty terminal running senter and monitors output
"""

import os
import subprocess
import asyncio
import select
import fcntl


def open_senter_terminal():
    """Open alacritty running senter and monitor it"""

    # Create monitoring pipe
    pipe_path = "/tmp/senter-terminal.pipe"
    try:
        os.mkfifo(pipe_path)
    except FileExistsError:
        pass

    print(f"✓ Created monitoring pipe: {pipe_path}")

    # Build command to run senter with script recording
    bash_cmd = f'script -f {pipe_path} -c "echo \\"=== Senter Terminal ===\\"; echo \\"Ready for monitoring...\\"; senter; echo \\"\\"; echo \\"Senter exited.\\"; exec bash"'

    # Open alacritty with this command
    cmd = ["alacritty", "-e", "bash", "-c", bash_cmd]

    print(f"\n🖥️  Opening alacritty with Senter...")
    print(f"   Monitoring pipe: {pipe_path}")
    print("=" * 60)
    print("Waiting for Senter to start...\n")

    # Start terminal
    proc = subprocess.Popen(
        cmd, env={**os.environ, "DISPLAY": ":0"}, start_new_session=True
    )

    # Monitor the pipe
    try:
        with open(pipe_path, "r") as pipe:
            # Set non-blocking
            fl = fcntl.fcntl(pipe.fileno(), fcntl.F_GETFL)
            fcntl.fcntl(pipe.fileno(), fcntl.F_SETFL, fl | os.O_NONBLOCK)

            output_lines = 0
            found_senter = False

            while True:
                # Check if terminal process is still running
                if proc.poll() is not None:
                    print(f"\n✓ Terminal closed (code: {proc.returncode})")
                    break

                # Try to read from pipe
                try:
                    data = pipe.read(1024)
                    if data:
                        # Clean ANSI codes
                        import re

                        clean = re.sub(r"\x1b\[[0-9;]*[a-zA-Z]", "", data)
                        clean = re.sub(r"\x1b\]0;.*\x07", "", clean)

                        if clean.strip():
                            output_lines += 1
                            if output_lines <= 50:
                                print(f"[{output_lines:04d}] {clean[:200]}", end="")
                            else:
                                print(".", end="", flush=True)

                            if "senter" in clean.lower():
                                found_senter = True
                                print("\n✓ Senter detected!")

                except IOError:
                    # No data, wait
                    import time

                    time.sleep(0.1)

            print(f"\n\n✓ Processed {output_lines} lines")
            if found_senter:
                print("✓ Senter was running in the terminal")

    except KeyboardInterrupt:
        print("\n\nStopping...")
    except FileNotFoundError:
        print("Error: Pipe not found - waiting for script to start...")
    except Exception as e:
        print(f"\nError: {e}")

    finally:
        # Cleanup
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except:
            pass

        try:
            os.remove(pipe_path)
        except:
            pass

        print("✓ Cleanup complete")


if __name__ == "__main__":
    open_senter_terminal()
