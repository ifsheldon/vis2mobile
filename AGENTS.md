# Requirements for Agents

## Technical Requirements

- Always use bun as the package manager for js. Never use npm or yarn.
- For Python dependencies, always use `uv`.
  - Run `uv add <package_name>` to install dependencies.
  - Run `uv remove <package_name>` to remove dependencies.
  - Run `uv run python <script_name>` to run Python scripts.
- Use typescript and tailwindcss.
- Use biome as the linter and formatter, run `bun run lint/format/check` after you finish implementing a feature. Fix any issues found.
- You can install new dependencies with bun as you want, but you need to ask for permission first.
