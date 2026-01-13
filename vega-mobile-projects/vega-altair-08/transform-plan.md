# Vis2Mobile Plan: Barley Yield Stacked Bar Chart

## 1. Analysis of Original Visualization

### Desktop Version Features
- **Type:** Horizontal Stacked Bar Chart.
- **Data Dimensions:**
    - **Y-Axis:** Variety (Categorical: Glabron, Manchuria, etc.).
    - **X-Axis:** Sum of Yield (Quantitative).
    - **Color:** Site (Categorical: 6 distinct sites).
    - **Text Labels:** Specific yield values embedded inside the bar segments.
- **Layout:** Y-axis labels on the left, stacked bars in the center, legend on the right.
- **Interaction:** Basic Vega-Lite tooltips (likely hover).

### Mobile Rendering Issues (from `desktop_on_mobile.png`)
1.  **Horizontal Compression:** The aspect ratio forces the bars to be extremely short, making visual comparison of lengths difficult.
2.  **Unreadable Text:** The numeric labels inside the bar segments are overlapping, illegible, or completely hidden due to narrow segment widths.
3.  **Wasted Space:** The Y-axis labels (Variety names) occupy about 20-25% of the horizontal width, and the Legend on the right occupies another chunk, leaving very little room for the actual data.
4.  **Touch Targets:** The individual color segments are too small for precise finger tapping.
5.  **Axis Readability:** The X-axis (Yield) at the bottom is dense and hard to associate with the top-most bars on a long vertical scroll.

## 2. High-Level Strategy & Design Rationale

**Core Concept:** Transform the monolithic chart into a **"Card-based List View"**.

Instead of trying to squeeze a single coordinate system into a mobile screen, we will treat each "Variety" as a distinct row item (a "Card"). This creates a scrollable vertical list.

### Rationale:
- **Readability:** By moving the Y-axis label (Variety) *above* the bar, we reclaim 100% of the screen width for the data visualization.
- **Interaction:** Mobile users prefer scrolling vertical lists over panning zoomed-out charts.
- **Clarity:** Removing the crowded internal text labels and replacing them with an interactive details view (or a clear summary) solves the clutter issue.

## 3. Detailed Action Plan (Mapped to Design Action Space)

### L0: Visualization Container
-   **Action:** `Rescale`
    -   **Why:** Set width to 100% and height to `auto` (grow with content). The container will be a scrollable vertical flex column.

### L1: Data Model
-   **Action:** `Recompose (Aggregate)` (Implicit)
    -   **Why:** The raw data lists individual entries per year (1931, 1932). The chart sums yield by site/variety. We must perform this aggregation (summing yields for the same site and variety across years) in the transformation logic to match the desktop chart's "Sum of yield".

### L1: Interaction Layer & L2: Features
-   **Action:** `Recompose (Replace)` Triggers
    -   **Why:** Hover is unavailable. Recharts `Tooltip` will be set to trigger on `click/touch`.
-   **Action:** `Reposition (Fix)` Feedback
    -   **Why:** A standard floating tooltip often gets blocked by the finger. We will use a **"Summary Header"** or **"Active Card State"**. When a user taps a specific Variety bar, that card expands or highlights to show the specific breakdown of values (Site: Yield) in a clean list format, rather than relying on tiny text inside the bar.

### L2: Coordinate System (Chart Components)
-   **Action:** `Serialize Layout` (via L1/L2 approach)
    -   **Why:** Instead of one large Y-Axis, we split the visualization into "Small Multiples" (one stacked bar per Variety).
-   **Action:** `Transpose (Axis-Transpose)` -> **Keep Horizontal**
    -   **Why:** We are technically keeping the horizontal orientation of the bars because it fits text labels better, but we are breaking the single axis into multiple rows.

### L3: Axes
-   **Action:** `Recompose (Remove)` Axis Titles & Lines
    -   **Why:** We don't need a vertical Y-axis line connecting all bars. The grouping is done by UI Cards. We might keep a subtle X-axis grid or just show the Total Value text to save vertical space.
