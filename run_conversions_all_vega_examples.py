#!/usr/bin/env python3
"""
Run gemini conversions for vega projects, 2 at a time.
For each project: cd into it, run `bun install`, then run `gemini`.
Stdout and stderr are saved to <project-name>.log
"""

import subprocess
import asyncio
import os
from pathlib import Path
import sys
from random import randint
from copy import deepcopy

USE_CODEX = False
USE_FLASH = True

# Base directory for vega mobile projects
PROJECTS_DIR = "vega-mobile-projects"

# All projects to process
PROJECTS = [
    # vega
    # "vega-01", # finished by FL
    # "vega-02", # finished by FL
    # "vega-03", # finished by FL
    # "vega-04", # finished by FL
    # "vega-05", # finished by FL
    # vega_altair
    # "vega-altair-01", # finished by FL
    # "vega-altair-02", # finished by FL
    # "vega-altair-03", # finished by FL
    # "vega-altair-04", # finished by FL
    # "vega-altair-05", # finished by FL
    # "vega-altair-06", # finished by Sizhe
    # "vega-altair-07", # finished by Sizhe
    # "vega-altair-08", # finished by Sizhe
    # "vega-altair-09", # finished by Sizhe
    "vega-altair-10",  # not good
    # "vega-altair-11", # finished by FL
    # "vega-altair-12", # finished by Sizhe
    # "vega-altair-13", # finished by FL
    # "vega-altair-14", # finished by FL
    # "vega-altair-15", # finished by Sizhe
    # "vega-altair-16", # finished by Sizhe
    # "vega-altair-17", # finished by Sizhe
    # "vega-altair-18", # finished by FL
    # "vega-altair-19", # finished by FL
    # "vega-altair-20", # finished by FL
    # "vega-altair-21", # finished by Sizhe
    # "vega-altair-22", # finished by Sizhe
    # "vega-altair-23", # finished by Sizhe
    # "vega-altair-24", # finished by Sizhe
    # "vega-altair-25", # finished by Sizhe
    # "vega-altair-26", # finished by Sizhe
    # "vega-altair-27", # finished by FL
    # "vega-altair-28", # finished by FL
    # "vega-altair-29", # finished by FL
    # "vega-altair-30", # finished by FL
    # "vega-altair-31", # finished by FL
    "vega-altair-32",
    "vega-altair-33",
    # "vega-altair-34", # finished by FL
    # "vega-altair-35", # finished by FL
    # "vega-altair-36", # finished by FL
    # "vega-altair-37", # finished by FL
    # "vega-altair-38", # finished by FL
    # "vega-altair-39", # finished by FL
    # "vega-altair-40", # finished by FL
    # "vega-altair-41", # finished by FL
    # vega_lite, finished by FL
    # "vega-lite-01",
    # "vega-lite-02",
    # "vega-lite-03",
    # "vega-lite-04",
    # "vega-lite-05",
    # "vega-lite-06",
    # "vega-lite-07",
    # "vega-lite-08",
    # "vega-lite-09",
    # "vega-lite-10",
    # "vega-lite-11",
    # "vega-lite-12",
    # "vega-lite-13",
    # "vega-lite-14",
    # "vega-lite-15",
    # "vega-lite-16",
    # "vega-lite-17",
    # "vega-lite-18",
    # "vega-lite-19",
    # "vega-lite-20",
    # "vega-lite-21",
    # "vega-lite-22",
]

# Number of concurrent projects to run
CONCURRENCY = 6


