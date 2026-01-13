# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Multi-series Line Chart (resembling a Ridge Plot/Joy Plot due to the upward trend).
- **Data**: CO2 concentration (ppm) from 1958 to ~2020.
- **X-Axis**: "Year into Decade" (0 to 10). This aligns the seasonal cycles of different decades for comparison.
- **Y-Axis**: CO2 concentration (310 - 420 ppm).
- **Encoding**:
    - **Color**: Represents the Decade (Magma color scheme: purple → orange).
    - **Lines**: Each line represents a decade of data.
- **Annotations**: Text labels at the start and end of each line indicating the year (e.g., "1960", "2019").
- **Narrative**: Shows two distinct patterns: the seasonal oscillation (sawtooth) and the long-term rising trend (vertical stacking).

### Mobile Version Issues (Simulated)
- **Aspect Ratio Distortion**: Compressing the wide "sawtooth" waves into a narrow mobile screen turns the gentle curves into jagged, noisy spikes.
- **Overplotting**: The lines and labels crowd together. The text annotations ("1960", "2020") overlap with the data lines and each other.
- **Unreadable Axes**: The Y-axis on the left consumes ~15% of the screen width. The X-axis labels are likely too dense.
- **Lack of Interaction**: Static images on mobile deny the user the ability to inspect specific values, which is critical when lines are close together.

---

## 2. Vis2Mobile Design Action Plan

Based on the **Vis2Mobile Design Action Space**, here is the strategy to transform this into a premium mobile component.

### L0: Visualization Container
*   **Action: `Rescale` (Aspect Ratio)**: Instead of maintaining the desktop's wide aspect ratio, we will significantly increase the height.
    *   *Reasoning*: The "sawtooth" pattern requires horizontal width to be readable. Since we cannot widen the phone screen, we must increase the vertical space to prevent the lines from looking flat or compressed. A taller chart (e.g., `h-[500px]` or `h-[60vh]`) allows the vertical rise of CO2 levels to be distinct.
*   **Action: `Reposition`**: Remove default browser margins and maximize width.

### L1: Data Model
*   **Action: `Recompose (Transform)`**: We will strictly adhere to the logic in the original Vega spec:
    *   Calculate `scaled_date = (year % 10) + (month / 12)`.
    *   Group data by `decade`.
    *   *Refinement*: To ensure smooth rendering in Recharts, we will "bin" the data into 120 points (10 years * 12 months) so that the x-coordinates align perfectly across all series.

### L3: Axes (Coordinate System)
*   **Action: `Recompose (Remove)` - Y-Axis Line & Ticks**:
    *   *Reasoning*: The Y-axis title "CO2 concentration in ppm" and the axis line take up horizontal space.
    *   *Alternative*: We will move the unit description to the **Subtitle** and use **Gridlines** or a **Touch Tooltip** to communicate values.
*   **Action: `Recompose (Remove)` - X-Axis Title**:
    *   *Reasoning*: "Year into Decade" is intuitive when the labels are "0", "5", "10". The title is redundant clutter on mobile.
*   **Action: `Adjust Ticks` - X-Axis**:
    *   *Reasoning*: Reduce tick count to 3 or 5 (e.g., 0, 5, 10) to avoid crowding.

### L2: Data Marks (Lines)
*   **Action: `Rescale`**: Ensure line stroke width is appropriate for mobile (e.g., `strokeWidth={2}`).
*   **Action: `Color Encoding`**: Retain the "Magma" gradient. It is aesthetically pleasing and effectively communicates the passage of time (Dark Purple = Old, Bright Orange = New).

### L2: Annotations (Labels)
*   **Action: `Recompose (Remove)`**: Remove the inline text labels ("1960", "1969") from the lines.
    *   *Reasoning*: On mobile, these cause severe occlusion.
*   **Action: `Compensate (Legend/Tooltip)`**:
    *   Use a **Custom Tooltip** that activates on touch. When dragging across the chart, the tooltip will show the exact Year, Month, and CO2 ppm.
    *   Add a simplified **Legend** at the top or bottom using color dots to indicate which color corresponds to which decade range.

### L1: Interaction Layer
*   **Action: `Features` (Scrubbing)**: Implement a "Scrubbable" interface.
    *   *Reasoning*: Fingers are thick ("Fat-finger problem"). A vertical cursor that snaps to the nearest month allows precise reading of the data.
*   **Action: `Feedback` (Fixed Tooltip)**:
    *   Instead of a floating tooltip that might be covered by a finger, use a **Fixed Information Block** at the top of the chart that updates dynamically as the user scrubs.

---

## 3. Data Extraction Plan

The data is hosted at a public URL. We will fetch and process it in the component.

**Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/co2-concentration.csv`

**Processing Logic (TypeScript)**:
1.  **Fetch**: `fetch(url)` and parse CSV.
2.  **Transform**:
    *   Parse `Date` column.
    *   Extract `year` and `month` (0-11).
    *   Calculate `decade = Math.floor(year / 10) * 10`.
    *   Calculate `scaled_date = (year % 10) + (month / 12)`.
    *   Keep `CO2` value.
3.  **Pivot for Recharts**:
    *   Create an array of 120 objects (representing 0 to 120 months in a decade).
    *   Each object key: `monthIndex` (0-119).
    *   Each object values: `scaled_date`, plus keys for each decade (e.g., `d1960`, `d1970`...) containing the CO2 value.
    *   This structure allows drawing multiple lines on a single X-axis in Recharts.

---

## 4. Implementation Steps

1.  **Setup Component**: Create `src/components/Visualization.tsx`.
2.  **Data Fetching Hook**: Implement a `useEffect` to fetch CSV, parse it (using `d3-dsv` or simple string splitting), and apply the transformation logic described above.
3.  **Layout Structure**:
    *   Header: Title ("CO2 Atmosphere Trends") and dynamic Subtitle (showing active data point or static units).
    *   Main Chart Area: `ResponsiveContainer` wrapping a Recharts `LineChart`.
4.  **Chart Configuration**:
    *   **XAxis**: `dataKey="scaled_date"`, `type="number"`, `domain={[0, 10]}`, `tickCount={6}`. Hide axis line.
    *   **YAxis**: `domain={['auto', 'auto']}` or specific range `[310, 425]`. Hide axis line and ticks. Width 0.
    *   **Lines**: Map through the decades (1950s-2020s). Render a `<Line />` for each.
        *   `type="monotone"` for smoothness.
        *   `dot={false}` to reduce noise.
        *   `stroke`: Map decade to a color palette (mimic Magma: `#3d0342` to `#fca67d`).
    *   **Tooltip**: Use `content={<CustomTooltip />}`. Design it with Glassmorphism (blur backdrop, border).
5.  **Styling (Tailwind)**:
    *   Background: Clean white or very light gray to contrast with the colorful lines.
    *   Typography: `font-sans`, bold headers, subtle gray texts for sub-info.
    *   Animation: Add simple entry animation for the lines.
6.  **Review**: Check touch responsiveness and label readability. Ensure the "Sawtooth" oscillation is visible.