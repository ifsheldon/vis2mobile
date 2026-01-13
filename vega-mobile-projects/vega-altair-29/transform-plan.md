# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

The original visualization is a **Multi-Series Line Chart** showing the stock price evolution of five major tech companies (MSFT, AMZN, GOOG, IBM, AAPL) from Jan 2000 to Mar 2010.

**Key Visual Elements:**
*   **Data Marks:** 5 distinct colored lines representing different stock symbols.
*   **Reference Mark:** A horizontal red line representing the global average price across all data points (approx value ~420).
*   **X-Axis:** Temporal (Date), spanning 10 years.
*   **Y-Axis:** Quantitative (Price), range 0 - ~700.
*   **Legend:** Located on the right side, mapping symbols to colors.
*   **Gridlines:** Full background grid.

**Issues in Mobile Context (Desktop-on-Mobile):**
*   **Horizontal Squish:** The 10-year timespan is compressed into a narrow viewport, causing the lines to appear jittery and overlapping, especially in the 2000-2004 period where prices were lower and closer together.
*   **Inefficient Legend:** The right-aligned legend consumes approximately 20% of the horizontal width, which is the scarcest resource on mobile.
*   **Touch Targets:** Selecting a specific point on a specific line via touch is nearly impossible due to line density.
*   **Visual Noise:** The red average line adds noise. On mobile, the intersection of 5 fluctuating lines plus a static average line creates high cognitive load.

## 2. High-Level Plan & Reasoning

My strategy is to transform this into an **Interactive Financial Dashboard Card**. Instead of a static image, users will interact with the data through filtering and touch exploration.

### L0: Visualization Container
*   **Action: `Rescale`**: Set width to 100% and height to a fixed mobile-friendly aspect ratio (e.g., 350px height).
*   **Action: `Reposition`**: Remove the heavy margins used in the HTML `body` and maximize screen real estate usage.

### L2: Auxiliary Components (Legend)
*   **Action: `Reposition` & `Compensate (Toggle)`**:
    *   *Reasoning:* The right-side legend is unacceptable for mobile.
    *   *Plan:* Move the legend to the **top** as a scrollable or wrapped row of "Filter Chips".
    *   *Interaction:* Tapping a chip will toggle the visibility of that specific line. This solves the "Overplotting" issue by allowing the user to focus on 1 or 2 stocks at a time.

### L3: Axes & Ticks
*   **Action: `Decimate Ticks` (X-Axis)**:
    *   *Reasoning:* Showing every year might crowd the axis.
    *   *Plan:* Show fewer ticks (e.g., every 2 years) or rely on the Tooltip for exact dates.
*   **Action: `Format Tick Label` (X-Axis)**:
    *   *Reasoning:* "2000", "2001" is okay, but "'00", "'01" saves space. I will stick to full year if space permits (4 digits), but reduce the frequency.
*   **Action: `Recompose (Remove)` (Y-Axis Title)**:
    *   *Reasoning:* The label "price, Average of price" is rotated and hard to read.
    *   *Plan:* Move unit information (USD) to the main title or the tooltip, removing the axis title to save horizontal pixels.

### L2: Data Marks (The Lines)
*   **Action: `Rescale (Mark Instance)`**:
    *   *Reasoning:* 1px lines are hard to see.
    *   *Plan:* Increase stroke width to 2px for better visibility. Highlight the "active" line (hovered/selected) with a thicker stroke (3px) and dim others.
*   **Action: `Recompose (Average Rule)`**:
    *   *Reasoning:* The red rule representing the average is useful context but distracting if dominant.
    *   *Plan:* Keep it as a `ReferenceLine` but make it dashed and subtle. Add a label on the right side of the chart area so users know what it is without checking a legend.

### L5: Interaction & Feedback
*   **Action: `Reposition (Fix Tooltip Position)`**:
    *   *Reasoning:* Standard floating tooltips are blocked by the user's finger on mobile.
    *   *Plan:* Use a **"Summary Header"** or a fixed tooltip at the top of the chart container. When the user scrubs across the chart, the values in the header update dynamically.
*   **Action: `Triggers (Replace Hover with Touch)`**:
    *   *Plan:* Enable `onTouch` scrubbing on the chart area to snap to the nearest time index.

## 3. Data Extraction Plan

The data is embedded in the HTML script tag within the `spec` variable.

**Extraction Steps:**
1.  Locate `spec.datasets['data-b0fe595546d47c5085f225c35730172c']`.
2.  The data is a flat array of objects: `[{ "symbol": "MSFT", "date": "2000-01-01...", "price": 39.81 }, ...]`.
3.  **Transformation for Recharts:** Recharts requires data grouped by the X-axis key (Date).
    *   Parse the ISO dates.
    *   Group by unique `date`.
    *   Create a derived dataset:
        ```json
        [
          {
            "date": "2000-01-01",
            "MSFT": 39.81,
            "AMZN": 64.56,
            "IBM": 100.52,
            "AAPL": 25.94,
            "GOOG": null // GOOG didn't exist yet
          },
          ...
        ]
        ```
4.  **Calculate Global Average:**
    *   The original Vega spec calculates `average` of `price` across the entire dataset for the red rule.
    *   I will programmatically calculate: `Sum(all_prices) / Count(all_prices)` to get the value for the static reference line.

## 4. Implementation Steps

### Step 1: Component Structure & Layout (Mobile-First)
*   Create a main container with a modern card style (rounded corners, subtle shadow/border).
*   Header section: Title ("Tech Giants Stock Price") and a dynamic "Current Value" display area (acts as the fixed tooltip).
*   Controls section: A flex-wrap container of filter chips (buttons) for each stock symbol (MSFT, AMZN, GOOG, IBM, AAPL). These will be colored to match their respective lines.

### Step 2: Data Processing
*   Write a utility function to transform the flat JSON into the Pivot format required by Recharts.
*   Calculate the global average price for the reference line.
*   Define a color palette map:
    *   MSFT: Blue
    *   AMZN: Orange
    *   GOOG: Red/Rose
    *   IBM: Violet/Indigo
    *   AAPL: Emerald/Green

### Step 3: Visualization Implementation (Recharts)
*   Use `ResponsiveContainer` -> `ComposedChart`.
*   **X-Axis:** `dataKey="date"`, format tick as Year. Use `minTickGap` to prevent overlapping.
*   **Y-Axis:** Hide axis line, keep tick labels, format as currency ($).
*   **Lines:** Render 5 `Line` components.
    *   Bind `stroke` color to the palette.
    *   Bind `hide` prop to the state of the filter chips.
    *   Use `connectNulls={true}` because GOOG starts later (2004).
*   **ReferenceLine:** Render the calculated average at Y = ~420 with a label "Avg".
*   **Tooltip:** Use a custom `Tooltip` component or, preferably, the "Summary Header" approach managed via `onMouseMove` / `onTouchMove` state.

### Step 4: Styling & Polish
*   Apply **Glassmorphism**: Use semi-transparent backgrounds for the chips and active states.
*   **Typography**: Use `Inter` or system fonts with tight tracking. Ensure text is `text-sm` or `text-xs` but high contrast.
*   **Animation**: Add `isAnimationActive` to lines for a smooth entry. Add transition effects to the filter chips.

### Step 5: Readability Check
*   Ensure the chart has enough height (min 300px) so the lines aren't flat.
*   Ensure that if all lines are enabled, the user can still distinguish them (using distinct colors).
*   Ensure that if GOOG is missing in early years, the line just starts midway (handled by data structure).