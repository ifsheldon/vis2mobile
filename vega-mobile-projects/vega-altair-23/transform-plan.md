# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
*   **Format**: Vega-Lite Specification embedded in HTML.
*   **Chart Type**: Histogram with a Global Mean Overlay.
*   **Data**: External JSON (`movies.json`).
*   **Encodings**:
    *   **X-Axis**: `IMDB Rating` (Quantitative, Binned).
    *   **Y-Axis**: `Count` (Quantitative, Aggregated).
    *   **Layer**: A vertical red rule representing the `mean` of `IMDB Rating`.
*   **Desktop Appearance**: Wide aspect ratio, simple blue bars, standard axes, thin red line for mean.

### Mobile Challenges (Based on `desktop_on_mobile.png`)
1.  **Aspect Ratio**: The default wide layout results in a very short chart on mobile, compressing the Y-axis and making bars hard to distinguish.
2.  **Touch Targets**: Thin bars are difficult to tap to see exact counts.
3.  **Readability**: Axis labels might become too small or crowded if the default Vega behavior persists on a narrow screen.
4.  **Interactivity**: Hover tooltips (standard in desktop Vega) do not translate well to touch interfaces.
5.  **Visual Hierarchy**: The "Mean" line is visually thin and lacks a textual label explaining its value immediately without interaction.

## 2. High-Level Mobile Design Strategy

The goal is to create a **"Movie Ratings Distribution"** card. Instead of a squashed wide chart, we will use a **square or portrait aspect ratio (e.g., 1:1 or 4:5)**.

We will use a modern **dark/glassmorphic theme** or a clean light theme (depending on the system preference, but defaulting to a premium dark mode often looks better for media data). The bars will use a gradient fill. The "Mean" line will be highlighted as a key insight, with a dedicated label. Interaction will switch from hover to **Touch/Drag**, where scrubbing across the chart updates a **fixed data display** area.

## 3. Design Action Space Plan

### L0: Visualization Container
*   **Action**: `Rescale` (Aspect Ratio)
    *   **Reasoning**: Change the aspect ratio from landscape to square/portrait. This utilizes vertical mobile scrolling effectively and gives the bars enough height to show subtle differences in frequency.
*   **Action**: `Reposition` (Margins)
    *   **Reasoning**: Remove standard SVG margins and handle spacing via CSS padding in the container to ensure the chart spans the full comfortable width (`w-full`).

### L1: Data Model
*   **Action**: `Recompose (Aggregate)`
    *   **Reasoning**: Recharts does not natively bin data like Vega-Lite. I must manually process the raw `movies.json` data to:
        1.  Calculate the Global Mean of `IMDB Rating`.
        2.  Create bins (e.g., 0.5 or 1.0 steps) and count the frequency of movies in each bin.

### L2: Title Block
*   **Action**: `Recompose (Replace)` (Title Strategy)
    *   **Reasoning**: The original spec lacks a visual title. I will add a **Main Title ("IMDB Ratings")** and a **Subtitle ("Distribution of movie scores")** to provide immediate context.
    *   **Action**: `Reposition`
    *   **Reasoning**: Place the title outside the SVG, at the top left of the card, following standard mobile UI patterns.

### L3: Axes & Coordinate System
*   **Action**: `Recompose (Remove)` (Y-Axis Line & Domain)
    *   **Reasoning**: Remove the vertical Y-axis line. Keep horizontal gridlines (faint) to guide the eye, but reduce visual clutter.
*   **Action**: `Decimate Ticks` (Y-Axis)
    *   **Reasoning**: Reduce Y-axis tick count (e.g., only show 3-4 levels: 0, mid, max) to save horizontal space for the actual bars.
*   **Action**: `Simplify labels` (X-Axis)
    *   **Reasoning**: Ensure X-axis labels (Ratings 0-10) are legible. Use integer steps (0, 2, 4, 6, 8, 10) to prevent overcrowding.

### L2: Data Marks (Bars)
*   **Action**: `Rescale` (Bar Width)
    *   **Reasoning**: Use `barSize` or `gap` settings to ensure bars are thick enough to be visually pleasing, with rounded top corners for a modern aesthetic.
*   **Action**: `Recompose (Change Encoding)` (Gradient)
    *   **Reasoning**: Replace the flat blue color with a vertical gradient (e.g., Indigo to Purple) to add depth and "premium" feel.

### L2: Data Marks (Mean Rule)
*   **Action**: `Reposition` (Annotation)
    *   **Reasoning**: The mean line needs a label. I will add a visual "badge" or text annotation at the top of the line explicitly stating the value (e.g., "Avg: 6.5") so users don't have to guess.
*   **Action**: `Emphasize`
    *   **Reasoning**: Use a dashed stroke or a distinct glowing color (Red/Orange) to separate it from the frequency bars.

### L5: Interaction & Feedback
*   **Action**: `Reposition (Fix)` (Tooltip)
    *   **Reasoning**: **Fixed Feedback Area**. Instead of a tooltip floating under the finger, display the details of the active bar (Rating Range + Movie Count) in a dedicated space (e.g., inside the Title Block or a specific "Stats" row above the chart).
*   **Action**: `Triggers` (Touch/Click)
    *   **Reasoning**: Enable `activeDot` or active bar styling on touch.

## 4. Data Extraction & Processing

Since the source is an external JSON, the extraction must happen at runtime (or pre-calculation steps).

**Source URL**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`

**Processing Logic**:
1.  **Fetch**: Retrieve JSON data.
2.  **Clean**: Filter objects where `IMDB Rating` is not null.
3.  **Calculate Mean**: Sum of all ratings / Count of ratings.
4.  **Binning**:
    *   Determine Min/Max (Likely 0 to 10).
    *   Set Bin Step: 0.5 (Common for ratings).
    *   Iterate through data and increment counts for corresponding bins.
5.  **Output Structure for Recharts**:
    ```typescript
    interface ChartData {
      binStart: number; // e.g., 6.0
      binEnd: number;   // e.g., 6.5
      label: string;    // "6.0 - 6.5"
      count: number;    // Frequency
    }
    // Plus a separate constant for `globalMean`
    ```

## 5. Implementation Steps

1.  **Setup Component Structure**: Create `Visualization.tsx` with a responsive container using Tailwind.
2.  **Data Fetching**: Implement a `useEffect` to fetch and process the `movies.json` data into the binned format and calculate the mean.
3.  **Layout Construction**:
    *   Header: Title "IMDB Ratings", Subtitle, and a dynamic "Active Item" display area.
    *   Main: Responsive `Recharts` container (Aspect Ratio ~4:3).
4.  **Chart Implementation**:
    *   `<ResponsiveContainer>` wrapping `<BarChart>`.
    *   `<XAxis>` with formatted ticks.
    *   `<YAxis>` hidden or minimal.
    *   `<Tooltip>` with `cursor={{ fill: 'transparent' }}` but using `onMouseMove` / `activeState` to update the Header display instead of rendering a default tooltip.
    *   `<Bar>` with `Radius` (rounded top) and Gradient Fill.
    *   `<ReferenceLine>` for the Mean, with a custom Label component.
5.  **Styling**: Apply glassmorphism (backdrop-blur, translucent backgrounds) to the container. Use Lucide icons for context (e.g., a Movie icon).
6.  **Refinement**: Adjust font sizes, padding, and colors to ensure accessibility and touch-friendliness. Ensure the red mean line contrasts well with the bars.