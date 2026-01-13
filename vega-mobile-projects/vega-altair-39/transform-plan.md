# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Source Analysis
- **Type**: Jittered Strip Plot (1D Scatter Plot organized by category).
- **Data Source**: Vega Datasets (`movies.json`).
- **Dimensions**:
    - **Y-Axis**: `Major Genre` (Nominal/Categorical).
    - **X-Axis**: `IMDB Rating` (Quantitative, scale 0-10).
    - **Color**: `Major Genre` (Redundant encoding with Y-axis, creates visual separation).
    - **Jitter**: Two calculation methods used for vertical spread within the category band:
        1.  **Normal Distribution**: `sqrt(-2*log(random()))*cos(2*PI*random())` (Box-Muller transform).
        2.  **Uniform Distribution**: `random()`.
- **Layout**: Two horizontal charts (`hconcat`) side-by-side.

### Desktop vs. Mobile Issues
- **Aspect Ratio**: The desktop version places two charts side-by-side. On mobile, this compresses the width significantly, causing the X-axis (Rating 0-10) to be too short. Points will overlap excessively, making the distribution pattern unreadable.
- **Text Readability**: The Y-axis labels ("Romantic Comedy", "Thriller/Suspense") are long. In the "Desktop on Mobile" view, these would either wrap awkwardly or consume 50% of the screen width, leaving no room for the data.
- **Interaction**: The dots (size 8px) are too small for touch interaction. Hover effects in the original Vega-Lite spec won't work on touch devices.
- **Context**: The user likely wants to see the distribution of ratings. The comparison between "Normal" and "Uniform" jitter is a secondary technical exploration. Showing both simultaneously taxes the cognitive load on a small screen.

## 2. High-Level Strategy

To create a premium mobile-first experience, I will transform the **Side-by-Side** layout into a **Tabbed** interface. This allows each visualization to utilize the full width of the mobile screen.

The layout will be a **Vertical Scrollable Strip Plot**.
- **Y-Axis Handling**: Instead of squeezing text on the left, I will use a clean list layout where the Genre Title acts as a section header or a clearly defined row label with adequate vertical padding.
- **Interactive Switch**: A "Segmented Control" (Tab) at the top will allow the user to toggle between "Normal Jitter" and "Uniform Jitter". This adds interactivity and solves the space issue.
- **Animation**: When switching tabs, the dots will animate to their new positions (from Normal distribution to Uniform distribution), providing the "Wow" factor and helping the user understand the mathematical difference visually.
- **Data Density**: To ensure readability, I will increase the vertical height assigned to each Genre, making the chart scrollable.

## 3. Design Action Space Plan

### L0: Visualization Container
- **Action: `Rescale`**
    - **Details**: Set container width to 100% and allow height to grow based on the number of genres.
    - **Reasoning**: Mobile screens are vertically infinite (scrollable) but horizontally constrained. We trade vertical space for clarity.
- **Action: `Reposition`**
    - **Details**: Add padding to the container to ensure the visualization "breathes" and isn't flush against the screen edges.

### L1: Chart Components
- **Action: `Transpose` (Serialize Layout)**
    - **Details**: Instead of `hconcat` (side-by-side), I will serialize the views using a Tab state. The user sees one mode at a time.
    - **Reasoning**: Resolves the "Distorted layout" issue where side-by-side charts are too narrow on mobile.
- **Action: `Recompose (Interactive Toggle)`**
    - **Details**: Implement a top-level control to switch the `jitter` calculation method.

### L3: Axes (X-Axis - IMDB Rating)
- **Action: `Set Tick Count`**
    - **Details**: Reduce tick count to ~5 (e.g., 0, 2.5, 5, 7.5, 10) or just integers (0, 2, 4, 6, 8, 10).
    - **Reasoning**: Prevents label overlapping on narrow screens.
- **Action: `Reposition`**
    - **Details**: Place the X-axis at the bottom (sticky) or repeat it at the top if the list is very long. For this plan, a standard bottom axis is sufficient if the component height is managed well.

### L3: Axes (Y-Axis - Genres)
- **Action: `Recompose (Replace)`**
    - **Details**: Instead of a traditional axis line on the left, I will render the Genre Name as a **Row Header** above the data strip or integrated into the background of the strip.
    - **Reasoning**: Long labels like "Thriller/Suspense" destroy horizontal space for the data. Moving labels *above* the data strip (or effectively increasing row height) allows the scatter plot to use 100% of the width.

