#!/usr/bin/env python3
"""
Create baseline projects for Cicero examples in ./html-baseline-projects.
This is an all-in-one script that:
1) Copies the project template (respecting .gitignore).
2) Renders desktop and mobile screenshots.
3) Saves original visualization files into each project.
"""

import argparse
import asyncio
from pathlib import Path
import shutil
import pathspec

from vis2mobile_py.utils import html_to_image


CICERO_PROJECTS = [
    ("gallery/public/more-examples/french-election-desktop.html", "french-election"),
    ("gallery/public/more-examples/kennedy-desktop.html", "kennedy"),
    ("gallery/public/more-examples/cost-desktop.html", "cost"),
    ("gallery/public/more-examples/budgets-desktop.html", "budgets"),
    ("gallery/public/apple-banana.svg", "bar"),
    ("gallery/public/Fruit Sales Line Chart.svg", "line"),
    ("gallery/public/Fruit Sales Pie Chart.svg", "pie"),
]

DEFAULT_OUTPUT_DIR = Path("./html-baseline-projects")
DEFAULT_TEMPLATE_DIR = Path("./mobile-vis-template")
DEFAULT_CONCURRENCY = 4


def copy_project_template(template_path: Path, new_project_path: Path) -> None:
    """
    Copies the project template to the new project path, respecting .gitignore.
    Uses pathspec for pure Python gitignore pattern matching.
    """
    if new_project_path.exists():
        print(f"Warning: Project directory '{new_project_path}' already exists.")

    gitignore_path = template_path / ".gitignore"
    patterns: list[str] = []
    if gitignore_path.exists():
        patterns = gitignore_path.read_text().splitlines()

    spec = pathspec.PathSpec.from_lines(pathspec.patterns.GitWildMatchPattern, patterns)

    def ignore_func(src: str, names: list[str]) -> list[str]:
        rel_path = Path(src).relative_to(template_path)
        ignored: list[str] = []
        for name in names:
            if name == ".git":
                ignored.append(name)
                continue
            item_path = rel_path / name
            if spec.match_file(str(item_path)):
                ignored.append(name)
        return ignored

    print(f"Copying template from {template_path} to {new_project_path}...")
    shutil.copytree(
        template_path, new_project_path, ignore=ignore_func, dirs_exist_ok=True
    )


async def prepare_project_baseline(
    original_visualization: Path,
    project_dir: Path,
    project_template: Path,
    vega_asset_path: Path | None = None,
) -> None:
    assert original_visualization.exists(), (
        f"Original visualization {original_visualization} does not exist"
    )
    assert project_template.exists(), (
        f"Project template {project_template} does not exist"
    )
    assert original_visualization.suffix in [".html", ".svg"], (
        f"Original visualization {original_visualization} must be an HTML or SVG file"
    )

    copy_project_template(project_template, project_dir)

    original_folder = project_dir / "original_visualization"
    original_folder.mkdir(parents=True, exist_ok=True)

    original_image_desktop = await html_to_image(original_visualization, "desktop")
    original_image_mobile = await html_to_image(original_visualization, "mobile")
    original_image_desktop.save(original_folder / "desktop.png")
    original_image_mobile.save(original_folder / "desktop_on_mobile.png")
    shutil.copy2(
        original_visualization,
        original_folder / f"desktop{original_visualization.suffix}",
    )
    print(f"Saved {original_visualization} and its rendered images to {original_folder}")

    if vega_asset_path and vega_asset_path.exists():
        assets_dest = project_dir / "assets"
        shutil.copytree(vega_asset_path, assets_dest, dirs_exist_ok=True)
        print(f"Copied vega assets from {vega_asset_path} to {assets_dest}")


async def create_projects_with_concurrency(
    projects: list[tuple[Path, Path]],
    project_template: Path,
    concurrency: int,
):
    semaphore = asyncio.Semaphore(concurrency)

    async def run_with_semaphore(original_path: Path, project_dir: Path):
        async with semaphore:
            if project_dir.exists():
                return (project_dir.name, True, "already exists, skipped")
            try:
                print(f"Processing: {project_dir.name}")
                await prepare_project_baseline(
                    original_visualization=original_path,
                    project_dir=project_dir,
                    project_template=project_template,
                )
                return (project_dir.name, True, "created")
            except Exception as exc:
                return (project_dir.name, False, str(exc))

    tasks = [run_with_semaphore(src, dst) for src, dst in projects]
    results = await asyncio.gather(*tasks)
    return results


def main() -> None:
    parser = argparse.ArgumentParser(
        description="""Prepare baseline projects for Cicero examples.

It will do the following for each example:
1. Copy the project template to the new project path, respecting .gitignore.
2. Convert the original visualization to images.
3. Save the original visualization and rendered images into the project directory.
"""
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Output directory for baseline projects",
    )
    parser.add_argument(
        "--project-template",
        type=Path,
        default=DEFAULT_TEMPLATE_DIR,
        help="Path to the project template directory",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=DEFAULT_CONCURRENCY,
        help="Number of concurrent projects to create",
    )

    args = parser.parse_args()

    base_dir = Path(__file__).parent.resolve()
    output_root = (base_dir / args.output_dir).resolve()
    project_template = (base_dir / args.project_template).resolve()

    output_root.mkdir(parents=True, exist_ok=True)

    projects: list[tuple[Path, Path]] = []
    for original_rel, project_slug in CICERO_PROJECTS:
        original_path = (base_dir / original_rel).resolve()
        project_dir = output_root / project_slug
        projects.append((original_path, project_dir))

    print(
        f"Creating {len(projects)} projects in {output_root} with concurrency={args.concurrency}\n"
    )

    results = asyncio.run(
        create_projects_with_concurrency(
            projects, project_template, args.concurrency
        )
    )

    created = [r for r in results if r[1] and "created" in r[2]]
    skipped = [r for r in results if r[1] and "skipped" in r[2]]
    failed = [r for r in results if not r[1]]

    print(f"\n{'=' * 50}")
    print(
        f"Summary: {len(created)} created, {len(skipped)} skipped, {len(failed)} failed"
    )

    if failed:
        print("\nFailed projects:")
        for project_name, _, error in failed:
            print(f"  - {project_name}: {error}")


if __name__ == "__main__":
    main()
