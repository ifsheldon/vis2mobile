# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Source)
- **Type**: Histogram with a Global Mean Overlay.
- **Data**: Distribution of "IMDB Rating" from the `movies.json` dataset.
- **Visual Encoding**:
  - **X-Axis**: Binned quantitative data (IMDB Ratings).
  - **Y-Axis**: Aggregated count (Frequency).
  - **Marks**: Vertical bars representing the count per bin.
  - **Overlay**: A red vertical rule representing the global mean of the ratings.
- **Layout**: Landscape orientation, wide aspect ratio.

### Mobile Rendering Issues (Observation)
- **Aspect Ratio Distortion**: Directly rendering the desktop aspect ratio on mobile (`desktop_on_mobile.png`) results in a squashed view.
- **Bar Thinness**: The bars become extremely thin and hard to distinguish or tap.
- **Label Readability**: Axis labels (rating numbers) and counts would likely become illegible or overlap if not adjusted.
- **Interaction**: Desktop reliance on potential hover states (though Vega-Lite default is often static) translates poorly to touch.

## 2. Transformation Strategy & Action Space

My strategy focuses on maintaining the "Histogram" mental model (Vertical bars) but restructuring the layout to be "Mobile-Native" by using vertical scrolling and a dashboard-style summary.

### L0: Visualization Container
- **Action**: `Rescale` & `Reposition`
- **Reasoning**: The desktop version is wide and short. Mobile screens are narrow and tall. I will change the container to a **Card-based layout**. Instead of a single SVG, the component will be split into a **Summary Header** (showing the calculated Mean) and the **Chart Body**. The Chart height will be increased relative to width (e.g., aspect ratio 1:1 or 4:5) to give bars vertical breathing room.

### L1: Data Model
- **Action**: `Recompose (Aggregate)`
- **Reasoning**: The original Vega-Lite spec performs automatic binning and aggregation. Recharts (the target library) requires pre-processed data. I must implement a data processing function to:
  1.  Fetch the raw JSON.
  2.  Filter valid ratings.
  3.  Calculate the Global Mean.
  4.  Bin the data into defined intervals (e.g., 0.5 or 1.0 steps) and count frequencies.

### L2: Coordinate System & Axes
- **Action**: `Transpose` (Considered but Rejected)
- **Justification**: While horizontal bars are often better for mobile labels, a Histogram represents a frequency distribution where the X-axis is a continuous scale. Rotating it effectively creates a "Population Pyramid" style which might confuse the mental model of "Low to High" ratings going left to right.
- **Action**: `Decimate Ticks` (L4)
- **Reasoning**: To prevent X-axis label clutter on narrow screens, I will only show ticks at integer intervals (1, 2, ... 10) even if the bins are smaller (0.5).

### L2: Emphases (The Mean Line)
- **Action**: `Reposition (Externalize)` & `Enhance`
- **Reasoning**: The red line is the key insight. On mobile, a thin line might be missed.
    1.  **Externalize**: Display the exact Mean value (e.g., "6.4") in a large, bold Stat Card above the chart.
    2.  **Enhance**: Inside the chart, keep the ReferenceLine but make it a dashed, vibrant red line with a label that says "Avg" to save space compared to "Mean".

### L2: Interaction & Feedback
- **Action**: `Fix Tooltip Position` (L5)
- **Reasoning**: Standard floating tooltips get covered by fingers. I will use a **Fixed Tooltip** approach (rendering summary data in a designated area or using a customized Recharts tooltip that snaps to the top of the chart) triggered by touch/drag.

## 3. Data Extraction & Processing Plan

Since the source HTML relies on `vega-datasets` URL, I cannot simply "scrape" coordinates from an SVG string. I must **replicate the data logic** in the component.

1.  **Source**: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/movies.json`
2.  **Processing Logic (TypeScript/JS)**:
    -   Fetch data asynchronously.
    -   Extract `IMDB Rating` field.
    -   **Calculate Mean**: Sum of ratings / Count of ratings.
    -   **Binning**:
        -   Define Bin Size (e.g., 0.5).
        -   Create buckets (0-0.5, 0.5-1.0, etc.).
        -   Iterate through data and increment bucket counts.
    -   **Output Format for Recharts**:
        ```typescript
        [
          { binStart: 1.0, binEnd: 1.5, count: 5, label: "1.0-1.5" },
          { binStart: 1.5, binEnd: 2.0, count: 12, label: "1.5-2.0" },
          ...
        ]
        ```

## 4. Detailed Implementation Steps

1.  **Scaffold Component**: Create `Visualization.tsx` with a responsive wrapper.
2.  **Data Hook**: Implement a `useEffect` to fetch and process the movie data. Show a skeleton loader while processing.
3.  **UI Layout**:
    -   **Header**: Title "Movie Rating Distribution".
    -   **Key Metric**: A prominent card displaying the "Average IMDB Rating" (The Mean) using the extracted color red to link visually to the chart line.
    -   **Chart Area**: A `ResponsiveContainer` wrapping a `BarChart`.
4.  **Chart Construction**:
    -   **XAxis**: Numeric axis representing rating bins. Use `tickFormatter` to show simplified labels.
    -   **YAxis**: Hide the axis line (`Recompose-Remove`), only show gridlines for guidance.
    -   **Bar**: Use a gradient fill (Purple/Blue) to look modern.
    -   **ReferenceLine**: Render the calculated Mean as a vertical red dashed line.
    -   **Tooltip**: Custom styled component, triggered on tap/hover.
5.  **Styling**: Apply Glassmorphism (background blur, translucent borders) to the container. Use Tailwind for typography and spacing. Ensure touch targets are adequate.

## 5. Summary of Design Choices vs Action Space

| Feature | Action | Reason |
| :--- | :--- | :--- |
| **Container** | `Rescale` / `Vertical Stack` | Fit mobile width, create space for vertical bars. |
| **Data** | `Recompose (Aggregate)` | Raw data needs binning to match Histogram type. |
| **Ticks** | `Decimate Ticks` | Prevent X-axis label overlap on 360px screens. |
| **Mean Line** | `Externalize` + `Emphasis` | Show value in header for readability; Keep line for context. |
| **Interactivity**| `Fix Tooltip` | improved touch UX. |
| **Aesthetics** | Modern UI | Premium feel (Gradients, Glassmorphism). |