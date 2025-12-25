from vis2mobile_py.utils import html_to_image
from pathlib import Path
from typing import Literal

PROMPT_TEMPLATE_PART1 = """
# Vis2Mobile Project

## Objective
Transform desktop-oriented static visualizations in SVG or HTML files into premium, mobile-first, interactive React components.

## Core Mission

You need to act as a planner to plan how to fulfill the following missions:

1. **Transform**: Convert static static visualizations in SVG or HTML files into interactive mobile components.
2. **Codify Data**: Extract and use **real data** from the source SVG (coordinates, colors, labels) or HTML files. **No fake data allowed.**
3. **Mobile-First UX**: Ensure touch-friendliness, readable typography, and responsive layouts.
4. **Premium Aesthetics**: Use modern UI principles (glassmorphism, vibrant palettes, smooth animations) to create a "wow" factor.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Visualization**: Recharts
- **Icons**: Lucide React
- **Linting/Formatting**: Biome
- **Package Manager**: `bun`

## Project Structure

- `components/`: Contains the interactive chart components (e.g., `SalesChart.tsx`, `SalesLineChart.tsx`).
- `app/preview/[type]/page.tsx`: Standalone mobile preview pages for each chart (iframe targets).
- `app/page.tsx`: **Gallery Dashboard** (Desktop view) that showcases all mobile charts in various device frames.
- `public/`: Stores the original reference SVGs.
- `AGENTS.md`: Technical instructions for agents. Read this before implementing a new visualization.

## Related Information

### Source of the original SVG or HTML file

Below is the source code of the original SVG or HTML file that you need to transform into a mobile visualization.

```
{source_code}
```

Below, the first image is the rendered original visualization that is tailored for desktop. I also rendered it in mobile aspect ratio, check the second image.
"""

PROMPT_TEMPLATE_PART2 = """### Vis2Mobile Design Action Space

Below is the document of Vis2Mobile Design Action Space, which details the design space of visualizations and action space of what actions you can take to convert the visualization into a mobile friendly one. 

```
{vis2mobile_design_action_space}
```

## Task and Requirements

1. Check the source code of the original SVG or HTML file and its rendered results carefully. Understand the full details in the visualization and the appearance of the original desktop version. You should take note all information presented in the desktop version. Also, think about the issues in the version rendered in mobile aspect ratio
2. Read Vis2Mobile Design Action Space document carefully. Based on your understanding of the visualization and the design and action spaces, give your reasoning and plan about how to transform the visualization into a mobile friendly one. Like what steps and actions to take.
    - Just give a plan, no need to implement the mobile version yet. You should give **the actions to take that are in the action space and tell why you choose that action**.
    - If there's an action that is not in the action space, tell the reason as well as the justification of why existing actions are not suitable.
    - You should analyse the desktop visualization, **think about the actions in the space and write the high-level plan first and then implmentational detailed steps in a seperate section.**
    - The mobile version should **preserve as much information and intention presented in the desktop version as possible.** If due to mobile constraints, some information must be omitted or presented in another view, you should mention it in the plan and write your justification.
3. Write your plan in Markdown format. Respond with only the plan, no need to inlude irrelevant comments. 

HARD REQUIREMENT: **Think about how to ensure readability on mobile screen. DO NOT just copy the layout of the desktop visualization. Failing to ensure readability will directly lead to task failure**.
"""


async def get_prompt(
    source_path: str | Path,
    vis2mobile_design_action_space_path: str | Path,
    ai_service: Literal["openai", "gemini"],
):
    assert ai_service in ["openai", "gemini"]

    with open(source_path, "r") as f:
        source_code = f.read()
    with open(vis2mobile_design_action_space_path, "r") as f:
        vis2mobile_design_action_space = f.read()

    text_prompt_part1 = PROMPT_TEMPLATE_PART1.format(
        source_code=source_code,
    )
    text_prompt_part2 = PROMPT_TEMPLATE_PART2.format(
        vis2mobile_design_action_space=vis2mobile_design_action_space,
    )
    if ai_service == "openai":
        desktop_image_base64 = await html_to_image(
            source_path, aspect_ratio="desktop", return_type="base64_png"
        )
        mobile_image_base64 = await html_to_image(
            source_path, aspect_ratio="mobile", return_type="base64_png"
        )
        return {
            "role": "user",
            "content": [
                {"type": "input_text", "text": text_prompt_part1},
                {
                    "type": "input_image",
                    "image_url": f"data:image/png;base64,{desktop_image_base64}",
                    "detail": "high",
                },
                {
                    "type": "input_image",
                    "image_url": f"data:image/png;base64,{mobile_image_base64}",
                },
                {"type": "input_text", "text": text_prompt_part2},
            ],
        }
    else:
        desktop_image = await html_to_image(source_path, aspect_ratio="desktop")
        mobile_image = await html_to_image(source_path, aspect_ratio="mobile")
        return [text_prompt_part1, desktop_image, mobile_image, text_prompt_part2]
