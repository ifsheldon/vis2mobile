#!/usr/bin/env python3
"""
Create vega projects by running prepare_project_vega.py for each HTML file.
Skips projects that already exist. Runs with concurrency of 4.
"""

import subprocess
import asyncio
from pathlib import Path


# All projects to create: (visualization_path, project_name)
# Projects with valid (non-empty) screenshots are commented out
PROJECTS = [
    # vega
    ("vega-examples/vega/01.html", "vega-baseline-projects/vega-01"),
    ("vega-examples/vega/02.html", "vega-baseline-projects/vega-02"),
    ("vega-examples/vega/03.html", "vega-baseline-projects/vega-03"),
    ("vega-examples/vega/04.html", "vega-baseline-projects/vega-04"),
    ("vega-examples/vega/05.html", "vega-baseline-projects/vega-05"),
    # vega_altair
    (
        "vega-examples/vega_altair/01.html",
        "vega-baseline-projects/vega-altair-01",
    ),
    (
        "vega-examples/vega_altair/02.html",
        "vega-baseline-projects/vega-altair-02",
    ),
    (
        "vega-examples/vega_altair/03.html",
        "vega-baseline-projects/vega-altair-03",
    ),
    (
        "vega-examples/vega_altair/04.html",
        "vega-baseline-projects/vega-altair-04",
    ),
    (
        "vega-examples/vega_altair/05.html",
        "vega-baseline-projects/vega-altair-05",
    ),
    (
        "vega-examples/vega_altair/06.html",
        "vega-baseline-projects/vega-altair-06",
    ),
    (
        "vega-examples/vega_altair/07.html",
        "vega-baseline-projects/vega-altair-07",
    ),
    (
        "vega-examples/vega_altair/08.html",
        "vega-baseline-projects/vega-altair-08",
    ),
    (
        "vega-examples/vega_altair/09.html",
        "vega-baseline-projects/vega-altair-09",
    ),
    (
        "vega-examples/vega_altair/10.html",
        "vega-baseline-projects/vega-altair-10",
    ),
    (
        "vega-examples/vega_altair/11.html",
        "vega-baseline-projects/vega-altair-11",
    ),
    (
        "vega-examples/vega_altair/12.html",
        "vega-baseline-projects/vega-altair-12",
    ),
    (
        "vega-examples/vega_altair/13.html",
        "vega-baseline-projects/vega-altair-13",
    ),
    (
        "vega-examples/vega_altair/14.html",
        "vega-baseline-projects/vega-altair-14",
    ),
    (
        "vega-examples/vega_altair/15.html",
        "vega-baseline-projects/vega-altair-15",
    ),
    (
        "vega-examples/vega_altair/16.html",
        "vega-baseline-projects/vega-altair-16",
    ),
    (
        "vega-examples/vega_altair/17.html",
        "vega-baseline-projects/vega-altair-17",
    ),
    (
        "vega-examples/vega_altair/18.html",
        "vega-baseline-projects/vega-altair-18",
    ),
    (
        "vega-examples/vega_altair/19.html",
        "vega-baseline-projects/vega-altair-19",
    ),
    (
        "vega-examples/vega_altair/20.html",
        "vega-baseline-projects/vega-altair-20",
    ),
    (
        "vega-examples/vega_altair/21.html",
        "vega-baseline-projects/vega-altair-21",
    ),
    (
        "vega-examples/vega_altair/22.html",
        "vega-baseline-projects/vega-altair-22",
    ),
    (
        "vega-examples/vega_altair/23.html",
        "vega-baseline-projects/vega-altair-23",
    ),
    (
        "vega-examples/vega_altair/24.html",
        "vega-baseline-projects/vega-altair-24",
    ),
    (
        "vega-examples/vega_altair/25.html",
        "vega-baseline-projects/vega-altair-25",
    ),
    (
        "vega-examples/vega_altair/26.html",
        "vega-baseline-projects/vega-altair-26",
    ),
    (
        "vega-examples/vega_altair/27.html",
        "vega-baseline-projects/vega-altair-27",
    ),
    (
        "vega-examples/vega_altair/28.html",
        "vega-baseline-projects/vega-altair-28",
    ),
    (
        "vega-examples/vega_altair/29.html",
        "vega-baseline-projects/vega-altair-29",
    ),
    (
        "vega-examples/vega_altair/30.html",
        "vega-baseline-projects/vega-altair-30",
    ),
    (
        "vega-examples/vega_altair/31.html",
        "vega-baseline-projects/vega-altair-31",
    ),
    (
        "vega-examples/vega_altair/32.html",
        "vega-baseline-projects/vega-altair-32",
    ),
    (
        "vega-examples/vega_altair/33.html",
        "vega-baseline-projects/vega-altair-33",
    ),
    (
        "vega-examples/vega_altair/34.html",
        "vega-baseline-projects/vega-altair-34",
    ),
    (
        "vega-examples/vega_altair/35.html",
        "vega-baseline-projects/vega-altair-35",
    ),
    (
        "vega-examples/vega_altair/36.html",
        "vega-baseline-projects/vega-altair-36",
    ),
    (
        "vega-examples/vega_altair/37.html",
        "vega-baseline-projects/vega-altair-37",
    ),
    (
        "vega-examples/vega_altair/38.html",
        "vega-baseline-projects/vega-altair-38",
    ),
    (
        "vega-examples/vega_altair/39.html",
        "vega-baseline-projects/vega-altair-39",
    ),
    (
        "vega-examples/vega_altair/40.html",
        "vega-baseline-projects/vega-altair-40",
    ),
    (
        "vega-examples/vega_altair/41.html",
        "vega-baseline-projects/vega-altair-41",
    ),
    # vega_lite
    (
        "vega-examples/vega_lite/01.html",
        "vega-baseline-projects/vega-lite-01",
    ),
    (
        "vega-examples/vega_lite/02.html",
        "vega-baseline-projects/vega-lite-02",
    ),
    (
        "vega-examples/vega_lite/03.html",
        "vega-baseline-projects/vega-lite-03",
    ),
    (
        "vega-examples/vega_lite/04.html",
        "vega-baseline-projects/vega-lite-04",
    ),
    (
        "vega-examples/vega_lite/05.html",
        "vega-baseline-projects/vega-lite-05",
    ),
    (
        "vega-examples/vega_lite/06.html",
        "vega-baseline-projects/vega-lite-06",
    ),
    (
        "vega-examples/vega_lite/07.html",
        "vega-baseline-projects/vega-lite-07",
    ),
    (
        "vega-examples/vega_lite/08.html",
        "vega-baseline-projects/vega-lite-08",
    ),
    (
        "vega-examples/vega_lite/09.html",
        "vega-baseline-projects/vega-lite-09",
    ),
    (
        "vega-examples/vega_lite/10.html",
        "vega-baseline-projects/vega-lite-10",
    ),
    (
        "vega-examples/vega_lite/11.html",
        "vega-baseline-projects/vega-lite-11",
    ),
    (
        "vega-examples/vega_lite/12.html",
        "vega-baseline-projects/vega-lite-12",
    ),
    (
        "vega-examples/vega_lite/13.html",
        "vega-baseline-projects/vega-lite-13",
    ),
    (
        "vega-examples/vega_lite/14.html",
        "vega-baseline-projects/vega-lite-14",
    ),
    (
        "vega-examples/vega_lite/15.html",
        "vega-baseline-projects/vega-lite-15",
    ),
    (
        "vega-examples/vega_lite/16.html",
        "vega-baseline-projects/vega-lite-16",
    ),
    (
        "vega-examples/vega_lite/17.html",
        "vega-baseline-projects/vega-lite-17",
    ),
    (
        "vega-examples/vega_lite/18.html",
        "vega-baseline-projects/vega-lite-18",
    ),
    (
        "vega-examples/vega_lite/19.html",
        "vega-baseline-projects/vega-lite-19",
    ),
    (
        "vega-examples/vega_lite/20.html",
        "vega-baseline-projects/vega-lite-20",
    ),
    (
        "vega-examples/vega_lite/21.html",
        "vega-baseline-projects/vega-lite-21",
    ),
    (
        "vega-examples/vega_lite/22.html",
        "vega-baseline-projects/vega-lite-22",
    ),
]

