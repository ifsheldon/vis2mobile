# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version
- **Type**: 1D Scatter Plot / Dot Plot.
- **Axes**:
    - **Y-Axis**: Nominal data ("Major Genre"). Categories like "Drama", "Comedy", etc.
    - **X-Axis**: Quantitative data ("IMDB Rating", 0-10).
- **Marks**: Circles representing the aggregated mean IMDB rating for each genre.
- **Labels**: Custom X-axis labels ("Poor", "Neutral", "Great") at specific ticks (0, 5, 10).
- **Sorting**: Genres are sorted by their average rating.

### Mobile Issues (Desktop on Mobile)
- **Aspect Ratio Distortion**: The wide aspect ratio of the desktop chart becomes squished on mobile.
- **Unreadable Labels**: The Y-axis labels ("Major Genre") will likely be truncated or too small to read if squeezed into the left side of a vertical chart.
- **Touch Targets**: The circles might be too small for interaction.
- **Space Efficiency**: A standard Cartesian coordinate system with labels on the left wastes horizontal space, which is scarce on mobile.

## 2. High-Level Strategy & Design Action Space

My strategy is to transform the standard **Cartesian Plot** into a **List View with Integrated Linear Gauges** (Lollipop chart style). Instead of a single chart canvas, the visualization will behave like a sorted list of performance cards. This utilizes the natural vertical scrolling behavior of mobile devices.

### Actions & Reasoning

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | **Rescale** | Set `width: 100%` and `height: auto` (based on list length). The desktop fixed aspect ratio is unsuitable for a long list of genres. |
| **L0** | **Container** | **Reposition** | Adjust global padding to fit the mobile screen edges comfortably. |
| **L1** | **Data Model** | **Recompose (Aggregate)** | The raw data is `movies.json` (individual movies). I must replicate the `mean` aggregation logic from the Vega spec to calculate the average rating per genre. |
| **L3** | **Coordinates / Axes** | **Transpose (Layout)** | Instead of a single Y-axis on the left, **Reposition** the Y-axis labels (Genres) to the **top-left** of each data row (Header style). This frees up 100% of the horizontal width for the data visualization part. |
| **L3** | **Axes (X)** | **Recompose (Remove)** | Remove the repetitive X-axis for every row. Display a single sticky X-axis header or use a background grid context for the values. |
| **L4** | **Ticks (X)** | **Simplify labels** | Keep the "Poor", "Neutral", "Great" context but visually integrate them into the track background or a top legend, rather than standard axis ticks, to reduce clutter. |
| **L2** | **Data Marks** | **Recompose (Change Encoding)** |  1. **Add Color**: Map the rating score to a color gradient (Red -> Yellow -> Green) to provide double encoding (Position + Color) for faster cognitive processing. <br> 2. **Add Track**: Add a background line (0-10 range) behind the dot so users understand the scale relative to the max value (10). |
| **L5** | **Interaction** | **Recompose (Replace)** | Replace `hover` tooltips with a direct value display (Right-aligned text next to the genre) or a `click` trigger that expands the row for more details (count of movies, etc.). |

### Justification for Deviations
- **Why not just `Transpose Axes` (Vertical Bars)?** Vertical bars for 0-10 ratings would take up too much vertical height per item. A horizontal dot/bar aligns better with the mental model of a "rating bar" and fits text labels better.
- **Labels**: Moving labels from the Y-axis to a "Card Header" position is a combination of `Reposition` and `Serialize Layout` strategies, ensuring readable typography without truncating long genre names (e.g., "Documentary").

## 3. Data Extraction & Processing

The agent needs to perform real data extraction and aggregation, as the source is an HTML file pointing to a JSON URL.

1.  **Source**: Fetch data from `https://vega.github.io/editor/data/movies.json`.
2.  **Schema**:
    -   `Major Genre` (String): Grouping key.
    -   `IMDB Rating` (Number): Value to aggregate.
