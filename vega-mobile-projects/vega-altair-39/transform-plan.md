# Plan: Mobile Transformation for "Strip Plot Jitter"

## 1. Visualization Analysis & Design Strategy

### Desktop Analysis
The original visualization displays two side-by-side "strip plots" (1D scatter plots).
- **Data**: Movies dataset (IMDB Rating vs. Major Genre).
- **Encoding**:
    - X-axis: Quantitative (IMDB Rating).
    - Y-axis: Nominal (Major Genre).
    - Color: Nominal (Major Genre).
    - Y-Offset (Jitter): Used to separate overlapping points. Left chart uses Normal distribution; Right chart uses Uniform distribution.
- **Issues on Mobile**:
    - **Horizontal Compression**: Displaying two charts side-by-side on a portrait screen squishes the X-axis, making patterns indistinguishable.
    - **Tiny Targets**: High density of points makes individual interaction impossible.
    - **Redundant Legends/Labels**: The genre text takes up valuable horizontal space.

### Mobile Design Strategy
To ensure readability and a premium experience, we cannot simply shrink the desktop layout. We must decouple the two visualization modes and optimize the layout for vertical scrolling.

#### 1. Layout Serialization (L1 Chart Components)
Instead of `hconcat` (side-by-side), we will use a **Split State** approach.
- **Action**: **Compensate (Toggle)**.
- **Reasoning**: The two charts show the *same* data with different jitter algorithms. Showing both simultaneously on mobile provides little value and destroys readability. We will implement a segmented control (switch) to toggle between "Normal Jitter" and "Uniform Jitter".

#### 2. Coordinate System Adaptation (L2 Coordinate System)
- **Action**: **Rescale (Vertical Expansion)**.
- **Reasoning**: There are many genres. To avoid overplotting even with jitter, the chart height must be dynamic based on the number of genres. We will allow the user to scroll vertically through the genres while the X-axis (Rating) remains fixed or sticky.
- **Action**: **Reposition (Axis Labels)**.
- **Reasoning**: Y-axis labels (Genres) usually sit to the left. On mobile, this eats horizontal space for the actual data. We will move the Genre label to be a **Section Header** above each strip, or overlay it neatly, giving the full width to the data points.

#### 3. Interaction Refinement (L1 Interaction)
- **Action**: **Recompose (Replace Trigger)**.
- **Reasoning**: Desktop relies on visual density. Mobile requires specific data access. We will replace `hover` with `click/tap`. Tapping a point will trigger a **L2 Feedback (Fix Tooltip Position)**—specifically a bottom drawer or a fixed overlay showing movie details, as fingers obscure standard tooltips.

## 2. Vis2Mobile Design Action Space Plan

| Level | Component | Action | Description & Reasoning |
| :--- | :--- | :--- | :--- |
| **L1** | **Chart Components** | `Serialize layout` | **Critical Step**. Convert the side-by-side layout into a single view with a toggle switch. This solves the "Distorted layout" issue on narrow screens. |
| **L2** | **Data Marks** | `Rescale` (Mark Size) | Maintain a touch-friendly size for dots (approx 6-8px) but ensure the container has enough height so they don't overlap excessively. |
| **L2** | **Coord. System** | `Rescale` (Height) | Calculate container height dynamically: `height = num_genres * row_height`. This prevents the "High graphical density" issue. |
| **L4** | **Axis Label** | `Reposition` | Move Y-axis labels (Genres) from the left side to above the data rows or integrated as row headers. This maximizes the X-axis width for the `IMDB Rating`. |
| **L5** | **Feedback** | `Reposition (Fix)` | Use a "Selected Item" card fixed at the bottom of the screen instead of a floating tooltip. This addresses the "Fat-finger problem". |
| **L3** | **Gridlines** | `Recompose (Remove)` | Remove vertical gridlines to reduce visual noise. Keep faint horizontal guides to separate genres. |

## 3. Data Extraction & Codification Plan

The source data is external (`movies.json`). We cannot rely on Vega's internal transform on the client side without importing Vega (which is heavy). We will implement the data processing in TypeScript.

### Data Source
- **URL**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`

### Processing Logic (TypeScript)
1.  **Fetch**: Retrieve the JSON data.
2.  **Filter**: Remove entries where `IMDB Rating` or `Major Genre` is null.
3.  **Group**: Extract unique `Major Genre` list to create the Y-axis scale.
4.  **Jitter Calculation**: Replicate the Vega formulas in JS to generate static coordinates for the points.
    *   **Normal Jitter**: Box-Muller transform.
        ```javascript
        // Formula from spec: sqrt(-2*log(random()))*cos(2*PI*random())
        const jitterNormal = Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
        ```
    *   **Uniform Jitter**:
        ```javascript
        // Formula from spec: random()
        const jitterUniform = Math.random();
        ```
5.  **Coordinate Mapping**:
    *   Map `Major Genre` to a base Y-index (e.g., Action = 0, Comedy = 100).
    *   Final `y` = `base_y + (jitter * scale_factor)`.

## 4. Implementation Steps

### Step 1: Data Hook (`useMoviesData.ts`)
- Create a React hook to fetch the JSON.
- Process the data to add `jitterNormal` and `jitterUniform` properties to every movie object.
- Group data by Genre to help with layout calculations.

### Step 2: Component Structure (`Visualization.tsx`)
- **Container**: Full-width, mobile-optimized container with `min-h-screen`.
- **Header**:
    - Title: "IMDB Ratings by Genre".
    - Control: A segmented toggle (Tab) for [Normal | Uniform].
- **Chart Area (Recharts)**:
    - Use `<ScatterChart>` with `layout="vertical"`?
    - *Correction*: Recharts Scatter is Cartesian. We will use a custom `<ComposedChart>` or `<ScatterChart>`.
    - **X-Axis**: `IMDB Rating` (0 to 10).
    - **Y-Axis**: We will simulate the categorical Y-axis using numbers. Each Genre gets a "slot" (e.g., Action is at Y=10, Adventure at Y=20).
    - **Scatter Data**: `x: Rating`, `y: GenreIndex + (Jitter * Width)`.
    - **Custom Tooltip**: Disabled default tooltip.

### Step 3: Interaction & Feedback
- **State**: `selectedMovie` (Movie object | null).
- **Event**: `onClick` on `<Scatter>` point sets `selectedMovie`.
- **UI**: A fixed `AnimatePresence` (framer-motion) bottom sheet that appears when `selectedMovie` is active, showing the movie title, specific rating, and genre.

### Step 4: Premium Styling
- **Glassmorphism**: Use `backdrop-blur` for the control panel and bottom sheet.
- **Color Palette**: Use a vibrant color scale for genres (referencing the original encoded colors) but ensuring contrast against a dark or light mode background (prefer Dark Mode for premium feel).
- **Typography**: Clean sans-serif fonts, large numbers for ratings in the details view.

### Step 5: Axis Handling
- Since we are stacking genres vertically, we might have 15+ genres. The chart height needs to be `number_of_genres * 80px`.
- We will render the Genre Title as a Text label inside the chart area (using Recharts `<ReferenceLine>` or `<Label>`) or simply map the Y-Axis ticks to the Genre names, ensuring text wrapping or truncation handled via CSS `text-overflow`. *Decision*: Standard Y-Axis ticks with a reasonable width, but formatted to be readable.

## 5. Mobile Readability Checks
- **Font Size**: Axis labels min 12px.
- **Touch Targets**: Scatter points will have a visual radius of 4-5px but a transparent hit area (cursor/stroke width) that is larger if possible, or we rely on the sparsity of the strip plot.
- **Contrast**: Ensure colored dots stand out against the background.