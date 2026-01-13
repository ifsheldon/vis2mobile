# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Faceted Grouped Bar Chart with Error Bars.
- **Structure**: The chart is faceted by `site` (6 columns). Within each facet, data is grouped by `year` (1931 vs 1932).
- **Encodings**:
    - **X-axis**: Year (Categorical/Ordinal) - nested within Site.
    - **Y-axis**: Mean Yield (Quantitative).
    - **Color**: Year (Blue for 1931, Orange for 1932).
    - **Mark**: Bar (Mean) + Error Bar (Confidence Interval).
- **Data Intent**: Compare the yield performance of two specific years across six different agricultural sites.

### Mobile Rendering Issues (Desktop on Mobile)
- **Aspect Ratio Conflict**: The horizontal arrangement of 6 facets forces the chart to be extremely wide. On a mobile screen, this results in either extreme scaling (making text unreadable) or horizontal scrolling (hiding context).
- **Label Readability**: Site names like "University Farm" and "Grand Rapids" are long. In a vertical column layout, they will overlap or require extreme rotation/wrapping.
- **Whitespace**: Faceting creates redundant axes and whitespace that consumes valuable mobile real estate.
- **Touch Targets**: Thin bars in a compressed view are hard to tap for details.

## 2. High-Level Strategy & Design Action Space

The core transformation strategy is **"Transpose & Serialize"**. We will move from a horizontal faceted layout to a vertical list of cards (Serialize), and switch the internal chart orientation from vertical columns to horizontal bars (Transpose) to accommodate long site names.

### Applied Design Actions

#### **L1 Chart Components (Layout)**
*   **Action**: `Serialize layout` (L1 Chart Components -> Transpose)
*   **Reasoning**: Instead of 6 columns side-by-side (which fails on narrow screens), we will stack the sites vertically. Each Site becomes a distinct "Card" component. This utilizes the natural vertical scrolling behavior of mobile devices.

#### **L2 Coordinate System**
*   **Action**: `Transpose Axes` (L2 Coordinate System -> Transpose)
*   **Reasoning**: We will convert the Vertical Bar Chart to a **Horizontal Bar Chart**.
    *   *Justification*: Long labels ("University Farm") read naturally on the left of a horizontal bar. Vertical bars would require rotating these labels 90 degrees or abbreviating them, reducing readability.

#### **L2 Data Marks**
*   **Action**: `Rescale` (L4 Mark Instance)
*   **Reasoning**: Increase the thickness (height) of the bars to be touch-friendly (finger-sized tap targets).
*   **Action**: `Recompose (Change Encoding)` (L2 Data Marks)
*   **Reasoning**: While we keep the bar length for Mean Yield, we will redesign the Error Bar. Instead of a standard black line, we can use a semi-transparent "pill" overlay or a distinct marker to make it look "Premium" and less like a scientific paper default.

#### **L3 Axes & Ticks**
*   **Action**: `Recompose (Remove)` (L4 Axis Line / L3 Gridlines)
*   **Reasoning**: Remove the vertical gridlines and axis lines inside every card to reduce noise ("Chart Junk"). We will use data labels or a subtle background grid.
*   **Action**: `Simplify labels` (L5 Tick Label)
*   **Reasoning**: The Yield axis (0-60) doesn't need to be repeated 6 times. We can either put a shared axis at the top (sticky) or, better for mobile, put the numerical value directly inside or next to the bar (Direct Labeling).

#### **L3 Legend**
*   **Action**: `Reposition` (L3 Legend Block)
*   **Reasoning**: Move the legend from the right side to a sticky header or a clear indicator at the top of the list. Since there are only two categories (1931, 1932), we can also use color-coded badges on the cards.

#### **L5 Interaction & Feedback**
*   **Action**: `Fix tooltip position` (L2 Feedback)
*   **Reasoning**: Instead of a hover tooltip, tapping a site card will trigger a specific state or show detailed numbers (Mean + Exact CI range) in a fixed bottom sheet or an expanded card view.

## 3. Data Extraction Plan

The data is embedded in the HTML file within the `spec` variable.

1.  **Source**: Identify `spec.datasets["data-9cc0564cb5591205eeeca8d2429dd11b"]`.
2.  **Raw Data Fields**: `yield`, `variety`, `year`, `site`.
3.  **Transformation Logic (Crucial Step)**:
    *   The raw data lists individual yields for different varieties. The visualization shows **Mean Yield** and **Confidence Intervals**.
    *   We cannot just plot the raw points. We must perform the aggregation:
        *   Group by `site` and `year`.
        *   Calculate `Mean`: $\frac{\sum yield}{count}$.
        *   Calculate `Standard Error` or `CI`: The original spec uses `extent: "ci"`. We need to calculate the 95% Confidence Interval for the error bars.
        *   Formula: $Mean \pm 1.96 \times \frac{\sigma}{\sqrt{n}}$ (Standard Deviation / sqrt of count).
4.  **Output Structure for Component**:
    ```typescript
    type SiteData = {
      site: string;
      years: {
        year: number;
        meanYield: number;
        ciMin: number;
        ciMax: number;
      }[];
    }
    ```

## 4. Implementation Steps

### Step 1: Data Processing Utility
*   Create a utility function to parse the raw JSON data.
*   Implement the statistical aggregation (Mean and CI calculation) grouped by Site and Year.
*   **No fake data**. Use the exact numbers from the source.

### Step 2: Component Structure (Mobile-First)
*   **Main Container**: A centered, max-width constrained container (e.g., `max-w-md`) to simulate mobile physics on desktop screens.
*   **Header**: Sticky header showing the Title and a clear Legend (Color keys for 1931 vs 1932).
*   **List Layout**: A vertical stack of `SiteCard` components.

### Step 3: SiteCard Component
*   **Header**: Site Name (Left aligned, bold typography).
*   **Chart Area**:
    *   Use `Recharts` ComposedChart with `layout="vertical"`.
    *   **XAxis**: Type number (Yield), hide axis line to reduce clutter.
    *   **YAxis**: Type category (Year), but effectively hidden or simplified since we color-code.
    *   **Bars**: Two horizontal bars per card.
    *   **Error Bars**: Use Recharts `<ErrorBar />` component or custom shape.
*   **Styling**: Use Tailwind for glassmorphism (bg-opacity, blur), rounded corners, and soft shadows.
*   **Color Palette**: Use a modern equivalent of the original.
    *   1931: Indigo-500 (Modern Blue)
    *   1932: Rose-500 or Amber-500 (Modern Orange).

### Step 4: Interaction & Polish
*   Add **LabelList** to bars so users don't have to guess the value.
*   Add animation: Bars grow from left to right on scroll (using Framer Motion or Recharts default animation).
*   Ensure typography follows a hierarchy: Site Name > Yield Value > Year Label.

### Step 5: Verification
*   Check if "University Farm" fits without wrapping.
*   Check if Error Bars are visible and accurately reflect the calculated CI.
*   Ensure vertical scrolling feels natural.