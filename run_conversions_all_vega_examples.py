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
from concurrent.futures import ProcessPoolExecutor
import sys

USE_CODEX = False

# All projects to process
PROJECTS = [
    # vega
    # "test-vega-01",
    # "test-vega-02",
    # "test-vega-03",
    # "test-vega-04",
    # "test-vega-05",
    # vega_altair
    # "test-vega-altair-01",
    # "test-vega-altair-02",
    "test-vega-altair-03",
    "test-vega-altair-04",
    "test-vega-altair-05",
    "test-vega-altair-06",
    "test-vega-altair-07",
    "test-vega-altair-08",
    "test-vega-altair-09",
    # "test-vega-altair-10",
    # "test-vega-altair-11",
    # "test-vega-altair-12",
    # "test-vega-altair-13",
    # "test-vega-altair-14",
    # "test-vega-altair-15",
    # "test-vega-altair-16",
    # "test-vega-altair-17",
    # "test-vega-altair-18",
    # "test-vega-altair-19",
    # "test-vega-altair-20",
    # "test-vega-altair-21",
    # "test-vega-altair-22",
    # "test-vega-altair-23",
    # "test-vega-altair-24",
    # "test-vega-altair-25",
    # "test-vega-altair-26",
    # "test-vega-altair-27",
    # "test-vega-altair-28",
    # "test-vega-altair-29",
    # "test-vega-altair-30",
    # "test-vega-altair-31",
    # "test-vega-altair-32",
    # "test-vega-altair-33",
    # "test-vega-altair-34",
    # "test-vega-altair-35",
    # "test-vega-altair-36",
    # "test-vega-altair-37",
    # "test-vega-altair-38",
    # "test-vega-altair-39",
    # "test-vega-altair-40",
    # "test-vega-altair-41",
    # vega_lite
    # "test-vega-lite-01",
    # "test-vega-lite-02",
    # "test-vega-lite-03",
    # "test-vega-lite-04",
    # "test-vega-lite-05",
    # "test-vega-lite-06",
    # "test-vega-lite-07",
    # "test-vega-lite-08",
    # "test-vega-lite-09",
    # "test-vega-lite-10",
    # "test-vega-lite-11",
    # "test-vega-lite-12",
    # "test-vega-lite-13",
    # "test-vega-lite-14",
    # "test-vega-lite-15",
    # "test-vega-lite-16",
    # "test-vega-lite-17",
    # "test-vega-lite-18",
    # "test-vega-lite-19",
    # "test-vega-lite-20",
    # "test-vega-lite-21",
    # "test-vega-lite-22",
]

# Number of concurrent projects to run
CONCURRENCY = 2


def run_project(project_name: str, base_dir: Path) -> tuple[str, bool, str]:
    """
    Run bun install and gemini for a single project.
    Returns (project_name, success, error_message)
    """
    project_dir = base_dir / project_name
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
            prompt = "read README.md and finish transforming desktop visualization into a mobile version"

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
                log.write("\n--- Running: gemini ---\n")
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

            result = subprocess.run(
                cmd,
                cwd=project_dir,
                stdout=log,
                stderr=subprocess.STDOUT,
                text=True,
                env=os.environ,
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
    projects: list[str], base_dir: Path, concurrency: int
):
    """Run projects with limited concurrency using a semaphore."""
    semaphore = asyncio.Semaphore(concurrency)
    loop = asyncio.get_event_loop()

    async def run_with_semaphore(project: str):
        async with semaphore:
            print(f"Starting: {project}")
            # Run in thread pool to not block the event loop
            result = await loop.run_in_executor(None, run_project, project, base_dir)
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

    # Filter to only existing projects
    existing_projects = [p for p in PROJECTS if (base_dir / p).exists()]
    missing_projects = [p for p in PROJECTS if not (base_dir / p).exists()]

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
        run_projects_with_concurrency(existing_projects, base_dir, CONCURRENCY)
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