def run_project(
    project_name: str, base_dir: Path, projects_dir: Path
) -> tuple[str, bool, str]:
    """
    Run bun install and gemini for a single project.
    Returns (project_name, success, error_message)
    """
    project_dir = projects_dir / project_name
    log_file = base_dir / f"{project_name}.log"

    if not project_dir.exists():
        return (project_name, False, f"Project directory {project_dir} does not exist")

    try:
        with open(log_file, "w") as log:
            log.write(f"=== Processing {project_name} ===\n\n")

            # Run bun install
            log.write("--- Running: bun install ---\n")
            log.flush()
            result = subprocess.run(
                ["bun", "install"],
                cwd=project_dir,
                stdout=log,
                stderr=subprocess.STDOUT,
                text=True,
                env=os.environ,
            )
            if result.returncode != 0:
                log.write(
                    f"\nbun install failed with return code {result.returncode}\n"
                )
                return (
                    project_name,
                    False,
                    f"bun install failed with code {result.returncode}",
                )

            # Run gemini or codex based on USE_CODEX flag
            prompt = "read README.md and finish transforming desktop visualization into a mobile version. find available port for bun dev in envar `PORT`"

            if USE_CODEX:
                log.write("\n--- Running: codex ---\n")
                log.flush()
                cmd = [
                    "codex",
                    "exec",
                    "--model",
                    "gpt-5.2-codex",
                    "--enable",
                    "web_search_request",
                    "--dangerously-bypass-approvals-and-sandbox",
                    prompt,
                ]
                cli_name = "codex"
            else:
                if USE_FLASH:
                    log.write("\n--- Running: gemini flash  ---\n")
                    log.flush()
                    cmd = [
                        "gemini",
                        "--yolo",
                        "--model",
                        "gemini-3-flash-preview",
                        "--prompt",
                        prompt,
                    ]
                else:
                    log.write("\n--- Running: gemini pro  ---\n")
                    log.flush()
                    cmd = [
                        "gemini",
                        "--yolo",
                        "--model",
                        "gemini-3-pro-preview",
                        "--prompt",
                        prompt,
                    ]
                cli_name = "gemini"

            env = deepcopy(os.environ)
            env["PORT"] = str(randint(3000, 20000))
            result = subprocess.run(
                cmd,
                cwd=project_dir,
                stdout=log,
                stderr=subprocess.STDOUT,
                text=True,
                env=env,
            )

            if result.returncode != 0:
                log.write(f"\n{cli_name} failed with return code {result.returncode}\n")
                return (
                    project_name,
                    False,
                    f"{cli_name} failed with code {result.returncode}",
                )

            log.write(f"\n=== Completed {project_name} successfully ===\n")
            return (project_name, True, "")

    except Exception as e:
        return (project_name, False, str(e))


async def run_projects_with_concurrency(
    projects: list[str], base_dir: Path, projects_dir: Path, concurrency: int
):
    """Run projects with limited concurrency using a semaphore."""
    semaphore = asyncio.Semaphore(concurrency)
    loop = asyncio.get_event_loop()

    async def run_with_semaphore(project: str):
        async with semaphore:
            print(f"Starting: {project}")
            # Run in thread pool to not block the event loop
            result = await loop.run_in_executor(
                None, run_project, project, base_dir, projects_dir
            )
            project_name, success, error = result
            if success:
                print(f"✓ Completed: {project_name}")
            else:
                print(f"✗ Failed: {project_name} - {error}")
            return result

    tasks = [run_with_semaphore(project) for project in projects]
    results = await asyncio.gather(*tasks)
    return results


def main():
    base_dir = Path(__file__).parent.resolve()
    projects_dir = base_dir / PROJECTS_DIR

    # Filter to only existing projects
    existing_projects = [p for p in PROJECTS if (projects_dir / p).exists()]
    missing_projects = [p for p in PROJECTS if not (projects_dir / p).exists()]

    if missing_projects:
        print(
            f"Warning: {len(missing_projects)} projects not found (not yet created?):"
        )
        for p in missing_projects[:5]:
            print(f"  - {p}")
        if len(missing_projects) > 5:
            print(f"  ... and {len(missing_projects) - 5} more")
        print()

    if not existing_projects:
        print("No projects found to process!")
        sys.exit(1)

    print(
        f"Processing {len(existing_projects)} projects with concurrency={CONCURRENCY}\n"
    )

    results = asyncio.run(
        run_projects_with_concurrency(
            existing_projects, base_dir, projects_dir, CONCURRENCY
        )
    )

    # Summary
    successful = [r for r in results if r[1]]
    failed = [r for r in results if not r[1]]

    print(f"\n{'=' * 50}")
    print(f"Summary: {len(successful)} succeeded, {len(failed)} failed")

    if failed:
        print("\nFailed projects:")
        for project_name, _, error in failed:
            print(f"  - {project_name}: {error}")


if __name__ == "__main__":
    main()
