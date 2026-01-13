# Mobile Visualization Transformation Plan

## 1. High-Level Analysis & Diagnosis

### Desktop Visualization Analysis
The original visualization is a **vertical bar chart** depicting the "Top 10 Movies by IMDB Rating".
- **Mark**: Vertical Bars.
- **X-Axis**: Categorical (Movie Titles).
- **Y-Axis**: Quantitative (IMDB Rating).
- **Encoding**: Height and Color both represent the IMDB Rating.
- **Filter**: Top 10 items based on rank.

### Mobile Constraints & Issues
- **Aspect Ratio Mismatch**: The desktop version relies on horizontal space to lay out 10 bars side-by-side. On a mobile portrait screen (9:16), this will result in extremely thin bars.
- **Unreadable Labels (Critical)**: Movie titles are often long. In a vertical bar chart on mobile, X-axis labels will either overlap, require severe rotation (90 degrees), or be aggressively truncated, making the chart illegible.
- **Touch Targets**: Thin vertical bars are difficult to tap for details.

### Transformation Strategy
The core strategy is **Transpose (Axis Rotation)**. We must convert the vertical bar chart into a **horizontal bar chart**. This aligns with the natural reading direction of text (movie titles) and allows the bars to extend horizontally, utilizing the phone's width efficiently. We will also apply **Serialize Layout** principles to handle text and bars gracefully.

---

## 2. Design Action Plan (Vis2Mobile Actions)

Based on the `mobile-vis-design-action-space.md`, here are the specific actions:

### L2 Coordinate System
*   **Action: `Transpose` (Axis-Transpose)**
    *   **Why**: To solve the "Distorted layout" and "Unreadable font size" issues. Changing from vertical columns to horizontal bars provides ample horizontal space for long movie titles on the Y-axis (or above the bars).
    *   **Result**: Titles list vertically; bars extend horizontally.

### L3/L4 Axes & Ticks
*   **Action: `Recompose (Remove)` (Axis Line & Ticks)**
    *   **Why**: On mobile, minimizing "Data-ink ratio" is crucial. The precise grid lines and axis lines add visual noise.
    *   **Implementation**: Remove the X-axis (Rating scale) line and grid. Instead, place the direct data value (Rating) at the end of the bar or inside it.
*   **Action: `Simplify labels` (Y-Axis Labels)**
    *   **Why**: Even with horizontal bars, long titles might squeeze the chart.
    *   **Implementation**: Use CSS `text-overflow: ellipsis` for very long titles, but since we transposed, we have much more room than before.

### L2 Data Marks
*   **Action: `Rescale` (Bar Width)**
    *   **Why**: To ensure "Touch-friendliness".
    *   **Implementation**: Increase the thickness (height in horizontal layout) of the bars to be at least 32-40px height, making them comfortable to tap.
*   **Action: `Reposition` (Mark Labels)**
    *   **Why**: To save horizontal space.
    *   **Implementation**: Place the ranking number (e.g., #1) and the Rating Value (e.g., 9.2) clearly. The Rating Value will be placed **inside** or **immediately to the right** of the bar.

### L1 Interaction
*   **Action: `Reposition (Fix)` (Feedback/Tooltip)**
    *   **Why**: Hover doesn't exist on mobile.
    *   **Implementation**: Implement a "Click to Focus" interaction. Tapping a bar highlights it and perhaps shows a bottom sheet or a card overlay with more details (like the full title if truncated, or the specific numeric score). *For this MVP, we will display the score directly on the chart to reduce interaction cost, but enable highlighting on touch.*

---

## 3. Data Extraction Plan

Since the source uses a remote URL (`movies.json`) and performs a transform (`window rank`, `filter < 10`), I must manually process this data to provide the "Codified Data" for the component.

1.  **Source Data**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`
2.  **Processing Logic**:
    *   Filter entries where `IMDB Rating` is not null.
    *   Sort by `IMDB Rating` descending.
    *   Take the top 10.
    *   *Note*: If there are ties, Vega-Lite's default rank window handles them. I will select the top 10 representative high-ranking movies found in that dataset.
3.  **Extracted Data Structure (example)**:
    ```typescript
    const MOVIE_DATA = [
      { rank: 1, title: "The Shawshank Redemption", rating: 9.3, votes: 1693482 },
      { rank: 2, title: "The Godfather", rating: 9.2, votes: 1126639 },
      // ... remaining 8 items
    ];
    ```

*Self-Correction*: I will simulate the exact logic of the Vega spec to get the correct list. The spec sorts by IMDB Rating descending.

---

## 4. Implementation Details

### Component Architecture
*   **Framework**: Next.js 14 (App Router)
*   **Library**: `Recharts` for the visualization.
*   **Styling**: `TailwindCSS` for layout and glassmorphism effects.

### Step-by-Step Implementation

1.  **Container Setup**:
    *   Create a Card-like container with a subtle glassmorphic background (`bg-white/10 backdrop-blur-md`).
    *   Use `h-auto` or `min-h-[500px]` to ensure scrolling is possible if the screen is short, though 10 items fit well on most screens.

2.  **Header**:
    *   **Title**: "Top Rated Movies" (Simplified from source).
    *   **Subtitle**: "Based on IMDB Ratings".

3.  **Visualization (Recharts)**:
    *   Component: `<BarChart layout="vertical" ... />`.
    *   **XAxis**: Type "number", hide axis line, hide tick lines. Domain `[0, 10]` to give context to the rating.
    *   **YAxis**: Type "category", dataKey="title".
        *   *Critical Mobile Adjustment*: Instead of using the default YAxis which might truncate text awkwardly, I will use a **Custom Y-Axis Tick**. This tick will render the movie title with proper truncation logic and styling. Or, I might hide the YAxis entirely and render the Title as a `<text>` element inside the generic chart content or using `label` prop on the Bar to render it *above* the bar (Serialize Layout).
        *   *Decision*: Use standard YAxis but increase `width` to ~120px-140px and allow text wrapping or ellipsis.
    *   **Bar**:
        *   Height: ~30px.
        *   Radius: `[0, 4, 4, 0]` (Right side rounded).
        *   Color: Dynamic gradient or solid Gold/Orange color to signify "Rating".
    *   **LabelList**: Render the numeric rating inside the bar (right-aligned) or just outside it for clarity.

4.  **Premium Aesthetics**:
    *   **Font**: Inter or system-ui.
    *   **Colors**: Dark background (slate-900) with Orange/Amber bars to represent IMDB's brand colors/Gold standard.
    *   **Animation**: Smooth entry animation for the bars (`isAnimationActive={true}`).

5.  **Responsiveness**:
    *   Ensure the container has padding.
    *   Use `ResponsiveContainer` from Recharts.

### Summary of Differences from Desktop
| Feature | Desktop (Original) | Mobile (Planned) |
| :--- | :--- | :--- |
| **Orientation** | Vertical | **Horizontal (Transposed)** |
| **X-Axis** | Movie Titles | **Rating Value (Hidden/Implicit)** |
| **Y-Axis** | Rating Value | **Movie Titles** |
| **Labels** | Axis Labels | **Integrated Labels / List View** |
| **Interactivity** | Hover | **Touch / Always Visible Data** |