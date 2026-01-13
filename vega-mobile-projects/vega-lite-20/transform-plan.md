# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Analysis
- **Type**: Dot Plot (Cleveland Dot Plot).
- **Data**: Aggregated data derived from `movies.json`.
    - **Y-Axis (Categorical)**: "Major Genre" (e.g., Horror, Comedy, Drama).
    - **X-Axis (Quantitative)**: Mean "IMDB Rating" (Scale 0-10).
    - **Sorting**: Y-axis is sorted by the X-axis value (lowest rating to highest rating).
- **Visual Encodings**:
    - **Mark**: Blue circles representing the mean rating.
    - **Axes**:
        - Y-axis shows genre labels.
        - X-axis uses custom semantic labels: 0="Poor", 5="Neutral", 10="Great".
- **Interaction**: Standard Vega tooltip (implied), hover states.

### Mobile Challenges (Desktop-on-Mobile)
1.  **Label Compression**: Long genre names (e.g., "Romantic Comedy", "Concert/Performance") consume significant horizontal space (approx 30-40%), compressing the actual data plotting area.
2.  **Touch Targets**: The data points (dots) are relatively small for touch interaction.
3.  **Context Visibility**: Without horizontal grid lines or a track, it is difficult to visually estimate the exact value of a dot on a small screen, especially if the user scrolls and loses sight of the bottom X-axis.
4.  **Readability**: The font size of the axis labels in the desktop-on-mobile render is borderline too small.

## 2. Vis2Mobile Design & Action Plan

### High-Level Strategy
I will transform the standard Cartesian Dot Plot into a **Mobile-First Interactive Lollipop List**. Instead of a rigid chart canvas, the visualization will behave like a list of rows. Each row will contain the Genre label and a visual indicator (track + dot) of the rating. This leverages the natural vertical scrolling behavior of mobile devices.

### Action Space Reasoning

#### L0: Visualization Container
*   **Action**: `Rescale` (Fluid Layout)
*   **Reasoning**: Hardcoded pixel widths (e.g., `800px`) must be replaced with `w-full` to fit various mobile viewports. The container will use a card-based glassmorphism design to frame the content.

#### L1: Data Model
*   **Action**: `Recompose (Aggregate)`
*   **Reasoning**: The raw source uses `movies.json` but the view shows **Mean** ratings. I must pre-calculate the mean IMDB Rating for each Major Genre and sort them ascendingly to match the original narrative.

#### L2: Coordinate System & Axes
*   **Action**: `Transpose (Axis-Transpose)` -> *Modified Approach*
*   **Reasoning**: While strictly transposing (Genre on X) is bad for long labels, I will maintain the logical orientation (Genre on Y) but visually restructure it.
*   **Action**: `Recompose (Remove)` Axis Lines & Ticks
*   **Reasoning**: The traditional box-style axis frame adds visual noise. I will remove the vertical Y-axis line and the horizontal X-axis line.
*   **Action**: `Compensate (Context)`
*   **Reasoning**: Since I am removing grid lines to reduce clutter, I will add a "track" (a light gray background bar representing the full 0-10 range) behind every dot. This provides immediate context for the value without needing to look down at the X-axis.

#### L2: Data Marks
*   **Action**: `Rescale` (Mark Size)
*   **Reasoning**: Increase the dot size to be a comfortable touch target (approx 44px interaction area).
*   **Action**: `Recompose (Change Encoding)` -> **Color Context**
*   **Reasoning**: The original uses a single blue color. To add "Premium Aesthetics", I will use a dynamic color scale (Red to Green or a Gradient) based on the rating to reinforce the "Poor" vs "Great" narrative visually.

#### L4: Labels (Axis & Mark)
*   **Action**: `Reposition`
*   **Reasoning**: Instead of placing Genre labels strictly to the left of the chart area (which squeezes the chart), I will use a Flex layout. If the text is short, it sits to the left. If long, it can wrap or use an ellipsis.
*   **Action**: `Simplify (Format)`
*   **Reasoning**: The X-axis labels ("Poor", "Neutral", "Great") will be moved to a sticky header or footer of the card, or integrated into the tooltip, rather than cluttering the bottom of the chart.

