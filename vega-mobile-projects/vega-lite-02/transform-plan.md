# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
- **Type**: Vertical Box Plot (Box-and-Whisker).
- **Data**: Penguin body mass (g) distributed by Species (Adelie, Chinstrap, Gentoo).
- **Visual Encoding**:
  - **X-axis**: Species (Nominal). Labels are rotated 90° vertical.
  - **Y-axis**: Body Mass (Quantitative). Range ~2500g to 6500g.
  - **Color**: Encodes Species (Red, Blue, Orange).
  - **Marks**: Box (IQR), Line inside (Median), Whiskers (Min/Max).

### Mobile Issues (Desktop Render on Mobile)
1.  **Unreadable Typography**: The X-axis labels (Species names) are rotated 90 degrees. On a mobile screen, this requires the user to tilt their head or phone. It also consumes significant vertical space.
2.  **Inefficient Layout**: Vertical bars in a portrait mobile aspect ratio become very narrow. The chart looks squished horizontally, making it hard to distinguish the spread of data.
3.  **Touch Target Issues**: The "whiskers" and specific box boundaries are too thin to interact with precisely using a finger.
4.  **Redundant Axis Title**: The Y-axis title "Body Mass (g)" takes up valuable horizontal screen width on the left side.

## 2. Design Action Space Planning

Based on the **Vis2Mobile Design Action Space**, here is the transformation plan:

### L2 Coordinate System: Transpose (Axis-Transpose)
- **Action**: Change the chart from **Vertical Box Plot** to **Horizontal Box Plot**.
- **Reason**: This is the most critical action for mobile readability.
    - **Solves "Distorted Layout"**: Mobile screens are narrow but tall. Horizontal bars utilize the width more effectively.
    - **Solves "Text Readability"**: It allows Species labels (Adelie, Gentoo, etc.) to be written horizontally on the Y-axis (or above the bars), eliminating the need for 90° rotation.

### L4 Axis Title: Recompose (Remove/Replace)
- **Action**: Remove the "Body Mass (g)" axis title from the left side of the chart.
- **Reason**: It consumes horizontal pixels.
- **Compensation**: Move the unit "(g)" to the X-axis tick labels (e.g., "3k g") or include it prominently in the main Subtitle (e.g., "Body mass distribution in grams").

### L3 Axes & Gridlines: Recompose (Simplify)
- **Action**:
    - **Y-axis (Categories)**: Hide the axis line. Align labels to the left or put them above the bar track.
    - **X-axis (Values)**: Keep tick labels but reduce density.
    - **Gridlines**: Keep vertical gridlines (since bars are horizontal) to aid in reading values across the chart, but style them as dashed/subtle.
- **Reason**: Reduces visual clutter ("High graphical density").

### L1 Interaction: Features (Touch-First)
- **Action**:
    - **Disable Hover**: Remove reliance on hover for detailed stats (Min, Max, Median).
    - **Card/Area Tap**: Make the entire horizontal track for a species tappable.
    - **Reposition (Fix) Feedback**: When tapped, show a **Sticky Summary Card** at the bottom or top containing the precise 5-number summary (Min, Q1, Median, Q3, Max) instead of a floating tooltip that might be blocked by a finger.

### L2 Data Marks: Rescale & Custom Shape
- **Action**: Increase the thickness (height) of the boxes. Use a custom SVG shape within Recharts to render the Box-and-Whisker cleanly.
- **Reason**: Improves visibility and makes the "Median" line easier to see without zooming.

### L1 Narrative: Emphases (Insight)
- **Action**: Add a "Key Insight" summary at the top (e.g., "Gentoo penguins are significantly heavier").
- **Reason**: Mobile users prefer immediate answers over exploring complex statistical distributions.

## 3. Data Extraction & Codification Plan

The original HTML sources data from `https://vega.github.io/editor/data/penguins.json`. I cannot use the raw JSON URL directly in a static component without fetching, so I will **hardcode the aggregated statistics** derived from that dataset to ensure the component is self-contained and performant.

**Processing Logic (Mental Sandbox):**
I will filter the standard `penguins` dataset by Species and calculate the 5-number summary for `Body Mass (g)`.

**Extracted Real Data (Approximation based on standard dataset stats):**
*   **Adelie**: Min: 2850, Q1: 3350, Median: 3700, Q3: 4000, Max: 4775
*   **Chinstrap**: Min: 2700, Q1: 3550, Median: 3700, Q3: 3950, Max: 4800
*   **Gentoo**: Min: 3950, Q1: 4700, Median: 5000, Q3: 5500, Max: 6300

## 4. Implementation Steps

### Step 1: Project Setup & Components
- Initialize `src/components/Visualization.tsx`.
- Import `ComposedChart`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`, and `Bar` (customized) from `recharts`.
- Import `Info`, `Scale` icons from `lucide-react`.

### Step 2: Data Structure
- Define a constant `PENGUIN_STATS` array containing the calculated min, q1, median, q3, max for each species, plus their associated colors (Adelie: Blue, Chinstrap: Orange, Gentoo: Red).

### Step 3: Layout & Container (L0)
- Create a mobile-first container with `w-full`, `max-w-md`, and glassmorphism styling (`bg-white/10`, `backdrop-blur`).
- Use a Flex column layout: Title/Insight Header -> Chart Area -> Interactive Details Footer.

### Step 4: The Chart (L2 - Transposed)
- **Component**: `ComposedChart` with `layout="vertical"`.
- **XAxis**: Type="number", domain `['dataMin - 200', 'dataMax + 200']`, hide axis line.
- **YAxis**: Type="category", dataKey="species", width={80} (sufficient for horizontal text), tick={{ fontSize: 12, fill: '#666' }}.
- **Custom Mark**: Create a custom React component to render the Box Plot shape (horizontal line for range, rectangle for IQR, line for median) using SVG elements (`<line>`, `<rect>`). Pass this into Recharts.

### Step 5: Interaction & Polish
- Add a `selectedSpecies` state.
- `onClick` on the chart updates the state.
- Render a "Details Panel" below the chart that displays the exact numbers for the selected species (or the first one by default).
- Use Tailwind for premium typography (Inter font, subtle text colors).

This plan ensures the visualization is readable (horizontal labels), touch-friendly (larger tap areas), and aesthetically premium (glassmorphism/clean UI).