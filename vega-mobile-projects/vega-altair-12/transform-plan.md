# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Vertical Bar Chart (Column Chart).
- **Data**: Top 10 Movies by IMDB Rating.
- **X-Axis**: Movie Titles (Categorical/Nominal).
- **Y-Axis**: IMDB Rating (Quantitative).
- **Encoding**: Bar height represents rating; Color also represents rating (redundant but aesthetic encoding).
- **Interaction**: Standard tooltip (implied by Vega-Lite).
- **Layout**: Wide landscape aspect ratio. Labels on X-axis are horizontal, which requires significant width to prevent overlapping or rotation.

### Mobile Rendering Issues (Desktop on Mobile)
- **Distorted Layout**: The X-axis labels (Movie Titles) will likely overlap, rotate 90 degrees (becoming hard to read), or be aggressively truncated due to lack of horizontal pixels.
- **Touch Targets**: Vertical bars in a Top 10 chart on a narrow screen might be too thin for reliable finger tapping.
- **Aspect Ratio**: The 16:9 layout becomes tiny when scaled down to mobile width (viewport width ~375px-400px), making text unreadable.

## 2. High-Level Strategy & Design Rationale

The primary transformation strategy is **Transposition (Rotation)**.

Vertical bar charts with long categorical labels (like Movie Titles) are notoriously poor on mobile devices. Users naturally scroll vertically on mobile. By transposing the chart to a **Horizontal Bar Chart**, we align the list of movies with the natural vertical flow of the device, allowing ample space for long titles to be read horizontally without tilting the head.

We will adopt a **"Premium List" aesthetic**:
1.  **Transpose Axes**: Titles become the Y-axis (or row headers), Rating becomes bar width.
2.  **Embedded Data**: Instead of a separate numerical axis which takes up space, we will place the exact rating value inside or immediately next to the bar.
3.  **Interactive Details**: Tapping a row will trigger a bottom-sheet style detail view or an expanded state, solving the "hover" limitation on mobile.

## 3. Action Space Mapping

Based on the `mobile-vis-design-action-space.md`, the following actions will be taken:

### L0: Visualization Container
- **Action**: `Rescale`
    - **Reason**: Force `width: 100%` and allow `height` to grow dynamically based on the number of items (Top 10). The viewbox must adapt to the device width.

### L1: Data Model
- **Action**: `Filter` / `Sort` (Implicit in Source)
    - **Reason**: The source Vega-Lite spec performs a specific transform: `window: rank`, `filter: rank < 10`. We must replicate this logic in the React component to ensure we only render the Top 10 items, preventing information overload.

### L2: Coordinate System
- **Action**: `Transpose (Axis-Transpose)` (High Priority)
    - **Reason**: Convert Vertical Columns to Horizontal Bars. This fixes the readability of movie titles.

### L2: Data Marks (Bars)
- **Action**: `Rescale` (Reduce width / Increase height)
    - **Reason**: In the horizontal context, we increase the *thickness* (height) of the bars to ~32px-40px to serve as comfortable touch targets.
- **Action**: `Recompose (Change Encoding)`
    - **Reason**: The original uses a gradient/color scale for ratings. We will maintain this by using a color scale function (e.g., darker blue/purple for higher ratings) to keep the "Premium Aesthetics."

### L3: Axes
- **Action**: `Recompose (Remove)` (Axis Lines & Ticks)
    - **Reason**: We will hide the X-axis (numerical scale 0-10) entirely to save vertical space.
- **Action**: `Serialize layout`
    - **Reason**: Instead of an axis, we will place the numeric value (e.g., "9.3") directly inside the bar or to the right of it. This provides immediate data retrieval without visual scanning across grid lines.

### L5: Interaction & Labels
- **Action**: `Simplify Label`
    - **Reason**: If a movie title is extremely long, we will use CSS text-overflow ellipsis.
- **Action**: `Reposition (Fix)` (Tooltip)
    - **Reason**: Replace hover tooltips with a "Selection" state. Tapping a bar highlights it and shows details (Title + Exact Rating) in a fixed card at the bottom or top of the component.
- **Action**: `Recompose (Replace)` (Triggers)
    - **Reason**: Change `hover` events to `click/tap` events for selecting a movie.

## 4. Data Extraction Plan

The source HTML references an external URL: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`. Since I cannot make network requests during the final component rendering in this specific environment context (assuming static generation preference or restricted env), I will **embed the specific slice of data** required.

**Extraction Steps:**
1.  Target the dataset: `movies.json`.
2.  Apply the Sort: Descending by `IMDB Rating`.
3.  Apply the Filter: Top 10 items.
4.  **Hardcode this processed subset** into the component to ensure it works offline and renders instantly.

*Self-Correction on Data*: The prompt asks to "Extract and use real data". I will provide the raw data structure for the Top 10 movies found in that dataset (e.g., *The Shawshank Redemption*, *The Godfather*, etc.) to ensure the component renders the actual visualization intended by the source code.

## 5. Implementation Steps

1.  **Setup Component Shell**: Create a responsive card container using Tailwind with a glassmorphism effect (`bg-white/10 backdrop-blur-md`).
2.  **Data Preparation**: Create a constant `TOP_MOVIES_DATA` containing the top 10 movies sorted by rating (extracted from the Vega logic).
3.  **Chart Construction (Recharts)**:
    -   Use `ResponsiveContainer` for L0 Rescale.
    -   Use `BarChart` with `layout="vertical"` for L2 Transpose.
    -   **XAxis**: Type "number", `hide` (L3 Remove).
    -   **YAxis**: Type "category", dataKey "Title", `width` set dynamically or fixed to allow text space, `tick={{ fontSize: 12 }}`.
    -   **Bar**: Custom shape or standard bar with a `LabelList` component to render the rating inside/right of the bar.
    -   **Tooltip**: Custom `Cursor` and `Content` to match the mobile theme.
4.  **Styling & Polish**:
    -   Apply a distinct color palette (Purple/Blue gradients) to match the "Premium" requirement.
    -   Ensure text contrast meets accessibility standards.
    -   Add `Lucide` Star icon next to the rating values.
5.  **Interaction**:
    -   Add an `onClick` handler to the Bar.
    -   Use React state `activeMovie` to display a focused overlay or simply highlight the selected bar.

This plan ensures the visualization is not just a shrunk desktop chart, but a native mobile list-based visualization that preserves the data insights (Ranking and Magnitude) while drastically improving readability.