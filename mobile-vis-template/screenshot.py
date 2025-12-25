"""
This script does the following:
1. Start `bun dev`, which will run a server at `http://localhost:3000`
2. Use playwright to take a screenshot of the page
3. Save the screenshot to `./mobile-version.png`
4. Stop the server

DO NOT MODIFY THIS SCRIPT
"""

import subprocess
import time
import os
import signal
import urllib.request
import logging
from playwright.sync_api import sync_playwright


def main():
    # Configure logging
    logging.basicConfig(level=logging.WARNING, format="%(levelname)s: %(message)s")

    # Get the directory of the script to run commands relative to it
    script_dir = os.path.dirname(os.path.abspath(__file__))

    logging.info("Starting bun dev server...")
    # Start the server
    # We use preexec_fn=os.setsid to be able to kill the whole process group later
    process = subprocess.Popen(
        ["bun", "dev"],
        cwd=script_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid,
    )

    try:
        # Wait for server to be ready
        logging.info("Waiting for server to be ready at http://localhost:3000...")
        max_retries = 30
        server_ready = False

        for i in range(max_retries):
            try:
                with urllib.request.urlopen("http://localhost:3000") as response:
                    if response.status == 200:
                        server_ready = True
                        break
            except Exception:
                time.sleep(1)

        if not server_ready:
            logging.error("Server failed to start in time.")
            # Print stdout/stderr for debugging
            if process.poll() is None:
                # It's still running but not responding?
                pass
            else:
                stdout, stderr = process.communicate()
                logging.error(f"Server Stdout: {stdout.decode(errors='replace')}")
                logging.error(f"Server Stderr: {stderr.decode(errors='replace')}")
            return

        logging.info("Server is ready. Taking screenshot...")

        with sync_playwright() as p:
            # Launch browser
            # We use a large viewport to ensure we can capture the whole phone frame without scrolling issues
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": 1920, "height": 1200})

            # Navigate
            page.goto("http://localhost:3000")

            # Wait for network idle to ensure everything loaded
            page.wait_for_load_state("networkidle")

            # Take screenshot
            output_path = os.path.join(script_dir, "mobile-version.png")
            page.locator("#phone-frame-container").screenshot(path=output_path)

            logging.info(f"Screenshot saved to {output_path}")
            print(f"Screenshot saved to {output_path}")
            browser.close()

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        # Print stdout/stderr from server if failed
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            logging.error(f"Server Stdout: {stdout.decode(errors='replace')}")
            logging.error(f"Server Stderr: {stderr.decode(errors='replace')}")

    finally:
        logging.info("Stopping server...")
        # Kill the process group to ensure child processes (Next.js) are also killed
        try:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            process.wait()
        except Exception:
            pass
        logging.info("Server stopped.")


if __name__ == "__main__":
    main()
