# Requirements for Agents

## Technical Requirements

- ALWAYS use bun as the package manager for js. Never use npm or yarn.
- For Python dependencies, ALWAYS use `uv`.
  - Run `uv add <package_name>` to install dependencies.
  - Run `uv remove <package_name>` to remove dependencies.
  - Run `uv run python <script_name>` to run Python scripts.
- Use typescript and tailwindcss.
- Use biome as the linter and formatter, run `bun run lint/format/check` after you finish implementing a feature. Fix any issues found.
- You can install new dependencies with bun as you want, but you need to ask for permission first.
- Files that you are allowed to modify:
  - `src/components/Visualization.tsx`: you should implement visualization of the mobile version here
  - `package.json`: you can modify dependencies here
  - `pyproject.toml`: you can modify Python dependencies here
  - `*.css`: you can modify or create stylesheets
  - You can create new files in the `src` directory as you want.
- DO NOT DELETE OR MODIFY ANYTHING ELSE UNLESS YOU ARE TOLD TO DO SO.
