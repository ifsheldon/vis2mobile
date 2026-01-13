# Mobile Visualization Plan: Seattle Temperature Ranges

## 1. Analysis of Original Visualization

- **Type**: Horizontal Range Bar Chart (floating bars).
- **Data**: Daily weather records from 2012-2015 aggregated by month.
- **Dimensions**:
    - **Y-Axis**: Nominal (Months, Jan-Dec).
    - **X-Axis**: Quantitative (Temperature in °C).
- **Encodings**:
    - Bar Start (`x`): Minimum of `temp_min` for that month.
    - Bar End (`x2`): Maximum of `temp_max` for that month.
    - Labels: Text values positioned to the left and right of the bars representing the min and max values respectively.
- **Desktop vs. Mobile Issues**:
    - The desktop view is wide, allowing ample space for the bar length and side labels.
    - Simply squashing this into a mobile aspect ratio (`desktop_on_mobile.png`) compresses the horizontal scale, making it difficult to distinguish the length differences. The text labels might overlap with the Y-axis or the screen edges.
    - The X-axis (gridlines and ticks) adds visual noise that becomes cluttered on a narrow screen.

## 2. Design Action Space & Reasoning

Based on the `mobile-vis-design-action-space.md`, here is the transformation plan:

### **L0: Visualization Container**
- **Action: `Rescale` (Fit Width, fluid height)**
    - **Reasoning**: The chart must occupy 100% of the mobile width (`350px-400px`). We will allow the height to be determined by the content (12 rows for months) to ensure touch targets are large enough, rather than fixing the aspect ratio.
- **Action: `Reposition` (Padding)**
    - **Reasoning**: Crucial to prevent the "Left/Right" text labels from being cut off by the screen edges. We need significant internal padding on the chart container.

### **L1: Data Model**
- **Action: `Recompose (Aggregate)`**
    - **Reasoning**: The raw data provides daily records. We must aggregate this in the code to calculate the `min(temp_min)` and `max(temp_max)` grouped by month to drive the range bars, preserving the original intent.

### **L3/L4: Coordinate System (Axes)**
- **Action: `Recompose (Remove)` (Remove X-Axis)**
    - **Reasoning**: The desktop version uses direct labeling (numbers next to bars). On mobile, vertical space is premium. Since we display exact numbers on the bars, the bottom X-axis and vertical gridlines are redundant visual noise. We will remove them to focus on the data marks.
- **Action: `Simplify labels` (Y-Axis)**
    - **Reasoning**: Use standard 3-letter abbreviations (Jan, Feb) which are already present, but ensure the font size is legible (approx 12-14px).

### **L2/L4: Data Marks & Labels**
- **Action: `Rescale` (Bar Height)**
    - **Reasoning**: Increase bar thickness (or hit area) to ~24px-32px to look "premium" and modern, departing from the thin bars of the original.
- **Action: `Reposition` (Labels)**
    - **Reasoning**:
        - The desktop version places labels strictly outside.
        - **Plan**: We will attempt to keep labels outside to preserve the "range" aesthetic. If the bar is extremely wide (close to edges), we might need conditional logic, but given the range (-7 to 35) relative to the domain (-15 to 45), outside labels should fit if we apply the `L0 Reposition` padding correctly.
- **Action: `Change Encoding` (Color)**
    - **Reasoning**: The original uses a flat blue. To achieve "Premium Aesthetics," we will use a **horizontal linear gradient** based on the temperature value (e.g., cooler teal to warmer blue/orange) to reinforce the temperature context visually.

### **L2: Interaction (Interaction Layer)**
- **Action: `Recompose (Remove)` (Disable Hover)**
    - **Reasoning**: Hover effects don't work on mobile.
- **Action: `Feedback (Fix Tooltip Position)` -> `Triggers (Click)`**
    - **Reasoning**: Instead of a floating tooltip, tapping a bar (or the row) could trigger a slight visual emphasis (opacity change) or a "Toast/Popover" showing the precise range (e.g., "January: -4.4°C to 17.2°C"). However, since direct labels are always visible, interaction is secondary and mainly for "delight" (haptic feedback or highlighting).

## 3. Data Extraction Plan

I will extract the raw JSON data from the `datasets` object in the provided HTML.
1.  **Parsing**: Parse the `data-9cda1fa0376fcdc5d69536fab26b0d0b` array.
2.  **Processing**:
    - Iterate through all records.
    - Parse `date` to extract the Month index (0-11).
    - Group by Month.
    - For each month, find `Math.min(...temp_min)` and `Math.max(...temp_max)`.
    - Resulting Data Structure:
      ```typescript
      interface MonthlyWeather {
        month: string; // "Jan", "Feb"...
        minTemp: number;
        maxTemp: number;
      }
      ```
3.  **Validation**: Verify against the desktop image (Jan should be approx -4.4 to 17.2).

## 4. Implementation Steps

1.  **Setup**: Initialize `src/components/Visualization.tsx`.
2.  **Data Processing**: Implement the aggregation logic inside the component using `useMemo`.
3.  **UI Layout**:
    - Create a Card container with Tailwind styling (rounded-xl, shadow-sm, glassmorphism border).
    - Header: Title "Temperature Variation" and Subtitle "Seattle Weather (2012-2015)".
4.  **Chart Construction (Recharts)**:
    - Use `BarChart` with `layout="vertical"`.
    - **Trick for Range Bars**: Since Recharts doesn't have a native "RangeBar" primitive that is easy to style with gradients in a vertical layout, I will use a **Stacked Bar** approach:
        - Stack 1: `[minTemp - domainMin]` (Transparent/Invisible bar acting as offset).
        - Stack 2: `[maxTemp - minTemp]` (The actual visible bar).
    - **X-Axis**: Set domain manually `['auto', 'auto']` or specific values (e.g., -15 to 45) to ensure bars don't hit the absolute edge. Hide axis line and ticks.
    - **Y-Axis**: Show month labels.
    - **Labels**: Use Recharts `<LabelList />` or custom `content` on the visible bar to render the Min value (at the start of the bar) and Max value (at the end of the bar).
5.  **Styling**:
    - Apply a linear gradient definition in SVG `<defs>` for the bars.
    - Use Lucide icons for context (e.g., a small thermometer icon in the header).
    - Ensure fonts are `text-sm` or `text-xs` for labels but high contrast.

## 5. Mobile Readability Assurance

- **Font Size**: Labels will be set to at least 12px.
- **Contrast**: Text color will be Slate-600/800 for readability against a white/light-gray background.
- **Spacing**: The chart height will be calculated as `60px * 12 months` (approx 720px) or slightly condensed to ensure it fits comfortably in a scroll view, avoiding the "squashed" look of the `desktop_on_mobile.png`. Vertical scrolling is acceptable and preferred over squashing. *Correction*: The original is quite simple, 12 bars can likely fit in `500px` height without scrolling while maintaining touch target size. I will aim for a `aspect-ratio` closer to 3:4 or 9:16 vertical.