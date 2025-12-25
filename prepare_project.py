from dotenv import load_dotenv
import os
import asyncio
import argparse
from vis2mobile_py.prompts.planner import get_prompt
from google.genai import types
from google import genai
from pathlib import Path
from vis2mobile_py.utils import html_to_image
import shutil
import pathspec


def copy_project_template(template_path: Path, new_project_path: Path):
    """
    Copies the project template to the new project path, respecting .gitignore.
    Uses pathspec for pure Python gitignore pattern matching.
    """
    if new_project_path.exists():
        print(f"Warning: Project directory '{new_project_path}' already exists.")

    # Load .gitignore patterns
    gitignore_path = template_path / ".gitignore"
    patterns = []
    if gitignore_path.exists():
        with open(gitignore_path, "r") as f:
            patterns = f.readlines()

    # Compile pathspec
    spec = pathspec.PathSpec.from_lines(pathspec.patterns.GitWildMatchPattern, patterns)

    def ignore_func(src: str, names: list[str]) -> list[str]:
        # src is the absolute path to the current directory being visited
        # We need relative path from template_root for matching
        rel_path = Path(src).relative_to(template_path)

        ignored = []
        for name in names:
            if name == ".git":
                ignored.append(name)
                continue

            # Form the relative path to the file/dir
            # Note: pathspec expects unix-style paths
            item_path = rel_path / name
            item_path_str = str(item_path)

            # Check if directory to append slash for better matching if needed?
            # GitWildMatchPattern usually handles it.
            # But pathspec.match_file() primarily checks against the file path.

            if spec.match_file(item_path_str):
                ignored.append(name)

        return ignored

    print(f"Copying template from {template_path} to {new_project_path}...")
    shutil.copytree(
        template_path, new_project_path, ignore=ignore_func, dirs_exist_ok=True
    )


load_dotenv()

if os.getenv("GEMINI_KEY") is None:
    raise ValueError("GEMINI_KEY is not set")


async def get_plan(
    original_visualization: Path, action_space_document: Path, use_flash: bool
):
    prompt = await get_prompt(
        source_path=original_visualization,
        vis2mobile_design_action_space_path=action_space_document,
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
        model="gemini-3-flash-preview" if use_flash else "gemini-3-pro-preview",
        contents=prompt,
        config=generate_content_config,
    )
    plan = response.parts[0].text
    return plan


async def main(
    original_visualization: Path,
    mobile_project_name: str,
    project_template: Path,
    action_space_document: Path,
    use_flash: bool,
):
    assert original_visualization.exists(), (
        f"Original visualization {original_visualization} does not exist"
    )
    assert project_template.exists(), (
        f"Project template {project_template} does not exist"
    )
    assert action_space_document.exists(), (
        f"Action space document {action_space_document} does not exist"
    )
    assert original_visualization.suffix in [".html", ".svg"], (
        f"Original visualization {original_visualization} must be an HTML or SVG file"
    )
    assert len(mobile_project_name) > 0, (
        f"Mobile project name {mobile_project_name} is empty"
    )
    project = Path(mobile_project_name)
    copy_project_template(project_template, project)

    original_folder = project / "original_visualization"
    # Ensure original_folder exists (it might not be in the template)
    original_folder.mkdir(parents=True, exist_ok=True)

    original_image_desktop = await html_to_image(original_visualization, "desktop")
    original_image_mobile = await html_to_image(original_visualization, "mobile")
    original_image_desktop.save(original_folder / "desktop.png")
    original_image_mobile.save(original_folder / "desktop_on_mobile.png")
    shutil.copy2(
        original_visualization,
        original_folder / f"desktop{original_visualization.suffix}",
    )
    print(
        f"Saved {original_visualization} and its rendered images to {original_folder}"
    )
    shutil.copy2(action_space_document, project)
    print(f"Saved {action_space_document} to {project}")
    plan = await get_plan(original_visualization, action_space_document, use_flash)
    with open(project / "transform-plan.md", "w") as f:
        f.write(plan)
    print(f"Saved transform plan to {project / 'transform-plan.md'}")
    print("Done")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="""Prepare project for vis2mobile transformation.

It will do the following:
1. Copy the project template to the new project path, using shutil and pathspec, respecting .gitignore.
2. Convert the original visualization to images.
3. Generate a transform plan.
4. Save the original visualization, the transform plan, and the action space document to the project directory.
"""
    )
    parser.add_argument(
        "--original-visualization",
        type=Path,
        help="Path to the original desktop visualization HTML/SVG file",
    )
    parser.add_argument(
        "--mobile-project-name",
        type=str,
        help="The name of the mobile project",
    )
    parser.add_argument(
        "--project-template",
        type=Path,
        default=Path("./mobile-vis-template"),
        help="Path to the project template directory",
    )
    parser.add_argument(
        "--action-space-document",
        type=Path,
        default=Path("./mobile-vis-design-action-space.md"),
        help="Path to the action space document",
    )
    parser.add_argument(
        "--use-flash",
        action="store_true",
        help="Use Gemini 3 Flash if you only have a free-tier API key",
    )
    args = parser.parse_args()

    asyncio.run(
        main(
            args.original_visualization,
            args.mobile_project_name,
            args.project_template,
            args.action_space_document,
            args.use_flash,
        )
    )
