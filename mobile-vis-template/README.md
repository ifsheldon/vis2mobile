# Vis2Mobile Project

This is a template for transforming a visualization tailored for desktop to a mobile version.

You should implement the mobile version of the visualization in the `src/components/Visualization.tsx` file.

Check the following files for instructions and more information:

- `original_visualization`:
  - `desktop.{html|svg}`: the original source code of the visualization that is tailored for desktop.
  - `desktop.png`: the rendered original visualization that is tailored for desktop.
  - `desktop_on_mobile.png`: the original visualization that is directly rendered in mobile aspect ratio.
- `src/components/Visualization.tsx`: The main component that renders the transformed mobile visualization.
- `AGENTS.md`: Technical instructions for agents. Read this before implementing a new visualization.
- `mobile-vis-design-action-space.md`: high-level description of the space for the actions that an agent can take to transform the visualization to a mobile version
- `transform-plan.md`: the detailed plan for transforming the visualization to a mobile version
