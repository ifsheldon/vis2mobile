#!/usr/bin/env python3
"""
Update project names under ./vega-baseline-projects and ./vega-mobile-projects.
- package.json: set top-level "name" to vega_baseline_<folder> or vega_mobile_<folder>
- pyproject.toml: set name in [project] or [tool.poetry] to vega_baseline_<folder> or vega_mobile_<folder>
"""

from __future__ import annotations

import json
import os
import re
import tomllib

ROOTS = (
    ("vega-baseline-projects", "vega_baseline"),
    ("vega-mobile-projects", "vega_mobile"),
)

# Match lines like: name = "..." or name='...'
NAME_LINE_RE = re.compile(
    r"^(?P<indent>\s*)name\s*=\s*(?P<quote>['\"])(?P<value>.*?)(?P=quote)\s*$"
)

TARGET_TABLES = {"project", "tool.poetry"}


def update_package_json(path: str, new_name: str) -> bool:
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return False

    if data.get("name") == new_name:
        return False

    data["name"] = new_name
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return True


def update_pyproject_toml(path: str, new_name: str) -> bool:
    try:
        with open(path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except Exception:
        return False

    # Use tomllib to validate the file and detect whether a name field exists.
    try:
        with open(path, "rb") as f:
            data = tomllib.load(f)
    except Exception:
        return False

    has_name = False
    if isinstance(data.get("project"), dict) and "name" in data["project"]:
        has_name = True
    if isinstance(data.get("tool"), dict):
        tool = data["tool"]
        if isinstance(tool.get("poetry"), dict) and "name" in tool["poetry"]:
            has_name = True

    if not has_name:
        return False

    changed = False
    current_table = ""

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("[") and stripped.endswith("]"):
            current_table = stripped[1:-1].strip()
            continue

        if current_table in TARGET_TABLES:
            m = NAME_LINE_RE.match(line)
            if m:
                indent = m.group("indent")
                quote = m.group("quote")
                lines[i] = f"{indent}name = {quote}{new_name}{quote}\n"
                changed = True

    if not changed:
        return False

    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)
    return True


def iter_project_dirs(root: str):
    for entry in sorted(os.listdir(root)):
        full = os.path.join(root, entry)
        if os.path.isdir(full):
            yield entry, full


def main() -> int:
    updated_pkg = 0
    updated_py = 0
    for root_dir, prefix in ROOTS:
        root_path = os.path.join(os.path.dirname(__file__), root_dir)
        if not os.path.isdir(root_path):
            print(f"Missing directory: {root_path}")
            return 1

        for folder, path in iter_project_dirs(root_path):
            new_name = f"{prefix}-{folder}"

            pkg_path = os.path.join(path, "package.json")
            if os.path.isfile(pkg_path):
                if update_package_json(pkg_path, new_name):
                    updated_pkg += 1

            py_path = os.path.join(path, "pyproject.toml")
            if os.path.isfile(py_path):
                if update_pyproject_toml(py_path, new_name):
                    updated_py += 1

    print(f"Updated package.json: {updated_pkg}")
    print(f"Updated pyproject.toml: {updated_py}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
