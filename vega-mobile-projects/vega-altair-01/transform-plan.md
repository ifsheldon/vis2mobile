# Plan for Transforming Small Multiples Area Chart to Mobile

## 1. Visualization Analysis

### Original Desktop Visualization
- **Type**: Faceted Area Charts (Small Multiples).
- **Structure**: 4 rows (MSFT, AAPL, IBM, AMZN), sharing a common X-axis (Date). Note: The HTML data also contains GOOG, but the spec filters it out `(datum.symbol !== 'GOOG')`. I will check if I should include it or strictly follow the visual output. The prompt asks to transform the *visualizations in the file*. The rendered image excludes GOOG, but the file includes it. I will stick to the rendered output (4 symbols) to preserve the original visual intent, but perhaps offer GOOG as a hidden option or just filter it out to match the `desktop.png`.
- **Encoding**:
    - **X**: Temporal (Year 2000-2010).
    - **Y**: Quantitative (Price).
    - **Color**: Nominal (Symbol).
- **Layout**: Vertical stack, but with Y-axis labels (Symbol names) rotated 90 degrees on the left, which is hard to read.
- **Interaction**: Likely synchronized hovering (desktop).

### Mobile Adaptability Issues (Desktop-on-Mobile)
1.  **Aspect Ratio**: The "squashed" view makes the price fluctuations hard to read (too flat).
2.  **Typography**: The rotated Y-axis labels ("MSFT", "AAPL", etc.) are tiny and require head-tilting.
3.  **Touch Targets**: Hover interaction does not exist on mobile; precise tapping on a specific month is hard.
4.  **Density**: Stacking 4 charts in a single viewport height compresses the data ink too much.

## 2. High-Level Design Plan

To create a "Premium Mobile-First" experience, I will transform the single static dashboard into a **Scrollable Feed of Cards**.

1.  **Layout Strategy**: Instead of trying to fit all 4 charts into one screen height (`Rescale`), I will use **`Serialize Layout`** (L1 Chart Component). Each stock symbol will get its own "Card". The user will scroll vertically to compare them.
2.  **Card Design**: Each card will contain:
    -   **Header**: The Symbol name and current/max price (Solving the rotated label issue).
    -   **Chart**: A dedicated Area Chart with increased height for better data resolution.
3.  **Interaction**:
    -   Replace global hover with **`Touch/Drag`** on individual charts.
    -   Use a **`Fixed Tooltip/Overlay`** (L5 Feedback) inside the card header to display the specific date/price when the user drags their finger, preventing the finger from covering the data.

## 3. Design Action Space Mapping

Based on `mobile-vis-design-action-space.md`, here are the specific actions:

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | `Rescale` | Set container width to 100% and height to `auto` (scrollable) to fit mobile width. |
| **L1** | **Chart Components** | `Serialize Layout` | Keep the vertical stacking but decouple them into distinct "Cards" with padding/margin. |
| **L2** | **Title Block** | `Reposition` | Move the Symbol Name (MSFT, etc.) from the Y-Axis (rotated 90deg) to the top-left of each card (horizontal). |
| **L3** | **Axes** | `Recompose (Remove)` | Remove Y-Axis lines and ticks (`L4 AxisLine`, `L4 Ticks`). Rely on the chart shape and the interactive tooltip for value reading. |
| **L3** | **Axes** | `Decimate Ticks` | Reduce X-Axis ticks to show only key years (e.g., '00, '05, '10) to prevent clutter (`Cluttered text`). |
| **L4** | **Tick Labels** | `Format Tick Label` | Shorten years (2000 -> '00) for cleaner aesthetics. |
| **L2** | **Features** | `Disable Hover` / `Enable Touch` | Use Recharts `activeDot` and `Tooltip` triggered by touch/drag. |
| **L2** | **Feedback** | `Reposition (Fix)` | Move the tooltip content (Price/Date) into the Card Header (dynamic data display) so the user's finger doesn't block it. |
| **L2** | **Data Marks** | `Rescale` | Increase the height of the Area mark relative to the screen width to emphasize the trend. |
| **L2** | **Emphases** | `Recompose (Change Encoding)` | Use Gradients (fill) instead of flat colors to achieve the "Premium" look. |

## 4. Data Extraction Strategy

The data is embedded directly in the HTML file in the `datasets` object.

1.  **Source**: `datasets["data-b0fe595546d47c5085f225c35730172c"]`.
2.  **Processing**:
    -   The data is a flat array: `[{"symbol": "MSFT", "date": "2000-01-01...", "price": 39.81}, ...]`.
    -   I will copy this array into a constant file.
    -   **Transformation**: The app will need to `groupBy` symbol to render the 4 separate charts.
    -   **Filter**: Apply `(datum.symbol !== 'GOOG')` as per the original Vega-Lite spec to match the desktop image.

## 5. Implementation Steps

1.  **Setup Component Structure**:
    -   Create `src/components/Visualization.tsx` as the main entry.
    -   Create a sub-component `StockCard.tsx` to handle individual charts.
2.  **Data Ingestion**:
    -   Extract the JSON data.
    -   Parse the date strings into JS Date objects or formatted strings for Recharts.
    -   Group data by `symbol`.
3.  **UI Layout Implementation (Tailwind)**:
    -   Create a main container with a dark/glassmorphism background.
    -   Map through the grouped data (MSFT, AAPL, IBM, AMZN).
    -   Render a `StockCard` for each.
4.  **Chart Implementation (Recharts)**:
    -   Use `ResponsiveContainer` -> `AreaChart` -> `Area`.
    -   Define `<defs>` for linear gradients corresponding to the stock colors (MSFT: Teal, AAPL: Blue, IBM: Red, AMZN: Orange).
    -   Configure `XAxis` with `tickFormatter` (formatting '00, '02, etc.) and `interval="preserveStartEnd"`.
    -   Hide `YAxis` but keep the domain `auto` or calculated based on min/max to fill the area nicely.
5.  **Interaction & Polish**:
    -   Implement a Custom Tooltip that doesn't render a floating box but instead updates a state in the `StockCard` to show the "Active Price" in the header.
    -   Add animation (Recharts `animationDuration`).
    -   Ensure typography uses a legible, modern sans-serif font.