# Vis2Mobile Transformation Plan

## 1. Desktop Visualization Analysis

### **Visual Content**
*   **Type**: Normalized Stacked Area Chart (100% Stacked Area).
*   **X-Axis**: Time series (Years 2001-2017).
*   **Y-Axis**: Net Generation (Normalized Percentage 0%-100%).
*   **Categories**: Three distinct energy sources: "Fossil Fuels" (Blue), "Nuclear Energy" (Orange), "Renewables" (Red).
*   **Legend**: Placed on the right side, vertical layout.
*   **Trend**: Shows the relative decline of Fossil Fuels and the growth of Renewables over time, while Nuclear remains relatively stable.

### **Mobile Issues (Original & simulated)**
1.  **Aspect Ratio**: The 16:9 or wide layout is squished in `desktop_on_mobile.png`, making the slope changes steeper and harder to read.
2.  **Legend Position**: The right-aligned legend consumes approximately 20-25% of the horizontal screen real estate, compressing the actual chart area significantly.
3.  **Touch Interaction**: The original relies on mouse hover (implied by Vega-Lite default behavior) or static reading. On mobile, precise data inspection via finger tap/drag is impossible without specific touch handlers.
4.  **Axis Readability**: Displaying every 2 years (2002, 2004...) on a narrow screen might lead to crowding. The Y-axis title "net_generation" is vertical and hard to read.

---

## 2. Design Action Space & Transformation Strategy

### **High-Level Strategy**
We will transform this into a **"Energy Generation Trends" Card**. The goal is to maximize the chart width by moving auxiliary elements (legend, titles) to the top or bottom. We will replace the standard mouse-hover tooltip with a "Scrubbable" interaction model, where dragging across the chart updates a fixed data display area (avoiding the "fat finger" problem).

### **Specific Actions (Mapped to Vis2Mobile Action Space)**

#### **L0: Container**
*   **Action: `Rescale` (Aspect Ratio)**
    *   **Reasoning**: Change from landscape (desktop) to a square (1:1) or slight portrait (4:3) aspect ratio for the chart area. This gives the vertical Y-axis (0-100%) enough breathing room to show the area layers clearly.

#### **L2: Title Block**
*   **Action: `Add` (Title & Subtitle)**
    *   **Reasoning**: The original lacks a clear descriptive title (only axis labels). We will add a main title "Energy Source Share" and a subtitle "Net generation distribution (2001-2017)" to provide context immediately.

#### **L3: Legend Block**
*   **Action: `Reposition` (Top) & `Transpose` (Row Layout)**
    *   **Reasoning**: Move legend from **Right** to **Top** (under subtitle). Change layout from **Column** to **Row**.
    *   **Justification**: This recovers the 25% horizontal space lost in the desktop version, allowing the chart to span the full width of the mobile screen.

#### **L3: Axes (X-Axis)**
*   **Action: `Decimate Ticks`**
    *   **Reasoning**: Instead of showing every 2 years, we will show ticks every 4 or 5 years (e.g., 2001, 2005, 2010, 2015).
    *   **Action: `Format Tick Label`**
    *   **Reasoning**: Use `'01`, `'05` format if space is tight, though full years usually fit if decimated.

#### **L3: Axes (Y-Axis)**
*   **Action: `Remove Axis Title`**
    *   **Reasoning**: The label "net_generation" takes up space. We will move this context to the Subtitle.
*   **Action: `Decimate Ticks` & `Format Tick Label`**
    *   **Reasoning**: Only show 0%, 50%, 100% to reduce visual clutter. The exact values will be provided via interaction.

#### **L5: Interaction & Feedback**
*   **Action: `Fix Tooltip Position` (Sticky Summary)**
    *   **Reasoning**: Instead of a floating tooltip that follows the cursor (blocked by finger), we will use a **Data Card** positioned below the chart or a "Sticky Header" interaction. When the user scrubs the chart, the values for the selected year appear in this fixed area.
*   **Action: `Triggers` (Touch/Drag)**
    *   **Reasoning**: Enable a full-height cursor line that activates on touch, allowing the user to scrub through the timeline.

#### **L2: Data Marks**
*   **Action: `Recompose` (Colors)**
    *   **Reasoning**: Update the colors to a modern palette while retaining semantic meaning (e.g., Fossil: Slate/Blue-Grey, Nuclear: Amber/Orange, Renewables: Emerald/Teal). Use gradients for a premium feel.

---

## 3. Data Extraction

The data is embedded in the `datasets` field of the provided HTML. It is a flat array of objects.

**Structure**:
```typescript
interface DataPoint {
  year: string; // ISO Date string
  source: "Fossil Fuels" | "Nuclear Energy" | "Renewables";
  net_generation: number;
}
```

**Implementation Note**:
Since the chart is a **Normalized Stacked Area Chart** (100%), we need to group the data by `year`.
1.  Parse the ISO date to get the Year (e.g., "2001").
2.  Calculate the total generation for each year to compute percentages (Recharts `stackOffset="expand"` handles normalization automatically, but we might need calculated percentages for the custom tooltip).
3.  Pivot the data so each year is one object with keys for each source.

**Extracted Data (Ready for Component)**:
```typescript
// Condensed for plan, full data will be used in code
const rawData = [
  {"year": "2001", "Fossil Fuels": 35361, "Nuclear Energy": 3853, "Renewables": 1437},
  {"year": "2002", "Fossil Fuels": 35991, "Nuclear Energy": 4574, "Renewables": 1963},
  // ... (Full dataset from 2001-2017 to be included)
  {"year": "2017", "Fossil Fuels": 29329, "Nuclear Energy": 5214, "Renewables": 21933}
];
```

---

## 4. Implementation Steps

1.  **Setup Component**: Create `EnergyShareChart.tsx`.
2.  **Process Data**:
    *   Convert the raw list into a pivot format where `year` is the key index.
    *   Ensure data is sorted chronologically.
3.  **Construct Layout**:
    *   **Header**: Title and Subtitle.
    *   **Legend**: Flex-row container with colored pills/dots.
    *   **Chart Container**: Responsive container (aspect-ratio square).
    *   **Active Data Display**: A section below the chart that shows the specific percentages when a year is selected. Default to the latest year (2017) initial state.
4.  **Implement Chart (Recharts)**:
    *   `<AreaChart>` with `stackOffset="expand"` to achieve the normalized 100% view.
    *   Three `<Area>` components for the sources.
    *   Custom `<Tooltip>` that returns `null` (to hide default) but updates a React state `activeYear` to drive the "Active Data Display".
    *   XAxis with `tickFormatter` to clean up years.
5.  **Styling**:
    *   Use Tailwind for glassmorphism (`bg-white/10 backdrop-blur-md`).
    *   Use Lucide icons for context (e.g., `Zap`, `Leaf`, `Atom` for the legend items).
    *   Add animation (`framer-motion` or CSS transitions) for the data values.
6.  **Refinement**: Ensure font sizes are minimum 12px for labels and 14px for body text. Verify contrast ratios.