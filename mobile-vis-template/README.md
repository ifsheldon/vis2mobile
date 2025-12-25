# Vis2Mobile Project

This is a template for transforming a visualization tailored for desktop to a mobile version.

You should implement the mobile version of the visualization in the `src/components/Visualization.tsx` file.

Carefully read the following files for instructions and more information:

- `transform-plan.md`: the detailed plan for transforming the visualization to a mobile version. YOU SHOULD FOLLOW THIS PLAN.
- `AGENTS.md`: Technical instructions for agents. Read this before implementing a new visualization. YOU SHOULD FOLLOW THE TECHNICAL INSTRUCTIONS DURING IMPLEMENTATION.
- `mobile-vis-design-action-space.md`: high-level description of the space for the actions that an agent can take to transform the visualization to a mobile version
- `original_visualization`:
  - `desktop.{html|svg}`: the original source code of the visualization that is tailored for desktop.
  - `desktop.png`: the rendered original visualization that is tailored for desktop.
  - `desktop_on_mobile.png`: the original visualization that is directly rendered in mobile aspect ratio.
- `src/components/Visualization.tsx`: The main component that renders the transformed mobile visualization.

## Tips

- You can write any Python/JS code to do data extraction from the original source code if you want. Store the extracted data in a JSON file.
- Run `uv run screenshot.py` to take a screenshot of the mobile version that you implemented. The screenshot will be saved to `mobile-version.png`.

## HARD REQUIREMENT

**Think about how to ensure readability on mobile screen. DO NOT just copy the layout of the desktop visualization. Double check readability by taking a screenshot and checking the rendered visualization when you finish your implementation. If there are readability issues, go back to code and fix them. Only when all careful checks are passed, can you conclude the implementation. Failing to ensure readability will directly lead to task failure**.
