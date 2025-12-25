from pathlib import Path
from PIL import Image
from typing import Literal

from playwright.async_api import async_playwright
import io
import base64
from async_lru import alru_cache


@alru_cache(maxsize=32)
async def __get_image_bytes(
    path: str | Path, aspect_ratio: Literal["desktop", "mobile", "iphonex", "pixelxl"]
) -> bytes:
    viewports = {
        "desktop": {"width": 1920, "height": 1080},
        "mobile": {"width": 375, "height": 812},
        "iphonex": {"width": 375, "height": 812},
        "pixelxl": {"width": 411, "height": 731},
    }

    viewport = viewports[aspect_ratio]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport=viewport)

        # Convert path to absolute file URI
        file_url = Path(path).resolve().as_uri()
        await page.goto(file_url)

        # Take screenshot
        screenshot_bytes = await page.screenshot(type="png")
        await browser.close()
    return screenshot_bytes


async def html_to_image(
    path: str | Path,
    aspect_ratio: Literal["desktop", "mobile", "iphonex", "pixelxl"],
    return_type: Literal["image", "bytes_png", "base64_png"] = "image",
) -> Image.Image | bytes | str:
    assert aspect_ratio in ["desktop", "mobile", "iphonex", "pixelxl"], (
        f"Invalid aspect ratio: {aspect_ratio}"
    )
    screenshot_bytes = await __get_image_bytes(path, aspect_ratio)

    if return_type == "image":
        return Image.open(io.BytesIO(screenshot_bytes))
    elif return_type == "bytes_png":
        return screenshot_bytes
    elif return_type == "base64_png":
        return base64.b64encode(screenshot_bytes).decode("utf-8")
