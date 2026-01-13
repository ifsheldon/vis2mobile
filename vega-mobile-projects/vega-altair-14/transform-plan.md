# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Characteristics
- **Type**: Faceted Bar Chart (Technically). It visualizes population by `Sex` (color) and `Age` (columns).
- **Layout**: Horizontal arrangement. The spec uses `column: {"field": "age"}`, creating a very wide row of small charts.
- **Interaction**: A slider widget for the "Year" parameter (1900-2000).
- **Data Attributes**: `year`, `age`, `sex` (1=Male, 2=Female), `people` (population count).

### Mobile Adaptability Issues
- **Aspect Ratio Mismatch**: The original "Age as Columns" layout is extremely wide. On a portrait mobile screen, this would be compressed into unreadable slivers or require excessive horizontal scrolling.
- **Touch Targets**: The native HTML range slider is often too small for precise touch interaction on mobile.
- **Readability**: Axis labels and headers for every column would be cluttered.

## 2. High-Level Transformation Plan & Design Action Space

The goal is to transform this horizontal facet chart into a **Vertical Population Pyramid**. This is the standard, most readable format for Age/Sex distributions on narrow screens.

### Applied Design Actions

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L1** | **Chart Components** | **Transpose (Layout)** | **Crucial Step**. The desktop version lists ages horizontally. We must **Transpose** the layout to list Ages vertically (Y-axis) to utilize the vertical scrolling nature of mobile and the portrait aspect ratio. |
| **L2** | **Coord System** | **Transpose Axes** | Aligning with the chart transposition, we switch the categorical dimension (Age) to the Y-axis and the quantitative dimension (Population) to the X-axis. |
| **L2** | **Data Marks** | **Recompose (Change Encoding)** | Instead of separate faceted columns, we will use a **Diverging Bar Chart** (Pyramid). <br>• **Left Side**: Male (Negative values trick).<br>• **Right Side**: Female (Positive values).<br>• **Center**: Age Labels (Spine layout). |
| **L5** | **Interaction** | **Reposition (Fix)** | The Year slider is currently floating. We will **Reposition** it to a fixed, prominent control panel at the bottom of the screen (Glassmorphism style) to ensure it's easily accessible with a thumb. |
| **L3** | **Legend** | **Reposition & Simplify** | Move the legend from the side to the top header. Use "Male" and "Female" headers directly above the chart halves to act as both axis titles and legends. |
| **L3** | **Axes** | **Recompose (Remove)** | Remove the Y-axis vertical line. Place Age labels in the **center** (between the bars) to save horizontal space (The "Spine" layout). |
| **L2** | **Annotations** | **Compensate (Number)** | Display the total population or year prominently in the background or header to add context without clutter. |

## 3. Data Extraction & Processing Strategy

**Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/population.json`

We will not use fake data. We will implement a utility to fetch and process this real JSON.

**Processing Logic**:
1.  **Fetch**: Download the JSON array.
2.  **Filter**: The visualization relies on a `Year` parameter. We need to filter the dataset by the selected year (Default: 2000).
3.  **Map Sex**: The raw data likely uses `1` for Male and `2` for Female (based on the Vega spec `transform`). We must map these to string labels or specific keys.
4.  **Formatting for Recharts Pyramid**:
    *   Recharts requires a specific structure for diverging bars.
    *   We will transform the data into an array of objects:
        ```typescript
        interface AgeGroup {
          age: number; // Y-axis key
          male: number; // Negative value for rendering left
          maleDisplay: number; // Positive value for Tooltip
          female: number; // Positive value for rendering right
        }
        ```
    *   **Note**: We will multiply Male population by `-1` so the bars grow to the left from the center `0` line.
5.  **Sorting**: Ensure data is sorted by Age (0 to 90+).

## 4. Implementation Steps

### Step 1: Data Utility (`src/utils/data.ts`)
- Create a function `fetchPopulationData()` that retrieves the JSON.
- Create a hook `usePopulationData(year)` that returns the processed data for the pyramid and the total population for that year.

### Step 2: Component Layout (`src/components/Visualization.tsx`)
- **Container**: `h-screen w-full bg-slate-50 flex flex-col`.
- **Header**:
    - Title: "US Population".
    - Subtitle: Dynamic display of the selected `Year`.
    - Legend: Visual indicators (Blue/Pink dots) with Total Population counts for that sex.
- **Chart Area (Middle)**:
    - Use `Recharts.ResponsiveContainer` with a `BarChart` (`layout="vertical"`).
    - **XAxis**: Type `number`, hide axis line, hide ticks (optional, or use minimal ticks).
    - **YAxis**: Type `category`, dataKey `age`. **Crucial Design Detail**: Set `yAxisId` to center or hide it and use a custom ReferenceList or a central text column for Age labels to create the "Spine" look.
    - **Tooltip**: Custom `Cursor` and `Content`. Must convert negative Male numbers to positive.
    - **Bars**:
        - `Bar` (Male): Fill color `steelblue`. DataKey `male`.
        - `Bar` (Female): Fill color `salmon`. DataKey `female`.

### Step 3: Interaction Layer (Bottom Control)
- **Glassmorphism Panel**: `fixed bottom-0 w-full backdrop-blur-md bg-white/70`.
- **Slider**: A custom styled HTML `input type="range"`.
    - Min: 1900, Max: 2000, Step: 10.
    - Add "Play" button? (Optional, but adds "Wow" factor). Let's stick to a manual slider first to match the original spec.

### Step 4: Styling (Tailwind)
- Use `hsl` variables for theming.
- Add subtle animations (`framer-motion` or CSS transitions) to the bars when the Year changes to make it feel fluid.

## 5. Mobile Readability Assurance
- **Font Size**: All labels must be at least 12px.
- **Label Placement**: If bars are too narrow, the central Age labels might overlap. We will ensure the chart has a minimum height (e.g., `min-h-[400px]`) inside a scrollable container if necessary, though 90 data points (ages 0-90) might be tall.
    - *Correction*: The data likely groups ages (e.g. 5-year bins) or the desktop view had specific bins. If it's single years (0-90), 90 bars is too many for one mobile screen height.
    - **Aggressive Action**: If the raw data is single-year, we will **Aggregate** (L1 Action) into 5-year bins (`0-4`, `5-9`...) during data processing to ensure the bars are thick enough to be tappable and readable.

## 6. Premium Aesthetics
- **Color Palette**: Modernize `steelblue` and `salmon` to slightly more vibrant, modern shades (e.g., Indigo-500 and Rose-400).
- **Surface**: Use card-like surfaces with soft shadows.
- **Feedback**: Haptic feedback (if possible) or visual highlight when dragging the slider.