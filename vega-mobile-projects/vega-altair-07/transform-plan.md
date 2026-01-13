# Plan for Transforming "Bar Chart with Negatives" to Mobile

## 1. Analysis of Original Visualization
- **Type**: Vertical Bar Chart (Time-Series).
- **Data**: Monthly "Non-farm Employment Change" from 2006 to 2015 (~120 data points).
- **Encoding**:
    - **X-Axis**: Time (Month).
    - **Y-Axis**: Quantitative Change (`nonfarm_change`).
    - **Color**: Conditional. `steelblue` for positive values (> 0), `orange` for negative values (<= 0).
- **Context**: Economic data highlighting the 2008 financial crisis (deep orange bars).
- **Mobile Issues (`desktop_on_mobile.png`)**:
    - **Overplotting**: ~120 bars squeezed into a mobile width results in bars that are 1-2 pixels wide.
    - **Untappable**: Impossible to select specific months via touch.
    - **Unreadable Labels**: X-axis labels are likely illegible or skipped to the point of ambiguity.
    - **Aspect Ratio**: The 1:1 square config in the original spec wastes vertical space on mobile and compresses horizontal space.

## 2. Design Action Space Analysis

Based on `mobile-vis-design-action-space.md`, here is the reasoning for the transformation:

### L0: Visualization Container
- **Action**: `Rescale` (Match width to 100%, Height auto).
- **Action**: `Reposition` (Remove large margins).
- **Reasoning**: The desktop fixed width (600px) and padding must be replaced by a responsive container.

### L1: Data Model
- **Action**: `Recompose (Aggregate)` -> **REJECTED**.
    - *Reasoning*: Aggregating to "Years" would hide the specific volatility of the 2008 crash and recovery months. We must preserve monthly granularity.
- **Action**: **(New Action) Scrollable Viewport**.
    - *Reasoning*: Since we cannot fit 120 bars legibly on a mobile screen, we will keep the monthly granularity but make the chart **horizontally scrollable**. This allows each bar to have a sufficient touch target width (e.g., 12-16px).

### L2: Coordinate System & Marks
- **Action**: `Transpose (Axis-Transpose)` -> **REJECTED**.
    - *Reasoning*: For time-series data, horizontal scrolling (Time on X-axis) is more intuitive than a vertical list of 120 bars.
- **Action**: `Recompose (Change Encoding)` -> **Keep**.
    - *Reasoning*: The conditional coloring (Blue/Orange) is the core narrative element (Growth vs. Recession). We will preserve this.

### L3/L4: Axes & Ticks
- **Action**: `Decimate Ticks` / `formatTickLabel`.
    - *Reasoning*: On mobile, we cannot show every month. We should show Year ticks (e.g., "2008", "2009") on the scrollable axis to provide context without clutter.
- **Action**: `Recompose (Remove)` Axis Titles.
    - *Reasoning*: The title/subtitle will explain the metric. Axis titles take up valuable pixels.

### L5: Interaction & Feedback
- **Action**: `Recompose (Replace)` Hover with Click/Touch.
    - *Reasoning*: Mobile users cannot hover.
- **Action**: `Reposition (Fix)` Tooltip.
    - *Reasoning*: A floating tooltip near the finger is obstructed by the hand. We will implement a **"Fixed Detail Card"** (Header) that updates when a user scrubs or taps a bar.

## 3. Data Extraction Plan

The data is embedded in the HTML within the `var spec` JSON object.

1.  **Locate Data**: Inside `spec.datasets['data-47b635ed2eb04c99c31d7dc9bd6ff69f']`.
2.  **Fields to Extract**:
    -   `month`: Parse ISO string `"2006-01-01T00:00:00"` to JS Date object.
    -   `nonfarm_change`: The primary metric for the bars.
    -   *Secondary Data*: The dataset includes breakdown fields (`private`, `government`, `goods_producing`, `service_providing`). While the original chart only plotted `nonfarm_change`, the **Premium** mobile experience will expose these details in the "Fixed Detail Card" upon selection, adding value without cluttering the chart.
3.  **Color Logic**:
    -   If `nonfarm_change > 0`: Color = Blue (`#3b82f6` - Tailwind blue-500).
    -   If `nonfarm_change <= 0`: Color = Orange (`#f97316` - Tailwind orange-500).

## 4. Implementation Steps

### Step 1: Component Layout (Premium Aesthetic)
-   Create a main container with a glassmorphism header (`Fixed Detail Card`) and a scrollable chart area below.
-   **Header**: Displays the currently selected date (e.g., "Oct 2008") and the value with a large font.
-   **Sub-header**: Show a mini breakdown (Private vs. Gov) if available, or just a trend indicator (Up/Down arrow).

### Step 2: The Chart (Recharts)
-   Use `<BarChart>` inside a `ResponsiveContainer`.
-   **Crucial for Mobile**: Wrap the `ResponsiveContainer` in a `div` with `overflow-x-auto` and set the inner chart width dynamically: `width = data.length * BAR_WIDTH` (e.g., 120 * 12px = ~1440px). This forces the scroll interaction.
-   **X-Axis**:
    -   `dataKey="month"`.
    -   `tickFormatter`: Format as "YYYY".
    -   `interval`: "preserveStartEnd" or manual calculation to show 1 tick per year.
-   **Y-Axis**:
    -   `width={40}` (save space).
    -   `tickFormatter`: Shorten numbers (e.g., "200k").
-   **Reference Line**: Add a distinct line at `y={0}` to separate growth/decline visually.
-   **Bars**:
    -   Use `<Cell />` within the Bar component to assign colors based on the value (Blue vs Orange).
    -   Add `radius={[4, 4, 0, 0]}` for positive and `radius={[0, 0, 4, 4]}` for negative bars for a polished look.

### Step 3: Interaction Implementation
-   **State**: `activeIndex` (default to the last data point or the most significant dip, e.g., late 2008).
-   **Event**: `onClick` on the `<Bar>` updates `activeIndex`.
-   **Visual Feedback**: The selected bar gets a distinct `opacity` or a contrasting `stroke` (highlighter).

### Step 4: Formatting & Typography
-   Use `Intl.NumberFormat` for currency/number formatting.
-   Use `date-fns` for concise date labels.
-   Apply Tailwind classes for typography: `text-xs` for axes, `text-2xl` for the focused value in the header.

### Step 5: Legends
-   Instead of a traditional legend, color the text in the Header (e.g., if negative, the value text is orange). This acts as an implicit legend (`Compensate (Toggle)`).