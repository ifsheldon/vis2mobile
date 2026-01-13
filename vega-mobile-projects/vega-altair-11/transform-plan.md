# Vis2Mobile Transformation Plan

## 1. Data Extraction

Based on the provided HTML source code, the data is embedded within the `vega-lite` specification JSON.

**Extracted Dataset:**
```json
[
  { "task": "A", "start": 1, "end": 3 },
  { "task": "B", "start": 3, "end": 8 },
  { "task": "C", "start": 8, "end": 10 }
]
```

**Meta-data:**
- **X-Axis Domain:** 0 to 10 (Derived from min 0 and max 10 in data/spec).
- **Y-Axis Categories:** "A", "B", "C".
- **Chart Type:** Gantt Chart (Interval Bar Chart).

---

## 2. High-Level Design Logic & Action Space Analysis

The original desktop visualization is a simple, clean Gantt chart. On mobile, the aspect ratio changes from landscape to portrait (or narrow landscape). While the dataset is small (3 items), a premium mobile component must handle the layout robustly.

### Selected Actions from Design Space

#### **L0: Visualization Container**
*   **Action: `Rescale`**: The container must adapt to `width: 100%` of the mobile device. We will set a fixed height that is comfortable for scrolling if the list grows, or auto-height to fit the content.
*   **Action: `Reposition`**: Add global padding to ensure the chart doesn't touch the screen edges, creating a "Card" aesthetic.

#### **L1: Chart Components (Layout)**
*   **Rationale for Layout**: We will retain the **Horizontal Bar** structure (Tasks on Y, Time on X). Vertical bars (Transpose) would imply a Histogram or Time-series magnitude, which is incorrect for a Gantt timeline.
*   **Action: `Serialize layout` (Modified)**: Instead of strictly separating axis labels from bars, we will integrate them closer.

#### **L2: Data Marks (Bars)**
*   **Action: `Rescale (Mark Instance)`**: The bars in the desktop version are relatively thin. On mobile, bars need to be **thicker (greater height)** to serve as comfortable touch targets.
*   **Action: `Recompose (Change Encoding)`**: The original uses a single flat color. We will use a gradient or a distinct primary color with rounded corners (`radius`) to add a "Premium" feel.

#### **L3: Axes**
*   **Action: `Recompose (Remove)` (Axis Line)**: We will remove the Y-axis vertical line to reduce visual noise.
*   **Action: `Reposition` (Axis Labels)**: 
    *   *Desktop:* Labels (A, B, C) are to the left of the axis.
    *   *Mobile Strategy:* If labels are short (like A, B, C), keep them on the left but ensure sufficient `margin`. If we anticipate longer text, we would move the label *above* the bar. For this specific data, Left-aligned Y-axis is safe, but we will increase the font size.

#### **L3: Gridlines**
*   **Action: `Recompose (Remove)`**: Remove horizontal gridlines. Keep vertical gridlines distinct but subtle (dashed) to help read the Start/End times without dominating the view.

#### **L5: Interaction (Tooltip)**
*   **Action: `Fix Tooltip Position` (or Replace with Click)**: Hover doesn't exist on mobile. We will implement a `CustomTooltip` that appears on click or tap, styled as a floating glassmorphism card, or simply render the start/end values directly inside/next to the bars if space permits.
*   **Action: `Feedback`**: Add active state (opacity change) when touching a bar.

---

## 3. Detailed Implementation Steps

### Step 1: Component Structure & Setup
- Create `src/components/Visualization.tsx`.
- Use `ResponsiveContainer` from Recharts to handle the L0 Rescale action.
- Wrap the chart in a `Card` component with Tailwind styling for glassmorphism (backdrop-blur, border-white/10).

### Step 2: Data Transformation for Recharts
- Recharts `BarChart` with `layout="vertical"` is best for Gantt charts.
- **Data Engineering**: Recharts works best with `[min, max]` ranges for floating bars.
    - Transform input data: 
      ```javascript
      const data = [
        { name: 'A', range: [1, 3], duration: 2 },
        // ...
      ];
      ```
- **Fallback Strategy**: If specific Recharts version struggles with `range` array in `dataKey`, use the "Transparent Stack" method:
    - Series 1 (Transparent): Value = `start`
    - Series 2 (Visible): Value = `end - start` (Duration)
    - Stack them.
    - *Decision*: We will use the `[start, end]` range method if supported, or the transparent stack method as it is most reliable across versions. Let's use the **Transparent Stack** method for maximum compatibility and animation control.

### Step 3: Visual Styling (Premium Aesthetics)
- **Palette**: Use a deep blue/indigo theme (`bg-slate-950` background) with bright accent bars (`fill-indigo-500` to `fill-purple-500`).
- **Typography**: Use large, readable fonts for the Y-axis (Task Names).
- **Glassmorphism**: The container will have a semi-transparent background and a subtle border.

### Step 4: Axis & Grid Configuration
- **XAxis**: Type `number`. Hide axis line. Show ticks.
- **YAxis**: Type `category`. DataKey "task". Remove axis line. Increase tick font size.
- **CartesianGrid**: Vertical only (`horizontal={false}`). Stroke dasharray `3 3`. Opacity 0.2.

### Step 5: Interaction & Mobile UX
- **Custom Tooltip**: Create a React component that renders the specific details (Task Name, Start Time, End Time, Duration) clearly.
- **Touch Areas**: Ensure `barSize` is at least 32px or 40px.

### Step 6: Code Implementation Plan

1.  **Imports**: Next.js, Recharts (`BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `Cell`), Lucide icons.
2.  **Data Prop**: Hardcode the extracted data into the component.
3.  **Render**:
    -   Container `div` with `h-[50vh]` or fixed aspect ratio.
    -   `BarChart` with `layout="vertical"`.
    -   **Invisible Bar**: `dataKey="start"` (fill="transparent").
    -   **Visible Bar**: `dataKey="duration"` (calculated as `end - start`). Apply `radius={[0, 4, 4, 0]}` for rounded ends.
4.  **Polish**: Add a title and descriptive header using Tailwind.

### Step 7: Linting & formatting
- Run `bunx biome check --apply .` to ensure code quality.

## 4. Mobile Readability Assurance
- **Font Size**: Axis ticks will be set to `12px` minimum (Tailwind `text-xs` or `text-sm`).
- **Contrast**: High contrast text (white/gray-200) against dark background.
- **Spacing**: Adequate gap between the Y-axis labels and the start of the chart area.

This plan transforms a basic static SVG into a touch-friendly, interactive React component that fits modern mobile design standards.