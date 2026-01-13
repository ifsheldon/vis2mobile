# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

- **Type**: Layered Histogram (Overlapping Bar Chart).
- **Data Content**: Three experimental trials (Trial A, B, C) showing the distribution of "Measurement" values.
- **Desktop Features**:
    - Three color-coded distributions overlaid on top of each other.
    - Opacity (0.3) used to show overlapping areas.
    - Legend on the right side.
    - Continuous quantitative axes.
- **Mobile Issues (Desktop_on_mobile.png)**:
    - **Overplotting**: With three layers, the visual clutter ("High graphical density") makes it hard to distinguish specific values or distinct shapes of distributions on a narrow screen.
    - **Small Touch Targets**: The individual histogram bars are very thin, making it impossible to tap specific bins.
    - **Legend Space**: The side-mounted legend compresses the chart width significantly.
    - **Readable text**: Axis labels and titles are small.

## 2. High-Level Design Strategy

The core strategy is to resolve the **Overplotting** issue inherent in layered histograms on small screens. While the desktop version relies on transparency, the mobile version should offer a clearer way to compare distributions.

I plan to use a **Hybrid Layout Strategy**:
1.  **Primary View**: A **Vertical Stacked Layout (Small Multiples)**. This aligns the three distributions vertically sharing the same X-axis. This allows for instant shape comparison without occlusion.
2.  **Interaction**: A "Scrubbable" interface. Users can drag their finger across the X-axis to see the exact count values for all three trials simultaneously in a fixed data panel.

## 3. Design Actions (Mapped to Action Space)

### L0: Visualization Container
-   **Action: `Rescale`**: Set chart width to 100% of the container and adjust height to fill the available vertical space comfortably (e.g., `h-96` or `aspect-[3/4]`), discarding the fixed `300x300` desktop config.

### L1: Chart Components & Layout
-   **Action: `Serialize Layout` (Stack Panels)**: Instead of one chart with three overlapping layers, I will render three separate, synchronized charts vertically (or a clear Ridgeline-style plot). This solves the "Cluttered Density" issue.
-   **Action: `Reposition` (Legend)**: Move the legend from the right side to the top (`inline`) or use the charts' titles themselves as the legend. This reclaims horizontal space for the data.

### L2: Data Marks
-   **Action: `Rescale` (Reduce width/bin count)**: The desktop version has `maxbins: 100`. On mobile, 100 bins are too many (rendering <3px bars). I will perform data re-binning to a lower resolution (e.g., 30-40 bins) or calculate optimal bin width based on screen width to ensure bars are visible.

### L3: Axes
-   **Action: `Decimate Ticks`**: Reduce X-axis ticks to 3-5 key values (Min, 0, Max) to prevent label overlap.
-   **Action: `Recompose (Remove)` (Axis Title)**: Remove the "Count of Records" Y-axis label to save space; the distribution shape implies frequency. The X-axis title "Measurement" will be placed in the footer or subtitle.
-   **Action: `Recompose (Remove)` (Y-Axis)**: Since the exact height of the bar is hard to read on mobile, I will hide the Y-axis lines/ticks and rely on the Tooltip/Data Panel for specific numbers.

### L5: Interaction & Feedback
-   **Action: `Fix Tooltip Position`**: Instead of a floating tooltip that covers the data, I will create a "Data Stats Bar" at the bottom of the component. When the user scrubs the chart, this bar updates with the specific values for the active bin.
-   **Action: `Triggers`**: Change from Hover (Desktop) to Touch/Drag (Mobile).

## 4. Data Extraction Plan

The data is embedded in the HTML file as a JSON object under `spec.datasets`.

1.  **Raw Data Parsing**:
    -   Extract the array from `data-ba9a14f45a079c5af300d599df77bdbf`.
    -   Structure: `[{ "Trial A": number, "Trial B": number, "Trial C": number }, ...]`.

2.  **Data Transformation (Folding & Binning)**:
    -   **Flatten**: Convert the wide format to a long format: `[{ type: "Trial A", value: 0.39 }, ...]`.
    -   **Binning Logic** (Critical Step):
        -   Calculate the global Min and Max across all trials.
        -   Determine a bin step size (e.g., `(Max - Min) / 40`).
        -   Create buckets/bins.
        -   Iterate through all data points and assign them to bins.
        -   Resulting Structure for Recharts:
            ```json
            [
              { "binStart": -5.0, "binEnd": -4.5, "Trial A": 0, "Trial B": 5, "Trial C": 1 },
              { "binStart": -4.5, "binEnd": -4.0, "Trial A": 1, "Trial B": 12, "Trial C": 3 },
              ...
            ]
            ```
    -   This pre-processed data will be fed into Recharts `Bar` components.

## 5. Implementation Steps

1.  **Scaffold Component**: Create `src/components/Visualization.tsx`.
2.  **Data Logic**: Implement the `processData` function to extract, fold, and bin the raw data from the provided JSON source.
3.  **UI Shell**: Build the container with a Glassmorphism header (Title/Subtitle) and a fixed bottom Stats Panel.
4.  **Recharts Implementation**:
    -   Use `ResponsiveContainer`.
    -   Implement a custom `BarChart`.
    -   Since I planned a "Serialize Layout", I might use a Composite Chart (one X-axis, multiple Bar clusters) or actually stack separate Recharts instances. To ensure performance and alignment, a **Single Chart** with custom arranged bars or simply overlapping bars (with a toggle to isolate them) is often smoother in Recharts than syncing multiple charts.
    -   *Refined Plan*: I will implement the **Overlapping View** but add a **Segmented Control** (Tabs) to filter: "All", "Trial A", "Trial B", "Trial C". This achieves the "Serialize/Filter" goal without complex layout shifts. "All" allows overview, specific tabs allow detail.
5.  **Styling**: Apply Tailwind classes for distinct colors (Blue, Orange, Red/Pink as per original but refined palette) and typography.
6.  **Interaction**: Add `Tooltip` with `cursor={{fill: 'transparent'}}` and a custom `content` that renders null (to suppress default) but updates a React state to show data in the bottom Stats Panel.

## 6. Justification for Deviation (if any)

-   *Action Space deviation*: The Action Space suggests "Serialize Layout" (Stacking). However, purely stacking 3 histograms vertically consumes a lot of vertical height (scrolling).
-   *Proposed Solution*: **Filter Panels (Tabs)**. By adding a tab switcher, we allow the user to see the "messy" overview if they want, but easily isolate (filter) to "Trial A/B/C" to see the clean shape. This acts as a user-controlled "Recompose (Remove)" action.

## 7. JSON Data Source (For Extraction)

I will use the JSON data provided in the `<script>` tag of the source HTML: `spec.datasets['data-ba9a14f45a079c5af300d599df77bdbf']`. No fake data will be generated.