3.  **Processing Logic (JavaScript)**:
    -   Filter out entries where `Major Genre` or `IMDB Rating` is null/undefined.
    -   Group data by `Major Genre`.
    -   Calculate the **Mean** of `IMDB Rating` for each group.
    -   Sort the groups by the calculated Mean (Ascending or Descending).
    -   Format the Mean to 1 or 2 decimal places.

## 4. Implementation Steps

1.  **Setup & Utilities**:
    -   Create a utility function to fetch and process `movies.json`.
    -   Implement the aggregation logic: `groupBy` genre -> `average` rating.
    -   Sort the result by rating.

2.  **Component Architecture**:
    -   **`Visualization` (Main)**:
        -   Fetch data on mount.
        -   Render a layout container.
        -   Render a "Legend/Scale" header (showing 0, 5, 10 / Poor, Neutral, Great).
    -   **`GenreRow` (Sub-component)**:
        -   Props: `genreName`, `rating`.
        -   Layout: Flex column.
        -   **Top**: Genre Name (Left) + Numeric Rating (Right, Bold/Colored).
        -   **Bottom**: The Visualization Track.
            -   Background track (gray/glass).
            -   Foreground Dot/Indicator positioned at `(rating / 10) * 100%`.
            -   Color of dot determined by rating threshold.

3.  **Styling (Tailwind)**:
    -   Use a "Glassmorphism" card style for the list items if using a dark theme.
    -   Typography: Large, readable font for Genre names.
    -   Visuals: Smooth transitions for the dots on load.

4.  **Interaction**:
    -   No complex hovering.
    -   The exact value is explicitly printed, so interaction is secondary.
    -   Optional: Tap a row to highlight it.

5.  **Recharts Integration**:
    -   *Correction*: While Recharts is powerful, for this specific "List of 1D dots" layout where labels need to beheaders, using standard HTML/CSS/SVG for the bars is often cleaner and more performant than rendering 15 separate Recharts instances.
    -   *Alternative Recharts Strategy*: Use a single `ComposedChart` with `layout="vertical"`.
        -   `YAxis`: type="category", `dataKey="genre"`, `width={0}` (Hidden axis line).
        -   `XAxis`: type="number", domain `[0, 10]`, hide.
        -   `Scatter`: Render the dots.
        -   *Custom YAxis Tick*: This is the key. Use a custom tick component that renders the text **above** the scatter point line.
    -   *Decision*: I will use **Recharts** to maintain consistency with the tech stack. I will use a `ScatterChart` with a custom shape or a `ComposedChart`. I will use `YAxis` with a custom `tick` component to render the Genre Label aligned to the left, slightly offset vertically to sit above the dot line.

### Refined Implementation Plan (Recharts Focused)
1.  **Data**: Aggregate `movies.json`.
2.  **Chart**: `ComposedChart` (Layout: Vertical).
3.  **Height**: Calculate dynamic height based on `data.length * rowHeight`.
4.  **XAxis**: Domain [0, 10]. Hide standard axis, but keep gridlines if they help (maybe just vertical lines for 0, 5, 10).
5.  **YAxis**: Hidden line. Custom `tick` component.
    -   The tick will render the `Major Genre` text at `x=0, y=index`.
