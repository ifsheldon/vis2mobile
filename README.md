# Vis2Mobile

Vis2Mobile is a tool that converts a desktop visualization to a mobile-friendly version.

## Prerequisites

You will need to install the following tools:

* [Gemini CLI](https://geminicli.com) or [Codex](https://openai.com/codex/) and set it up
* [`uv`](https://docs.astral.sh/uv/getting-started/installation/) for managing Python dependencies
* [`bun`](https://bun.sh) for managing JavaScript dependencies

Also, prepare a Gemini API key in `.env`. Ask FL to get one or you can get one yourself on [Google AI Studio](https://aistudio.google.com).

```env
GEMINI_KEY=...
```

## Usage

First, set up the environment.

```shell
# Prepare Python environment
uv sync
uv run playwright install chromium
# If you use codex
codex mcp add playwright npx "@playwright/mcp@latest"
```

Then prepare a frontend project for Gemini:

```shell
# As an example, we use html-examples/budgets-desktop-processed.html. 
# You should use html-examples/*-processed.html as other examples to try out. 
# Do NOT use non-processed html files as it will not work.
# Add --use-flash if you only have a free-tier API key
uv run prepare_project.py --original-visualization html-examples/budgets-desktop-processed.html --mobile-project-name test-mobile-budgets
# for html examples in ./vega-examples
uv run python prepare_project_vega.py --original-visualization vega-examples/vega_altair/01.html --vega-asset-path ./vega-examples/assets/ --mobile-project-name test-vega-altair-01
```

Then run conversion:

```shell
cd test-mobile-budgets
# Prepare JavaScript environment
bun install

# --yolo gives gemini-cli all permissions to do its job
# You can add --model gemini-3-pro-preview to use powerful Gemini 3 Pro
gemini --yolo --prompt "read README.md and finish transforming desktop visualization to a mobile-friendly version"
# If you use codex
# codex --model "gpt-5.2-codex" --full-auto --enable web_search_request --sandbox workspace-write "read README.md and finish transforming desktop visualization to a mobile-friendly version"
```

Wait for it for ~3 mins until it tells you that the job is done. Run `bun dev` to start the development server and see the result.