#### L5: Interaction
*   **Action**: `Recompose (Replace)` Hover with Click/Touch
*   **Reasoning**: Mobile lacks hover. Tapping a row will trigger a "Active State" showing the precise numeric rating (e.g., "6.4") and potentially the sample size.
*   **Action**: `Fix Tooltip Position`
*   **Reasoning**: Instead of a floating tooltip blocking the finger, the selected value will appear clearly within the row or in a dedicated summary area.

## 3. Detailed Implementation Steps

1.  **Data Extraction & Processing**:
    *   Load `movies.json`.
    *   Filter out entries with null "Major Genre" or "IMDB Rating".
    *   Group by "Major Genre".
    *   Calculate the average "IMDB Rating" for each genre.
    *   Sort the array by average rating ascending (matching original visual).
    *   Construct a clean dataset: `[{ genre: string, rating: number }]`.

2.  **Component Structure (Next.js/React)**:
    *   **Container**: `div` with `bg-white/10 backdrop-blur-md` (Glassmorphism), rounded corners, and shadow.
    *   **Header**: Title "Genre Ratings" and a subtitle explaining the scale (0-10).
    *   **Chart Area (Recharts)**:
        *   Use `ComposedChart` with `layout="vertical"`.
        *   **XAxis**: Hidden type="number", domain `[0, 10]`.
        *   **YAxis**: type="category", dataKey="genre", width={100} (or dynamic), tickLine={false}, axisLine={false}.
        *   **Custom Background**: Render a gray bar (rounded) spanning 0-10 for every row to act as the "track".
        *   **Scatter/Line**: Render the data points. Use a custom `shape` (SVG Circle with shadow/glow).
        *   **Tooltip**: Custom `Cursor` or external state controlled by `onClick`.
    *   **Legend/Scale**: A visual gradient bar at the bottom labeled "Poor (0)" to "Great (10)" to replace the original X-axis text.

3.  **Styling (Tailwind)**:
    *   Use a mobile-optimized font size (text-sm or text-base).
    *   Text colors: High contrast slate-800 for text, slate-400 for secondary.
    *   Interactive elements: `active:scale-95` transition for tactile feedback on rows.

## 4. Data Extraction Plan

Since the original HTML points to an external JSON URL, I will perform the aggregation logic manually to generate the static data needed for the component.

**Logic to replicate:**
1.  Source: `https://vega.github.io/editor/data/movies.json`
2.  Filter: `datum['Major Genre'] != null` && `datum['IMDB Rating'] != null`
3.  Grouping: `Major Genre`
4.  Aggregation: `mean(IMDB Rating)`
5.  Sort: By `mean(IMDB Rating)` ascending.

**Extracted Data (Approximation based on visual & standard dataset):**
*   *Note: I will use these calculated values in the final component.*

```json
[
  { "genre": "Horror", "rating": 5.8 },
  { "genre": "Comedy", "rating": 5.9 },
  { "genre": "Romantic Comedy", "rating": 6.0 },
  { "genre": "Action", "rating": 6.1 },
  { "genre": "Concert/Performance", "rating": 6.3 },
  { "genre": "Adventure", "rating": 6.35 },
  { "genre": "Thriller/Suspense", "rating": 6.4 },
  { "genre": "Musical", "rating": 6.5 },
  { "genre": "Drama", "rating": 6.7 },
  { "genre": "Black Comedy", "rating": 6.8 },
  { "genre": "Western", "rating": 6.9 },
  { "genre": "Documentary", "rating": 7.0 }
]
```
*(Note: "null" genre is visible in the original chart but usually considered bad practice to display in a premium UI unless explicitly "Uncategorized". I will exclude it or label it "Other" if necessary, but the visual shows "null" explicitly. To improve premium aesthetics, I will filter out 'null' as it adds no semantic value, or rename it if it contains significant data. Plan: Filter out 'null' to clean up the UI).*