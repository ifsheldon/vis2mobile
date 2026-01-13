# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### 1.1 Desktop Version Overview
- **Type**: 2D Histogram / Heatmap with text labels.
- **Axes**:
    - **Y-Axis**: "Origin" (Europe, Japan, USA) - Categorical, 3 items.
    - **X-Axis**: "Cylinders" (3, 4, 5, 6, 8) - Ordinal, 5 items.
- **Visual Encoding**:
    - **Color**: Encodes count of records (Sequential Gradient: light yellow-green to dark blue).
    - **Text**: Displays the exact numeric count inside each cell. Text color adapts (black/white) based on cell background darkness.
- **Narrative**: Comparing the frequency of car models based on their origin and cylinder count. Key insight is that USA dominates 8-cylinder cars, while Japan/Europe cluster around 4 cylinders.

### 1.2 Mobile Adaptation Challenges
- **Aspect Ratio**: The desktop chart is wide. Direct scaling (`desktop_on_mobile.png`) results in tiny cells and unreadable numbers.
- **Interactivity**: The desktop version likely relies on hover for precise data or just visual scanning. On mobile, touch targets (cells) are too small in the original orientation.
- **Readability**: The font size inside the cells in the mobile aspect ratio render is below readable thresholds (likely < 10px).
- **Layout**: Placing "Cylinders" (5 items) on the horizontal axis might be cramped on narrower phones, whereas "Origin" (3 items) fits the horizontal space better.

## 2. Design Action Space Planning

### 2.1 High-Level Strategy
I will transform this static SVG heatmap into a responsive **CSS-Grid based Heatmap Component**. While Recharts is the preferred library, standard SVG charting libraries are often rigid for "Grid Heatmaps" where text centering, border radius, and fluid responsiveness are required for a "premium" feel. A native React + Tailwind Grid implementation offers superior control over the L2 DataMarks and L5 Labels for this specific chart type.

### 2.2 Action Plan by Layer

| Layer | Component | Action | Reasoning |
| :--- | :--- | :--- | :--- |
| **L0** | **Container** | **Rescale** | Use a full-width card container with glassmorphism effects. Ensure the height adapts to the content rather than a fixed aspect ratio. |
| **L2** | **CoordSys** | **Transpose (Axis-Transpose)** | **Crucial Step**: Swap X and Y axes. <br> **New X-Axis**: Origin (3 items). <br> **New Y-Axis**: Cylinders (5 items). <br> *Why?* Splitting the screen width into 3 columns allows for larger, touch-friendly cells than splitting it into 5. Vertical scrolling (if needed) works better for the "Cylinders" list. |
| **L2** | **DataMarks** | **Rescale & Style** | Convert simple rects to rounded "cards" (MarkInstance). Add subtle layout animations (`framer-motion`) when the component mounts. |
| **L3** | **Axes** | **Reposition (Sticky)** | Make the column headers (Origins) sticky at the top if the list gets long (though here it's short, it's good practice). |
| **L3** | **Legend** | **Reposition & Rescale** | Move the gradient legend to the **top** of the card (LegendBlock). Make it a slim, full-width gradient bar below the title to save vertical space. |
| **L5** | **Labels** | **Rescale & Contrast** | Ensure numbers are large (text-lg or text-xl) and font-weight is bold. Dynamically calculate text color (white/black) based on the cell's background color luminance for accessibility. |
| **L5** | **Interactions** | **Trigger (Tap)** | **New Action**: Add a tap interaction. Tapping a cell highlights it and dims others (Focus Mode), showing a bottom sheet or expanded detail view if necessary (though the number is already visible, focus helps reading). |
| **L1** | **DataModel** | **Recompose (Aggregate)** | The data is already aggregated. I will map the raw values into a structured JSON suitable for rendering the grid. |

### 2.3 Justification for Deviating from Action Space
- **CSS Grid instead of SVG/Recharts**: While not an "Action" in the document, switching the rendering engine for Heatmaps is a known best practice in Responsive Web Design. SVG text scaling is painful on mobile; HTML text inside Flex/Grid containers handles accessibility and responsiveness naturally.

## 3. Data Extraction and Transformation

I will extract the data directly from the visual clues in `desktop.png` and `desktop.html`.

**Dimensions:**
- **Origins** (Columns): Europe, Japan, USA
- **Cylinders** (Rows): 3, 4, 5, 6, 8

**Data Points (Extracted Matrix):**

| Cylinders | Europe | Japan | USA |
| :--- | :--- | :--- | :--- |
| **3** | null | 4 | null |
| **4** | 66 | 69 | 72 |
| **5** | 3 | null | null |
| **6** | 4 | 6 | 74 |
| **8** | null | null | 108 |

**Color Scale (Approximate):**
- **Min (0)**: Light Yellow-Green (`#f7fcb9`)
- **Mid**: Teal/Green (`#addd8e`)
- **Max (108)**: Dark Blue (`#081d58`)
- I will implement a utility function to generate these interpolated colors or use a discrete class-based scale if preferred, but interpolation feels more premium.

## 4. Implementation Steps

### 4.1 Component Structure
1.  **Header**: Title ("Cars by Origin & Cylinders") and a gradient bar legend representing the scale (0 to 108).
2.  **Grid Layout**:
    -   A CSS Grid with `grid-cols-[auto_1fr_1fr_1fr]`.
    -   First column: Cylinder Labels (Sticky left or just aligned).
    -   Next 3 columns: The data cells for Europe, Japan, USA.
3.  **Data Cells**:
    -   Rounded rectangles (`rounded-lg`).
    -   Background color calculated based on value.
    -   Centered Text displaying the count.
    -   `null`/0 values rendered as empty light gray slots or low-opacity slots to reduce visual clutter (Emphasis - Highlight).

### 4.2 Technical Specs
-   **Framework**: Next.js 14
-   **Styling**: Tailwind CSS for grid layout and typography.
-   **Utils**: `d3-scale` (or simple math) for color interpolation (`scaleSequential`). `d3-interpolate` for the "YellowGreenBlue" scheme.
-   **Animation**: `framer-motion` for staggering the appearance of cells.

### 4.3 Mobile Optimizations
-   **Touch Targets**: Cells will have a minimum height of 48px.
-   **Typography**: Use `tabular-nums` for the counts to align them nicely.
-   **Contrast**: Implementation of a `getContrastColor(hex)` helper to switch text between white and black/slate-900.