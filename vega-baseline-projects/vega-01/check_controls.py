
from playwright.sync_api import sync_playwright
import time

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1920, "height": 1200})
        page.goto("http://localhost:19037")
        page.wait_for_load_state("networkidle")
        
        # Scroll down inside the phone frame if possible
        # The scrollable element is the one with overflow-y-auto inside Visualization
        # Let's find it and scroll it.
        # It's likely the first child of the phone frame's content area.
        
        # We can just use page.mouse.wheel or evaluate JS
        page.evaluate("document.querySelector('.overflow-y-auto').scrollTop = 500")
        time.sleep(1)
        
        page.locator("#phone-frame-container").screenshot(path="controls-check.png")
        browser.close()

if __name__ == "__main__":
    main()
