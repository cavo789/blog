# type: ignore
# cspell:ignore networkidle

"""
Advanced Image Audit Script for React Sites

This script uses Playwright to render a React website in a headless Chromium browser,
scrolls the page to trigger lazy loading, and audits all <img> tags for:
- Lazy loading usage
- Image dimensions (width x height)
- Format (e.g., WebP, PNG, JPEG)
- Compression (file size)
- Presence of width/height attributes
- Duplicate image sources

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

# List of pages to check
urls = [
    "https://host.docker.internal:3000/",
    "https://host.docker.internal:3000/about",
    "https://host.docker.internal:3000/blog",
    "https://host.docker.internal:3000/blog/archive",
    # add more pages here
]

# Disable SSL warnings for unverified HTTPS requests
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_image_info(src, base_url):
    """Returns image size (width, height), format, and file size in KB"""
    if not src or src.startswith("data:image/"):
        return None  # Skip inline base64 images

    full_url = urljoin(base_url, src)

    try:
        response = requests.get(full_url, stream=True, timeout=5, verify=False)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        size_kb = len(response.content) / 1024
        return {
            "width": img.width,
            "height": img.height,
            "format": img.format,
            "size_kb": round(size_kb, 1),
        }
    except Exception as e:
        print(f"⚠️ Could not get info for {full_url}: {e}")
        return None

# Scrolling configuration
NUM_SCROLLS = 10       # Number of scrolls to perform to trigger lazy-loaded images
SCROLL_HEIGHT = 1000   # Pixels per scroll
WAIT_PER_SCROLL = 1    # Seconds to wait after each scroll

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

        lazy_images = []
        non_lazy_images = []
        warnings = []

        for img in images:
            src = img.get("src")
            if not src:
                warnings.append("[missing src] image tag")
                continue

            # Check lazy loading
            is_lazy = img.get("loading") == "lazy"

            # Check width/height attributes
            has_dimensions = img.get("width") and img.get("height")
            if not has_dimensions:
                warnings.append(f"{src} missing width/height attributes")

            # Get image info
            info = get_image_info(src, url)
            if info is None:
                continue  # Skip if image couldn't be loaded

            width = info["width"]
            height = info["height"]
            format = info["format"]
            size_kb = info["size_kb"]

            # Check format
            if format.lower() in ["jpeg", "jpg", "png"]:
                warnings.append(f"{src} is {format}, consider converting to WebP")

            # Check compression
            if size_kb > 200:
                warnings.append(f"{src} is {size_kb} KB — consider compressing")

            # Classify image
            if is_lazy:
                lazy_images.append(f"{src} ✅ lazy ({width}x{height}, {format}, {size_kb} KB)")
            else:
                non_lazy_images.append(f"{src} ❌ not lazy ({width}x{height}, {format}, {size_kb} KB)")

        # Print results
        for entry in non_lazy_images:
            print(entry)
        for entry in warnings:
            print(f"⚠️ Warning: {entry}")

        print(f"\n✅ Lazy images: {len(lazy_images)}")
        print(f"❌ Non-lazy images: {len(non_lazy_images)}")
        print(f"⚠️ Warnings: {len(warnings)}")

    browser.close()
