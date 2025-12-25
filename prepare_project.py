from dotenv import load_dotenv
import os
import asyncio
from vis2mobile_py.prompts.planner import get_prompt
from google.genai import types
from google import genai
from pathlib import Path
from vis2mobile_py.utils import html_to_image
import shutil


load_dotenv()

ORIGINAL_VISUALIZATION = Path(
    "./gallery/public/more-examples/budgets-desktop-processed.html"
)

PROJECT = Path("./mobile-vis-template")
ACTION_SPACE_DOCUMENT = Path("./gallery/public/mobile-vis-design-action-space.md")


async def get_plan():
    prompt = await get_prompt(
        source_path=ORIGINAL_VISUALIZATION,
        vis2mobile_design_action_space_path=ACTION_SPACE_DOCUMENT,
        ai_service="gemini",
    )
    client = genai.Client(
        api_key=os.getenv("GEMINI_KEY"),
    ).aio

    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="HIGH",
        ),
        media_resolution="MEDIA_RESOLUTION_HIGH",
    )
    response = await client.models.generate_content(
        model="gemini-3-pro-preview",
        contents=prompt,
        config=generate_content_config,
    )
    plan = response.parts[0].text
    return plan


async def main():
    original_folder = PROJECT / "original_visualization"
    original_image_desktop = await html_to_image(ORIGINAL_VISUALIZATION, "desktop")
    original_image_mobile = await html_to_image(ORIGINAL_VISUALIZATION, "mobile")
    original_image_desktop.save(original_folder / "desktop.png")
    original_image_mobile.save(original_folder / "desktop_on_mobile.png")
    shutil.copy2(ORIGINAL_VISUALIZATION, original_folder)
    shutil.copy2(ACTION_SPACE_DOCUMENT, PROJECT)
    plan = await get_plan()
    with open(PROJECT / "transform-plan.md", "w") as f:
        f.write(plan)
    print("Done")


if __name__ == "__main__":
    asyncio.run(main())