6.  **Mark**: `Scatter` or `Bar` (as a thin background line) + `Scatter` (the dot).
    -   Actually, simpler: Render a `Bar` for the "track" (width 100%, invisible or gray) and a `Scatter` for the value?
    -   **Best approach**: Use `ScatterChart`.
        -   Y-Axis is the category (Genre).
        -   X-Axis is the rating.
        -   Custom `Shape` for the Scatter point to include a "halo" or glow.
        -   Background grid: Custom SVG background or ReferenceLines at 0, 5, 10.
        -   Labels: Rendered effectively as "Annotation" or separate HTML overlay to ensure text doesn't scale weirdly inside SVG.
    -   *Revised Plan*: To ensure "Premium Mobile UX", mixing HTML (for text/layout) and SVG (for the dataviz) is safer than forcing complex text layouts into SVG.
    -   **Final Decision**: Map over the data array. Render a `div` for each Genre. Inside the `div`, use a small Recharts (or just pure SVG/Tailwind for a single bar since it's 1D) or a single large Recharts instance where I disable the Y-Axis text and render my own HTML labels absolutely positioned?
    -   **Lets stick to the Recharts Tech Stack requirement strictly**:
        -   One tall `ScatterChart`.
        -   `margin={{ left: 20, right: 20 }}`.
        -   `YAxis`: `dataKey="genre"`, `type="category"`, `width={100}` (or sufficient width), `tick={{ fontSize: 12, fill: '#fff' }}`.
        -   *Wait, Y-Axis labels on the left waste space.*
        -   **Action**: `Reposition`. Hide YAxis ticks. Use `LabelList` on the Scatter points? No.
        -   **Solution**: Use the **Data Mapping** approach. Map data to React components. Each component contains:
            1. Text Header (Genre + Score).
            2. A responsive `ResponsiveContainer` (height 40px) with a 1D `ScatterChart` (X Axis 0-10, Y Axis dummy).
            *Actually, rendering 20 ResponsiveContainers is heavy.*
        -   **Optimization**: Pure SVG or Tailwind progress bars are better for this than Recharts, but I must use Recharts.
        -   **Compromise**: Single `ScatterChart` (Vertical). `YAxis` width = 0. Use `ReferenceLine` for the "track" of each genre? No.
        -   **Chosen Path**: **Single Chart**.
            -   **YAxis**: Hidden.
            -   **Content**: `Customized` component or `LabelList` to render genre names **above** the dots.
            -   **Grid**: `CartesianGrid` vertical only.
            -   **Tooltip**: Custom Cursor.

**Correction for Premium Aesthetics**: A list of cards is the most "Mobile Native" and "Premium" feel.
I will implement a loop in React that renders a "Card" for each genre. Inside the card, I will use a minimalist SVG (Vis) component (since Recharts might be overkill for a single dot, but I can use a minimal Recharts instance if strictly required, or standard SVG line/circle). Given the prompt asks for Recharts, I will use a **Single Composed Chart** where the Y-Axis is customized to render the text *inside* the plot area (left aligned) and the dots are colored.

**Actually, to ensure the best text readability (Hard Requirement), I will separate the Text from the Chart.**
Layout:
1. Row Title (HTML Text)
2. Row Chart (Recharts Container - Height 30px).
This ensures text wraps correctly, is selectable, and accessible.

Wait, splitting into many charts is bad performance.
**Final Plan**:
1.  Process Data.
2.  Render a semantic HTML list `<ul>`.
3.  Inside each `<li>`, render the Genre Name and Rating value (HTML).
4.  Below the text, render a simple **SVG** bar (or a very lightweight Recharts instance if strictly forced, but SVG is standard for simple linear gauges).
    *   *Self-Correction*: The prompt demands **Recharts**. I will use a **single** `ScatterChart` with `layout='vertical'`.
    *   I will set `YAxis` width to `1` (essentially hidden) and render the Genre Labels using a **custom `YAxis` tick component** that translates the text to sit *above* the grid line of that row. This achieves the "Text above bar" layout within a single chart canvas.

### Detailed Steps
1.  Fetch `movies.json`.
2.  Aggregate: Group by `Major Genre`, avg `IMDB Rating`. Sort by Rating.
3.  Container: `h-[600px] w-full`.
4.  Recharts Component: `ScatterChart`.
    -   `margin: { top: 20, right: 20, bottom: 20, left: 20 }`.
    -   `XAxis`: type number, domain `[0, 10]`, ticks `[0, 5, 10]`, tickFormatter `(val) => label map`.
    -   `YAxis`: type category, dataKey "genre", `interval={0}`, **`tick={<CustomTick />}`**.
        -   `CustomTick`: Renders `<text>` elements. Shift `y` up by 15px to place text above the dot line. Shift `x` to 0 (left align).
    -   `ZAxis`: range `[60, 60]` (fixed dot size).
    -   `CartesianGrid`: `strokeDasharray="3 3"`, horizontal lines for "tracks".
    -   `Scatter`: dataKey "rating", `shape={<CustomShape />}` (Glowy circle).
    -   `Tooltip`: Custom tooltip.