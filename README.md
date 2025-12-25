# Vis2Mobile

Vis2Mobile is a tool that converts a desktop visualization to a mobile-friendly version.

## Prerequisites

You will need to install the following tools:

* [Gemini CLI](https://geminicli.com) and set it up
* [`uv`](https://docs.astral.sh/uv/getting-started/installation/) for managing Python dependencies
* [`bun`](https://bun.sh) for managing JavaScript dependencies

Also, prepare a Gemini API key in `.env`. Ask FL to get one or you can get one yourself on [Google AI Studio](https://aistudio.google.com).

```env
GEMINI_KEY=...
```

## Usage

First, prepare a frontend project for Gemini:

```shell
# prepare Python environment
uv sync
# As an example, we use html-examples/budgets-desktop-processed.html
# add --use-flash if you only have a free-tier API key
uv run prepare_project.py --original-visualization html-examples/budgets-desktop-processed.html --mobile-project-name test-mobile-budgets
```

Second, run

```shell
cd test-mobile-budgets
# prepare JavaScript environment
bun install
# --yolo gives gemini-cli all permissions to do its job
# you can add --model gemini-3-pro-preview to use powerful Gemini 3 Pro
gemini --yolo --prompt "read README.md and finish transforming desktop visualization to a mobile-friendly version"
```

Wait for it for ~5 mins until it tells you that the job is done. Run `bun dev` to start the development server and see the result.