-   **Action:** `Reposition` Tick Labels (Variety Names)
    -   **Why:** Move Variety Name from the left of the chart to the **top-left corner of each bar's container**.

### L2: Data Marks (The Bars)
-   **Action:** `Rescale` Mark Instance
    -   **Why:** Increase the height of the bars (thickness) to make them visually substantial and premium.
-   **Action:** `Recompose (Remove)` Mark Labels
    -   **Why:** The internal numbers (e.g., "27.0", "48.9") are the main source of clutter. We will **remove them from inside the bars**.
    -   **Compensation:** Display the **Total Yield** prominently next to the Variety Name. The breakdown values will be shown in the Legend/Tooltip interaction area when active.

### L3: Legend
-   **Action:** `Reposition` & `Rescale`
    -   **Why:** The right-side legend is impossible on mobile. Move it to the **Top (Sticky)** or **Bottom**.
    -   **Layout:** Use a flex-wrap row layout with circular color indicators. This serves as a key for the colors used in the stacked bars.

## 4. Data Extraction Plan

The data is embedded in the HTML file within the `spec` variable.

1.  **Locate Data Source:** The JSON object `datasets["data-9cc0564cb5591205eeeca8d2429dd11b"]`.
2.  **Schema:**
    ```typescript
    type RawDatum = {
      yield: number;
      variety: string; // "Manchuria", "Glabron", etc.
      year: number;    // 1931, 1932
      site: string;    // "University Farm", "Waseca", etc.
    };
    ```
3.  **Processing Steps (Transform):**
    -   Group by `variety`.
    -   Within each variety, group by `site`.
    -   Sum the `yield` for each site (combining 1931 and 1932).
    -   Calculate the `totalYield` for the variety (for sorting and display).
    -   **Output Structure for Recharts:**
        ```typescript
        type ChartData = {
          name: string; // Variety name
          total: number;
          sites: {
            [siteName: string]: number; // Sum of yield for that site
          }
        }[];
        ```
4.  **Sorting:** To maintain the intention of the original visualization, we should sort the varieties by Total Yield descending (similar to the desktop visual flow).

## 5. Implementation Steps

1.  **Project Setup:** Initialize Shadcn UI Card and Recharts.
2.  **Data Utility:** Create `data.ts` to export the raw JSON and a helper function `processData()` to perform the aggregation described above.
3.  **Component Construction (`Visualization.tsx`):**
    -   **Layout:** Main container with padding.
    -   **Legend Component:** A top-aligned, sticky header showing the color map for the 6 Sites.
    -   **List Rendering:** Map through the processed data.
    -   **Card Component:**
        -   Header: Variety Name (Left) + Total Yield (Right).
        -   Body: A single `<BarChart>` instance from Recharts (layout="vertical") containing one single stacked bar.
            -   *Note:* Using separate chart instances ensures responsive scaling and clean layout control per row.
    -   **Interaction:**
        -   Add `onClick` to the Card.
        -   When clicked, expand the card (Accordion style) or show a focused view listing the exact numeric breakdown per site (e.g., "Waseca: 63.8, Duluth: 28.1...").
4.  **Styling (Tailwind):**
    -   Use a "Glassmorphism" background for the cards.
    -   Use a distinct, vibrant color palette for the sites (Recharts default or custom array matches the original).
    -   Rounded corners on the bars (`radius={[4, 4, 4, 4]}`).
5.  **Refinement:**
    -   Ensure typography is legible (min 14px for body, 16px+ for headers).
    -   Add subtle animation on mount.

## 6. Color Palette Strategy
We will map the sites to a set of distinct colors.
-   Crookston: Blue-ish
-   Duluth: Orange-ish
-   Grand Rapids: Red-ish
-   Morris: Teal-ish
-   University Farm: Green-ish
-   Waseca: Yellow-ish

*Note: We will try to match the original hues but increase saturation slightly for the "Premium Aesthetics" requirement.*