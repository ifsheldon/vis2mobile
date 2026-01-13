# Vis2Mobile Transformation Plan

## 1. Data Analysis and Extraction Strategy

The original visualization is a horizontal bar chart comparing movie IMDB ratings against a global average benchmark.

### Data Logic
The original Vega-Lite spec performs specific data transformations that we must replicate in the React component (or a pre-processing utility) to ensure "Real Data" usage.

1.  **Source**: `https://vega.github.io/editor/data/movies.json`
2.  **Step 1: Clean**: Filter out records where `IMDB Rating` is `null`.
3.  **Step 2: Aggregate**: Calculate the global mean of `IMDB Rating` (let's call this `GlobalAvg`).
    *   *Note*: The original spec calculates this mean across the *entire* dataset before the final filter.
4.  **Step 3: Filter**: Select movies where `(datum['IMDB Rating'] - GlobalAvg) > 2.5`.
    *   *Narrative*: These are "Exceptional Movies" that perform significantly better than the average.
5.  **Step 4: Sort**: The desktop version appears to sort alphabetically by `Title`. We will maintain this default but consider sorting by Rating as a secondary option if time permits, as it's analytically more useful.

### Data Structure for Component
We need to extract an array of objects:
```typescript
interface MovieData {
  title: string;
  rating: number; // IMDB Rating
  globalAverage: number; // The calculated mean
}
```

## 2. High-Level Design Philosophy

The core problem with `desktop_on_mobile.png` is **horizontal constriction**. The long movie titles (e.g., "The Lord of the Rings: The Return of the King") on the Y-axis consume 60-70% of the screen width, leaving almost no room for the actual bars to show differences in rating.

To solve this, we will use a **Vertical Expansion Strategy**. We will trade vertical scrolling space (which is cheap on mobile) for horizontal clarity.

### Key Design Shift: "Label-Above-Bar" Layout
Instead of the standard `Label | Bar` layout (Left-to-Right), we will switch to a `Label \n Bar` layout (Top-to-Bottom) for each data item. This allows the movie title to occupy the full screen width, and the rating bar to also occupy the full screen width below it.

## 3. Transformation Actions (Mapped to Design Action Space)

### L0: Visualization Container
*   **Action: Rescale (Viewport)**
    *   *Details*: Set the container height to `auto` and allow the page to scroll. Do not try to fit all movies into a single viewport (100vh).
    *   *Reason*: There are roughly 15-20 bars. Squeezing them into one screen makes touch targets too small.

### L1: Interaction Layer
*   **Action: Recompose (Replace Triggers)**
    *   *Details*: Replace `Hover` with `Tap/Click`.
    *   *Reason*: Mobile users cannot hover. Tapping a bar should trigger a "Focus State" or a Tooltip.
*   **Action: Reposition (Fix Tooltip)**
    *   *Details*: Instead of a floating tooltip that might be covered by a finger, display precise values (Rating vs Average) in a fixed bottom sheet or a designated area when a bar is active. Alternatively, since the data is simple, render the values directly on the chart (see L4).

### L2: Coordinate System & Axes
*   **Action: Reposition (Labels)** (Crucial)
    *   *Details*: Move Y-Axis labels (Movie Titles) from the left side of the chart to **above** each bar.
    *   *Reason*: Solves the "cluttered text" and "distorted layout" issue seen in `desktop_on_mobile.png`.
*   **Action: Transpose (None)**
    *   *Reason*: We will *keep* the horizontal bar orientation (Row chart). Converting to vertical columns would make axis labels (Titles) impossible to read.

### L3: Reference & Annotation
*   **Action: Recompose (Externalize/Legend)**
    *   *Details*: The red line (Global Average) is vital. We will keep the reference line in the background but add a clear legend/KPI card at the top: "Global Average Rating: [Value]".
    *   *Reason*: Ensure the context of "why these movies are shown" is clear immediately.

### L4: Data Marks (Bars)
*   **Action: Rescale (Thickness)**
    *   *Details*: Increase bar height (thickness) to `32px` or `40px`.
    *   *Reason*: Adhere to mobile touch target guidelines (approx 44px standard).
*   **Action: Mark Label (Add)**
    *   *Details*: Place the numeric rating (e.g., "9.2") inside the bar (right-aligned) or immediately to the right of the bar.
    *   *Reason*: Allows users to read values without interaction (glanceability).

## 4. Implementation Plan

### Step 1: Data Preparation Utility
Create a utility function to process the raw `movies.json`:
1.  Fetch JSON.
2.  Compute `mean(IMDB Rating)`.
3.  Filter `Rating > Mean + 2.5`.
4.  Map to component-ready format.

### Step 2: Component Structure (`src/components/Visualization.tsx`)

**A. Header Section (Narrative Layer)**
*   **Title**: "Cinematic Masterpieces" (or "Top Rated Movies").
*   **Subtitle**: "Movies rated 2.5+ points above the global average."
*   **KPI Card**: Display the Global Average (e.g., "6.4") prominently with a red indicator matching the reference line.

**B. The Chart Area (Recharts Customization)**
*   Use `<ComposedChart>` with `layout="vertical"`.
*   **X-Axis**: Hidden or Minimal (0 to 10 domain).
*   **Y-Axis**: Hidden (We will render custom labels).
*   **Custom Rendering Loop**:
    *   Instead of relying solely on Recharts axis generation, map through the data to render a custom "Row" for each movie:
        ```jsx
        <div className="mb-4">
           <div className="text-sm font-semibold text-gray-800 mb-1">{movie.title}</div>
           <div className="relative h-8 w-full bg-gray-100 rounded-full">
               {/* Reference Line Marker */}
               <div className="absolute left-[X%] h-full w-[2px] bg-red-500" />
               
               {/* Actual Bar */}
               <div className="h-full bg-blue-600 rounded-full flex items-center justify-end px-2" style={{width: `${rating}%`}}>
                  <span className="text-white text-xs">{rating}</span>
               </div>
           </div>
        </div>
        ```
    *   *Decision*: Using a custom HTML/Tailwind mapping often works better for "Label-Above-Bar" layouts than fighting SVG positioning in charting libraries, but we can also use Recharts with `YAxis type="category" width={10}` and a custom `content` render for the bars. Given the "Premium Aesthetics" requirement, constructing the bars using Tailwind divs with Framer Motion or simple CSS transitions offers easier control over the "Label Above" layout than standard Recharts axes. **However**, to strictly stick to the "Visualization: Recharts" tech stack requirement, we will use Recharts but customize the `YAxis` `tick` component to render the text *above* the bar area, or disable the YAxis and render titles externally.

    *   *Refined Recharts Approach*:
        *   Container: `ResponsiveContainer` (height calculated by `data.length * rowHeight`).
        *   `BarChart` with `layout="vertical"`.
        *   `XAxis` type="number" domain={[0, 10]} hide.
        *   `YAxis` type="category" dataKey="Title" width={0} (Hidden).
        *   `Bar` with a `shape` prop (Custom Bar Shape) OR standard Bar.
        *   **Crucial**: Since we need titles *above* bars, we might actually be better off iterating through the data and rendering a mini `BarChart` for *each* row, or rendering the Titles as simple React Text elements outside the chart, and the Chart just handles the bars.
        *   **Selected Approach**: **Hybrid**. Render a list of items. Each item contains the Title (Text) and a container for the visual bar. This is the most robust mobile pattern. We can use a Recharts `BarChart` for the visual part if we want axes, but since we are transforming to mobile, a pure Tailwind bar with a calculated width is often smoother and more responsive for this specific "List of Bars" layout. **However, to strictly fulfill the Recharts requirement**, I will implement a single tall `BarChart`. I will use a Custom `YAxis` tick that returns `<text y={-15} ... >{payload.value}</text>` to shift the label up, effectively placing it above the bar.

### Step 3: Premium Aesthetics (Styling)
*   **Palette**:
    *   Background: Clean white or very light slate.
    *   Bars: Gradient Blue (to match desktop Blue) -> `from-blue-500 to-blue-600`.
    *   Reference Line: `rose-500` (Red).
*   **Typography**: Inter or system sans-serif. Titles in dark slate (readable), ratings in white (inside bar) or dark grey (outside).
*   **Motion**: Animate bars growing from 0 width on load.

### Step 4: Data Validation
*   Ensure the "Red Line" (Average) is accurately placed relative to the 0-10 scale.
*   Ensure the bars are accurately sized relative to the 0-10 scale.

## 5. Summary of Actions
1.  **Extract** real data from `movies.json`.
2.  **Calculate** `Global Mean` and filter movies.
3.  **Layout**: Switch to a list-based view where Title is above the Bar.
4.  **Visualize**: Use Recharts (vertically stacked) or Tailwind-styled bars to represent the rating.
5.  **Context**: Add a visible "Global Average" marker and KPI header.
6.  **Style**: Apply modern spacing, typography, and glassmorphism touches.