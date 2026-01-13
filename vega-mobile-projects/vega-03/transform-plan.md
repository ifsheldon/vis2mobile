# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization & Mobile Constraints

### Original Desktop Visualization
- **Type**: Interactive Multi-Line Chart (Indexed Time Series).
- **Core Functionality**: Shows stock return percentages normalized to a specific "Index Date" (indicated by a vertical red line). As the mouse moves (changing the Index Date), the curves recalculate.
- **Data**: Stock prices for AAPL, AMZN, GOOG, IBM, MSFT over time.
- **Visual Encodings**:
    - **X-axis**: Time (2000-2010).
    - **Y-axis**: Percentage Return (indexed).
    - **Color**: Nominal scale for Company.
    - **Direct Labeling**: Stock symbols placed at the end of lines.
    - **Reference Line**: Red vertical line for the normalization date; Black horizontal line for 0% baseline.

### Mobile Constraints & Issues (Desktop-on-Mobile)
1.  **Interaction Conflict**: The "hover to change Index Date" mechanic is hostile to touch devices (no hover state). Dragging across the chart might conflict with page scrolling.
2.  **Readability**:
    - Direct labels at the line ends (e.g., "AAPL") will likely overlap or be cut off in a portrait view.
    - Y-axis percentage labels might be too small.
    - The aspect ratio (wide and short) makes lines flattened, hiding volatility nuances.
3.  **Touch Targets**: Selecting a specific date by tapping a thin line is difficult (Fat-finger problem).

## 2. Design Actions & Reasoning

Based on the **Vis2Mobile Design Action Space**, I plan the following actions:

### **L0 Visualization Container**
- **Action**: `Rescale` & `Reposition`
    - **Reasoning**: The layout must change from landscape to portrait (e.g., aspect ratio 3:4 or 1:1) to maximize vertical screen real estate.
    - **Implementation**: Set `width: 100%` and a fixed height (e.g., `h-96` or `h-[500px]`) in Tailwind.

### **L1 Interaction Layer (Crucial)**
- **Action**: `Recompose (Replace)` (Triggers)
    - **Reasoning**: Replace `hover` trigger for the "Index Date" with a dedicated **Slider Control** or a "Touch and Drag" active state. This separates the "viewing" action from the "modifying baseline" action.
- **Action**: `Reposition (Fix)` (Feedback)
    - **Reasoning**: Instead of a floating tooltip that might be covered by a finger, use a **Fixed Data Card** (Glassmorphism style) at the top or bottom of the chart to display the values for the currently selected date.

### **L2/L3 Chart Components**
- **Action**: `L3 Title (Main)` -> `Reposition`
    - **Reasoning**: Move the title "Stock Returns vs Index Date" out of the chart area into a clean HTML header `<div>`.
- **Action**: `L4 MarkLabel` -> `Recompose (Remove)`
    - **Reasoning**: Direct text labels at the end of lines ("AAPL", "MSFT") are prone to clutter on mobile.
    - **Replacement**: Use a **Legend** at the bottom or a color-coded **Header** in the Data Card.

### **L3/L4 Axes & Ticks**
- **Action**: `L5 TickLabel` -> `Simplify labels`
    - **Reasoning**: Full dates (e.g., "Jan 2005") take too much space.
    - **Implementation**: Format X-axis to show only Years (e.g., "'05", "'06") or sparse "Month Year" depending on zoom.
- **Action**: `L4 Gridlines` -> `Recompose (Remove)`
    - **Reasoning**: Reduce visual noise. Keep only the `y=0` baseline (essential for positive/negative returns).

### **L2 Data Marks**
- **Action**: `Rescale` (Stroke Width)
    - **Reasoning**: Increase line thickness slightly (e.g., 2px to 3px) for better visibility against a mobile background.

## 3. Implementation Steps

### Step 1: Data Extraction & Processing
1.  Parse the CSV data source provided in the original spec URL (`https://vega.github.io/editor/data/stocks.csv`).
2.  Create a TypeScript interface for the data structure: `{ symbol: string, date: string, price: number }`.
3.  Implement the **normalization logic** in React:
    - State: `selectedIndexDate`.
    - Memoized Calculation: Group data by Symbol. Find the price of each symbol at `selectedIndexDate`.
    - Formula: `indexed_price = (current_price - baseline_price) / baseline_price`.

### Step 2: Component Architecture (Next.js + Tailwind)
1.  **Container**: A card wrapper with modern shadow and rounded corners.
2.  **Header**: Title and Subtitle explaining the interaction ("Drag slider to compare returns").
3.  **Visualization Area**:
    - `Recharts` `<ResponsiveContainer>` and `<LineChart>`.
    - `<ReferenceLine y={0} />` (Black baseline).
    - `<ReferenceLine x={indexDate} />` (Red interactive line).
    - `<Line />` components for each stock.
4.  **Controls Area (Bottom)**:
    - A custom **Slider** (using standard HTML range input or Radix UI Slider) to control the `indexDate`. This is much easier to use on mobile than scrubbing the chart directly.
5.  **Data Display (Legend/Tooltip)**:
    - A grid of "Cards" below the chart showing the Legend (Color + Symbol) and the Current Return Value (e.g., "+120%") based on the slider position.

### Step 3: Styling & UX
1.  **Palette**: Use a distinct color palette (Emerald, Blue, Violet, Amber, Rose) ensuring high contrast.
2.  **Typography**: Use `Inter` or `Geist` font (Next.js default). Large, readable numbers for the percentage values.
3.  **Animation**: Use framer-motion or simple CSS transitions for the reference line movement to ensure it feels smooth (60fps).

## 4. Data Extraction Plan

I will not use fake data. I will use the `stocks.csv` data referenced in the Vega spec.

**Source**: `https://vega.github.io/editor/data/stocks.csv`

**Extraction Method**:
Since I cannot fetch live URLs during code generation, I will include the raw CSV data as a constant JSON object in the component file. I will extract the data points directly from the CSV content associated with that URL for the 5 companies (MSFT, AMZN, IBM, GOOG, AAPL).

**Data Structure for Component**:
```typescript
type StockDataPoint = {
  date: string; // ISO format or timestamp
  price: number;
  symbol: string;
};

// Data will be grouped/processed into:
type ChartDataPoint = {
  date: number; // timestamp for X-axis
  AAPL: number; // Normalized value
  AMZN: number; // Normalized value
  // ... etc
  originalPrices: { // To show raw price if needed
      AAPL: number;
      //...
  }
};
```

This plan ensures the mobile version retains the powerful "relative comparison" feature of the original while solving the usability issues inherent in a direct desktop port.