### L2: Data Marks (The Dots)
- **Action: `Recompose (Change Encoding)`**
    - **Details**:
        1.  **Calculate Jitter in JS**: Since Recharts doesn't natively support Vega's transform syntax, I will pre-calculate the `yOffset` for both Normal and Uniform distributions in the data processing step.
        2.  **Mapping**: The Y-value in Recharts will be `GenreIndex + JitterOffset`.
    - **Reasoning**: Ensures precise control over the visual output.
- **Action: `Rescale`**
    - **Details**: slightly adjust dot radius based on screen density, but keeping them relatively small (e.g., 3px-4px) with `opacity` is crucial to visualize density.
- **Action: `Recompose (Color)`**
    - **Details**: Use a distinct color palette for genres to keep the visual appeal, matching the original's intent.

### L5: Interaction & Feedback
- **Action: `Fix Tooltip Position`**
    - **Details**: Use a fixed-position tooltip (glassmorphism style) at the bottom or top of the viewport when a dot is tapped.
    - **Reasoning**: Fingers block tooltips that appear directly under the touch point.
- **Action: `Disable Hover` / `Enable Click`**
    - **Details**: Mobile interaction will rely on tapping. However, given the density, tapping a specific dot is hard. I will implement a "Voronoi" or large-radius active area, or simply allow tapping a *Genre Row* to see aggregate stats (Median, Count) if individual movie selection is too difficult. *Correction*: I will aim for individual selection but with a larger hit radius.

## 4. Data Extraction & Processing

I will create a helper function to fetch and process the data.

1.  **Fetch**: Retrieve JSON from `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`.
2.  **Filter**: Remove entries where `Major Genre` or `IMDB Rating` is null.
3.  **Group & Index**: 
    - Identify unique `Major Genre` list.
    - Assign an index `i` to each genre (0 to N).
4.  **Math Transformation (The Jitter)**:
    - Iterate through the data.
    - For each movie, calculate two coordinates:
        - **Normal Y**: `GenreIndex + (Clamp(BoxMullerRandom(), -0.4, 0.4))`
        - **Uniform Y**: `GenreIndex + (Random() - 0.5) * 0.8`
    - Store these as properties: `yNormal`, `yUniform`.
5.  **Data Structure for Recharts**:
    ```typescript
    interface ProcessedMovie {
        title: string;
        genre: string;
        rating: number; // X-axis
        genreIndex: number;
        jitterNormal: number; 
        jitterUniform: number;
        // Calculated final Y positions for the chart
        yPosNormal: number; // genreIndex + jitterNormal
        yPosUniform: number; // genreIndex + jitterUniform
    }
    ```

## 5. Implementation Steps

1.  **Setup Components**: Create `MovieJitterPlot.tsx` and a sub-component `JitterControls.tsx`.
2.  **Data Loading**: Implement the `useEffect` to fetch and process the data using the Box-Muller transform for the normal distribution.
3.  **Layout Skeleton**: 
    - Create a wrapper with a fixed height (e.g., `h-[600px]`) or allow body scroll. 
    - Add the Segmented Control (Normal | Uniform) at the top.
4.  **Recharts Implementation**:
    - Use `<ResponsiveContainer>` and `<ScatterChart>`.
    - X-Axis: `dataKey="rating"` type="number" domain={[0, 10]}.
    - Y-Axis: `dataKey={viewMode === 'normal' ? 'yPosNormal' : 'yPosUniform'}` type="number" range specific to the number of genres (height).
    - **Custom Axis Tick**: Custom component for Y-Axis to render Genre names clearly.
5.  **Styling**:
    - Apply Tailwind classes for a modern dark/light mode compatible look.
    - Use `framer-motion` (if available via standard CSS transitions or Recharts animation) to smooth the transition between Y-positions when toggling the view.
6.  **Tooltip**: Implement a custom `<Tooltip />` that shows Movie Title, Genre, and Rating with a glassmorphism backdrop.

This plan ensures the original analytical intent (comparing distributions) is preserved while adapting the form factor for mobile usability and aesthetics.