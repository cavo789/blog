# type: ignore
# cspell:ignore networkidle

"""
Lazy Load Image Validator for React Sites

This script uses Playwright to render a React website in a headless Chromium browser,
scrolls the page to trigger lazy loading, and checks all <img> tags to see if they
use the 'loading="lazy"' attribute.

Usage in Docker:

    docker run -it --rm \
        -v ${PWD}:/app \
        -w /app \
        --entrypoint /bin/sh \
        mcr.microsoft.com/playwright/python:v1.55.0-jammy \
        -c "pip install --root-user-action=ignore beautifulsoup4 pillow playwright requests >/dev/null && python lazy-load.py"

Notes:
- The script ignores SSL errors (useful for local dev or self-signed certs)
- It scrolls the page multiple times to ensure lazy-loaded images appear in the DOM
- Requires 'beautifulsoup4' and 'playwright' Python packages
"""

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import time
import requests
from PIL import Image
from io import BytesIO
from urllib.parse import urljoin
import urllib3

# Disable SSL warnings for unverified HTTPS requests
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_image_size(src, base_url):
    if not src or src.startswith("data:"):
        return None  # skip inline images

    # Make relative URLs absolute
    full_url = urljoin(base_url, src)

    try:
        response = requests.get(full_url, stream=True, timeout=5, verify=False)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        return img.size  # returns (width, height)
    except Exception as e:
        print(f"⚠️ Could not get size for {full_url}: {e}")
        return None

# List of pages to check
urls = [
    "https://host.docker.internal:3000/",
    "https://host.docker.internal:3000/about",
    "https://host.docker.internal:3000/blog",
    "https://host.docker.internal:3000/blog/archive",
    # add more pages here
]

# Scrolling configuration
NUM_SCROLLS = 10       # Number of scrolls to perform to trigger lazy-loaded images
SCROLL_HEIGHT = 1000   # pixels per scroll
WAIT_PER_SCROLL = 1    # seconds to wait after each scroll

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for url in urls:
        print(f"\n🔎 Checking page: {url}")
        page = browser.new_page(ignore_https_errors=True)

        # Navigate and wait for network to be idle
        page.goto(url)
        page.wait_for_load_state("networkidle")

        # Scroll to trigger lazy loading
        for _ in range(NUM_SCROLLS):
            page.mouse.wheel(0, SCROLL_HEIGHT)
            time.sleep(WAIT_PER_SCROLL)

        # Get the rendered HTML
        html = page.content()
        page.close()

        # Parse HTML
        soup = BeautifulSoup(html, "html.parser")
        images = soup.find_all("img")

        print(f"{len(images)} images found on {url}\n")

        successes = []
        errors = []

        # Classify images
        for img in images:
            src = img.get("src") or "[missing src]"
            if img.get("loading") == "lazy":
                successes.append(src)
            else:
                size = get_image_size(src, url)  # pass the page URL as base
                if size:
                    width, height = size
                    if width * height > 100_000:  # threshold ~100 KB in pixels
                        errors.append(f"{src} (no lazy loading, big image {width}x{height})")
                    else:
                        successes.append(f"{src} (small image {width}x{height}, lazy load not needed)")
                else:
                    errors.append(f"{src} (no lazy loading, size unknown)")

        # Print successes first
        # for src in successes:
        #     print(f"✅ SUCCESS : {src}")

        for src in errors:
            print(f"❌ ERROR   : {src}")

    browser.close()
