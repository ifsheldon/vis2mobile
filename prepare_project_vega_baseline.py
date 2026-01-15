import asyncio
import argparse
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


async def main(
    original_visualization: Path,
    mobile_project_name: str,
    project_template: Path,
    vega_asset_path: Path,
):
    assert original_visualization.exists(), (
        f"Original visualization {original_visualization} does not exist"
    )
    assert project_template.exists(), (
        f"Project template {project_template} does not exist"
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
    # Copy vega assets
    if vega_asset_path and vega_asset_path.exists():
        assets_dest = project / "assets"
        shutil.copytree(vega_asset_path, assets_dest, dirs_exist_ok=True)
        print(f"Copied vega assets from {vega_asset_path} to {assets_dest}")
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
        "--vega-asset-path",
        type=Path,
        default=None,
        help="Path to the vega assets directory",
    )
    args = parser.parse_args()

    asyncio.run(
        main(
            args.original_visualization,
            args.mobile_project_name,
            args.project_template,
            args.vega_asset_path,
        )
    )
