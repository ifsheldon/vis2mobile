# Vis2Mobile Plan: Interactive Indexed Stock Chart

## 1. Analysis of Original Visualization & Mobile Issues

### Original Desktop Visualization
- **Type**: Interactive Multi-Line Chart (Time Series).
- **Core Functionality**: "Indexed Chart". It visualizes the percentage return of 5 stocks (MSFT, AMZN, IBM, GOOG, AAPL) relative to a specific date.
- **Interaction**:
    - **Trigger**: Mouse hover (`pointermove`).
    - **Feedback**: A vertical red rule (`indexDate`) follows the cursor.
    - **Data Transformation**: As the red line moves, all data points are recalculated: `(price - price_at_index_date) / price_at_index_date`.
- **Labels**: Direct labels (Symbol names) placed at the end of the lines (Right side).
- **Axes**: X (Date, 2000-2010), Y (Percentage).

### Mobile Compatibility Issues
1.  **Interaction Gap**: Mobile devices do not support `hover`. The "scan to re-index" feature is the core value proposition but requires a continuous pointer signal not native to touch without explicit "drag" intent.
2.  **Screen Real Estate**:
    - 5 overlapping lines on a narrow screen create visual chaos (**Overplotting**).
    - Placing labels at the far right (Desktop style) will likely be cut off or squeeze the chart area significantly (**Distorted Layout**).
3.  **Touch Occlusion**: If a tooltip follows the finger, the user's hand will cover the data they are trying to read.

## 2. Design Action Space Plan

### High-Level Strategy
I will transform this into a **"Financial Performance Explorer"** card. The core "re-indexing" interaction will be preserved but adapted for touch. Instead of passive hovering, I will implement a **Touch-to-Scan** interaction zone. The layout will shift from a horizontal spread to a vertical composition with a fixed "Heads-Up Display" (HUD) for data reading to ensure readability.

### Specific Actions & Rationale

#### **L0 Visualization Container**
-   **Action: `Rescale`**: Set width to `100%` of the container and use a fixed aspect ratio (e.g., 4:3 or 1:1) to ensure the chart is tall enough to distinguish the 5 lines.
-   **Action: `Reposition`**: Add padding to the bottom to accommodate the touch slider/interaction hint.

#### **L1 Interaction Layer**
-   **Action: `Recompose (Replace)` (Trigger)**: Replace the `hover` trigger with an explicit `onTouchMove` / `onDrag` interaction on the chart area.
-   **Action: `Recompose (Replace)` (Feedback)**: Instead of the red vertical rule resetting the index, I will use a **Reference Line** that snaps to the nearest data point. The re-indexing calculation (normalizing prices to 0% at the selected date) will occur dynamically as the user drags across the chart.

#### **L1 Data Model**
-   **Action: `Recompose (Filter)`**: (Optional but considered) If 5 lines are too messy, I might initially highlight the top performer, but for this task, I will aim to keep all 5 but use **Emphasis** strategies (dimming inactive lines) to handle density.

#### **L2 Data Marks**
-   **Action: `Recompose (Change Encoding)`**: The logic `(price - index_price) / index_price` must be implemented in the React component's state.
-   **Action: `Highlight (Focus)`**: When touching, the line closest to the finger (or the one being dragged over) could highlight, but given the "Indexed" nature, all lines update simultaneously. I will use a distinct color palette to differentiate the 5 stocks.

#### **L3/L4 Axes & Ticks**
-   **Action: `Decimate Ticks`**: Reduce X-axis ticks to show only every 2 years (e.g., '00, '02, '04) to avoid **Cluttered text**.
-   **Action: `Format Tick Label`**: Shorten dates to `YY` (e.g., "2005" -> "'05").
-   **Action: `Recompose (Remove)`**: Remove Y-axis title. The percentage sign `%` on the ticks is sufficient context.

#### **L4 Mark Label (Series Labels)**
-   **Action: `Reposition (Externalize)`**: Move the line labels (MSFT, AMZN, etc.) from the right edge of the chart to a **Legend/Stat Board** above the chart.
-   **Action: `Compensate (Number)` / Dynamic Legend**: The Legend will double as the data display. When the user selects a date, the Legend shows the % return for that specific date for *all* stocks simultaneously.

#### **L5 Feedback (Tooltip)**
-   **Action: `Reposition (Fix)`**: Use a **Fixed Tooltip/HUD** at the top of the card. Following the finger on mobile causes occlusion. The HUD will display the currently selected "Index Date".

## 3. Data Extraction Plan

**Source**: `https://vega.github.io/editor/data/stocks.csv`

I will implement a utility function to fetch and parse this CSV.
1.  **Fetch**: `fetch('https://vega.github.io/editor/data/stocks.csv')`
2.  **Parse**:
    -   Convert CSV string to JSON objects.
    -   Fields: `symbol` (string), `date` (Date object), `price` (number).
3.  **Transform**:
    -   Group data by `symbol`.
    -   Create a unified time-series array where each object is `{ date: string, AAPL: price, MSFT: price, ... }` to fit Recharts' data format.
4.  **Runtime Calculation**:
    -   State `selectedIndex`: Tracks the user's cursor position (index in the array).
    -   Derived Data: Map through the unified array. For every data point `P`, calculate `(P.price - P.indexDatePrice) / P.indexDatePrice`.

## 4. Implementation Steps

### Step 1: Data Setup
-   Create `src/utils/useStockData.ts`.
-   Implement CSV parsing logic.
-   Return a structured object: `{ rawData: [], formattedData: [] }`.

### Step 2: Component Layout (Container)
-   Create `src/components/Visualization.tsx`.
-   Use a Tailwind Card layout: `bg-white/10 backdrop-blur-md` (Glassmorphism).
-   **Header**: Title ("Stock Returns Comparison") and a dynamic subtitle showing the "Indexed Date" (e.g., "Indexed to: Jan 1, 2005").

### Step 3: Interactive Chart Component
-   Use `<ResponsiveContainer>` from Recharts.
-   Use `<LineChart>` with 5 `<Line>` components.
-   **The Magic**: Implement `onMouseMove` / `onTouchMove` on the chart wrapper.
    -   Calculate which `date` index touches the cursor.
    -   Update React state: `setIndexDate(date)`.
-   **Dynamic Data**: The data passed to `<LineChart>` will be a *memoized* version of the data where values are normalized against `indexDate`.

### Step 4: The HUD (Legend & Stats)
-   Place a grid of 5 items below the title but above the chart.
-   Each item contains:
    -   Stock Symbol (Color coded).
    -   Current Value (based on drag position).
-   This solves the "readability" issue by removing labels from the chart body.

### Step 5: Mobile Polish
-   Add a `<ReferenceLine>` at the `indexDate` (Visual Feedback).
-   Ensure touch targets are large.
-   Use `strokeWidth={2}` for lines to ensure visibility on small screens.
-   Add a "Reset" button or instruction ("Drag to re-index").

## 5. Summary of Mobile Adaptations

| Feature | Desktop (Original) | Mobile (Planned) | Action Space |
| :--- | :--- | :--- | :--- |
| **Trigger** | Hover | Drag / Touch | `Recompose (Replace)` |
| **Labels** | End of Line (Right) | Fixed Header Grid (HUD) | `Reposition (Externalize)` |
| **Y-Axis** | Linear Price | Relative % (Dynamic) | Preserved (Logic moved to State) |
| **Layout** | Wide | Square/Portrait | `Rescale` |
| **Legend** | Implicit (Text Color) | Explicit Stat Box | `Compensate` |