VEGA_ASSET_PATH = "./vega-examples/assets/"

# Number of concurrent projects to create
CONCURRENCY = 8


def create_project(
    vis_path: str, project_name: str, base_dir: Path
) -> tuple[str, bool, str]:
    """
    Create a single project using prepare_project_vega.py.
    Returns (project_name, success, error_message)
    """
    project_dir = base_dir / project_name

    # Skip if already exists
    if project_dir.exists():
        return (project_name, True, "already exists, skipped")

    try:
        result = subprocess.run(
            [
                "uv",
                "run",
                "python",
                "prepare_project_vega_baseline.py",
                "--original-visualization",
                vis_path,
                "--vega-asset-path",
                VEGA_ASSET_PATH,
                "--mobile-project-name",
                project_name,
            ],
            cwd=base_dir,
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            error_msg = (
                result.stderr or result.stdout or f"exit code {result.returncode}"
            )
            return (project_name, False, error_msg[:200])

        return (project_name, True, "created")

    except Exception as e:
        return (project_name, False, str(e))


async def create_projects_with_concurrency(
    projects: list[tuple[str, str]], base_dir: Path, concurrency: int
):
    """Create projects with limited concurrency using a semaphore."""
    semaphore = asyncio.Semaphore(concurrency)
    loop = asyncio.get_event_loop()

    async def run_with_semaphore(vis_path: str, project_name: str):
        async with semaphore:
            print(f"Processing: {project_name}")
            result = await loop.run_in_executor(
                None, create_project, vis_path, project_name, base_dir
            )
            project_name, success, msg = result
            if success:
                if "skipped" in msg:
                    print(f"⏭ Skipped: {project_name} (already exists)")
                else:
                    print(f"✓ Created: {project_name}")
            else:
                print(f"✗ Failed: {project_name} - {msg}")
            return result

    tasks = [
        run_with_semaphore(vis_path, proj_name) for vis_path, proj_name in projects
    ]
    results = await asyncio.gather(*tasks)
    return results


def main():
    base_dir = Path(__file__).parent.resolve()

    print(f"Creating {len(PROJECTS)} projects with concurrency={CONCURRENCY}\n")

    results = asyncio.run(
        create_projects_with_concurrency(PROJECTS, base_dir, CONCURRENCY)
    )

    # Summary
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
