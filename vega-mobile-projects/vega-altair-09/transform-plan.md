# Mobile Visualization Transformation Plan

## 1. Analysis of Original Desktop Visualization

### Original Desktop State
- **Type**: Faceted Grouped Bar Chart with Error Bars.
- **Data Source**: Agricultural yield data (`yield`, `variety`, `year`, `site`).
- **Structure**:
    - **Faceting**: Horizontally split by `site` (6 columns: Crookston, Duluth, Grand Rapids, Morris, University Farm, Waseca).
    - **X-Axis**: `year` (Ordinal: 1931, 1932).
    - **Y-Axis**: `Mean Yield` (Quantitative).
    - **Marks**: Vertical bars grouped by year, with error bars representing Confidence Interval (CI).
    - **Color**: Encodes `year` (Blue for 1931, Orange for 1932).

### Mobile Rendering Issues (Desktop on Mobile)
- **Distorted Layout**: Squeezing 6 faceted columns into a narrow mobile width results in extremely thin, unreadable bars.
- **Unreadable Typography**: Axis labels (Site names) overlap or become microscopically small.
- **Loss of Context**: The comparison aspect (comparing yield across sites) is lost because the charts are too small to discern height differences visually.
- **Touch Targets**: The bars are too thin for reliable touch interaction.

## 2. High-Level Strategy: "Serialize and Rotate"

To adapt this multi-column faceted chart for mobile, we must abandon the horizontal spread. The core design philosophy will be **Serialize Layout** (stacking charts vertically) and **Transpose Axes** (converting vertical bars to horizontal bars).

Vertical scrolling is the most natural interaction on mobile. By rotating the bars horizontally, we gain width for the bars to display length differences clearly, and we provide ample space for the text labels (Site names) which are currently legible only on desktop.

## 3. Detailed Action Plan (mapped to Design Action Space)

### L1: Chart Components & Layout
*   **Action: Transpose (Serialize layout)**
    *   *Reasoning*: The desktop version uses horizontal faceting (columns). On mobile, we will stack the facets vertically. Each "Site" will become its own Card component arranged in a vertical list.
*   **Action: Reposition**
    *   *Reasoning*: Introduce consistent padding and margins between the new "Site Cards" to create breathing room (whitespace) and reduce visual clutter.

### L2: Coordinate System
*   **Action: Transpose (Axis-Transpose)**
    *   *Reasoning*: Convert **Vertical Bar Chart** to **Horizontal Bar Chart**.
    *   *Justification*: Horizontal bars work better on mobile because they accommodate label text (Site names) on the left without rotation, and the bar length naturally follows the screen's reading direction. It prevents the "spaghetti" look of thin vertical bars.

### L3: Axes & Gridlines
*   **Action: Recompose (Remove)** - *Y-Axis on individual cards*
    *   *Reasoning*: Since we are grouping by Site in cards, we don't need a repetitive Y-axis for "Year" on every card. We can use a legend or subtitle to indicate which bar color corresponds to which year.
*   **Action: Set Domain (Shared Scale)**
    *   *Reasoning*: To preserve the ability to compare Site A vs Site B (the original intent of the trellis plot), all individual charts must share the exact same X-Axis domain (e.g., 0 to Max Yield across all data). If each card auto-scales, visual comparison is impossible.

### L2: Data Marks (Bar + ErrorBar)
*   **Action: Rescale (Width)**
    *   *Reasoning*: Increase the thickness of the bars significantly. In the horizontal orientation, bars should be tall enough (e.g., 32px height) to be easily tappable and visually distinct.
*   **Action: Recompose (Aggregate)** - *Data Processing*
    *   *Reasoning*: The original spec calculates `mean` and `CI` on the fly. We must implement a data processing step to calculate the Mean Yield and Standard Deviation/Confidence Interval for each Site/Year group before passing it to Recharts, as Recharts does not do statistical aggregation automatically.

### L4: Labels & Typography
*   **Action: Recompose (Replace)** - *Titles*
    *   *Reasoning*: Instead of a bottom X-axis label for "Site", place the "Site Name" as the bold header of each card.
*   **Action: Simplify Labels**
    *   *Reasoning*: Remove axis titles like "Mean Yield" to save space, moving this context to the main component Header or Subtitle.

### L5: Interaction & Feedback
*   **Action: Reposition (Fix Tooltip)**
    *   *Reasoning*: Use a custom Tooltip that snaps to the top or bottom of the card, or a simplified popover, rather than a floating tooltip that might be covered by a finger.
*   **Action: Trigger (Click vs Hover)**
    *   *Reasoning*: Ensure charts respond to tap (active state) to show the specific Mean and CI values.

## 4. Data Extraction Plan

The data is embedded in the HTML script tag under `datasets`.

1.  **Extract Raw Data**: Isolate the JSON object `datasets['data-9cc0564cb5591205eeeca8d2429dd11b']`.
2.  **Schema**:
    ```typescript
    interface RawDataPoint {
      yield: number;
      variety: string;
      year: number;
      site: string;
    }
    ```
3.  **Transformation Logic (Aggregation)**:
    *   Group raw data by `site` and `year`.
    *   For each group, calculate:
        *   `mean_yield`: Average of `yield` values.
        *   `ci_lower`, `ci_upper`: Calculate the 95% Confidence Interval (or Standard Error range) to reconstruct the error bars shown in the original image. *Note: The original Vega-Lite spec uses `extent: "ci"`. We will calculate standard error or simple CI to approximate this for the mobile view.*
    *   **Resulting Structure for UI**:
        ```typescript
        interface SiteGroup {
          site: string;
          data: {
            year: number;
            mean: number;
            ci: [number, number]; // [min, max] for error bar
          }[];
        }
        ```

## 5. Implementation Steps

1.  **Setup**: Initialize `src/components/Visualization.tsx` with required imports (`recharts`, `lucide-react`, etc.).
2.  **Data Processing**: Implement the `processData` function to transform the raw JSON into the grouped structure with calculated means and error ranges. Find the global max yield to set a fixed X-axis domain.
3.  **Layout Shell**: Create a main container with a global header (Title: "Barley Yield Analysis", Legend: Blue=1931, Orange=1932).
4.  **Component Construction**:
    *   Create a reusable `SiteCard` component.
    *   Inside `SiteCard`, use `Recharts.ComposedChart` (Layout: 'vertical').
    *   Render `<Bar />` for the mean yield.
    *   Render `<ErrorBar />` inside the Bar to show the variance.
    *   Apply the calculated fixed domain to the XAxis.
5.  **Styling**: Apply Tailwind classes for a "Card" aesthetic (white bg, shadow-sm, rounded-lg) on a light gray background. Use modern colors (e.g., Indigo-500 for 1931, Rose-500 for 1932) to replace the default Vega colors.
6.  **Refinement**: Ensure the font sizes for Site Titles are large (text-lg, font-semibold) and data labels are readable.