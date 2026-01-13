# Vis2Mobile Transformation Plan

## 1. Analysis of the Original Visualization

### 1.1 Desktop Version Overview
*   **Type**: Trellis (Faceted) Dot Plot.
*   **Data Structure**:
    *   **Row Facet (Site)**: 6 distinct locations (Grand Rapids, Duluth, University Farm, Morris, Crookston, Waseca).
    *   **Y-Axis (Nominal)**: 10 Barley Varieties (Manchuria, Glabron, etc.).
    *   **X-Axis (Quantitative)**: Yield (bushels/acre).
    *   **Color (Nominal)**: Year (1931 vs 1932).
*   **Narrative**: Comparing barley yields across different sites and varieties between two years. A key insight in this famous dataset (Becker's Barley) is the "Morris Mistake," where the yields for 1931 and 1932 appear swapped compared to other sites.
*   **Visual density**: High. It shows roughly 120 data points spread across 6 separate coordinate systems stacked vertically.

### 1.2 Mobile Aspect Ratio Issues (`desktop_on_mobile.png`)
*   **Vertical Compression**: Stacked facets force the Y-axis labels (Varieties) to be microscopic or overlap.
*   **Unreadable Labels**: The X-axis title and tick labels are illegible.
*   **Touch Targets**: The data points (circles) are too small for touch interaction.
*   **Context Loss**: Scrolling through a very tall image makes it hard to remember the legend or axis context by the time the user reaches the bottom charts.

## 2. High-Level Strategy & Design Action Space

To transform this into a premium mobile component, we must solve the vertical space constraint. The "Small Multiples" (Facets) approach used on desktop is visually overwhelming on a narrow mobile screen.

### Key Actions Selected from Design Space

#### 1. L1/L3 Small Multiples: `PaginatePanels` / `FilterPanels`
*   **Action**: **Split states / Paginate**.
*   **Reasoning**: Displaying 6 charts vertically is unreadable. I will transform the **Row Facet (Site)** into a **Tabbed Interface** or **Horizontal Scroll Selector**.
*   **Benefit**: This allows the active chart to utilize the full screen width and sufficient height for readable text, while keeping the user context focused on one site at a time.

#### 2. L2 Data Marks: `Rescale` & `Recompose (Change Encoding)`
*   **Action**: **Rescale** marks and **Dumbbell Plot Encoding**.
*   **Reasoning**:
    *   *Rescale*: Increase the dot radius (`r`) for better visibility and touch usage.
    *   *Change Encoding*: The original dots are floating. To enhance the comparison between 1931 and 1932 (the core narrative), I will connect the two dots for each variety with a line (creating a Dumbbell/DNA plot). This helps the eye group the years per variety without needing gridlines.

#### 3. L5 Interaction: `Fix Tooltip Position` & `Triggers`
*   **Action**: **Reposition (Fix)** and **Recompose (Replace)**.
*   **Reasoning**: Hover is unavailable.
    *   *Trigger*: Clicking a variety row will trigger the details.
    *   *Feedback*: Instead of a floating tooltip, use a **Fixed Bottom Sheet** or a dedicated "Details Card" at the top/bottom of the view to show the precise yield numbers for both years for the selected variety.

#### 4. L3 Axes: `Rescale` & `Simplify Labels`
*   **Action**: **Rescale** font sizes and **Simplify**.
*   **Reasoning**:
    *   Y-Axis (Varieties): Needs roughly 12-14px font size to be readable.
    *   X-Axis (Yield): Keep the grid, but potentially reduce tick count (`decimateTicks`) to prevent overcrowding.

#### 5. L3 Legend: `Reposition`
*   **Action**: **Reposition** to Top/Inline.
*   **Reasoning**: Move the Year legend (1931 vs 1932) to the top header area so it is visible immediately without scrolling.

## 3. Implementation Plan

### Step 1: Data Extraction & Preparation
*   Extract the `data-9cc0564cb5591205eeeca8d2429dd11b` array from the HTML source.
*   Type definition: `BarleyData { yield: number, variety: string, year: number, site: string }`.
*   **Transformation**: Group the flat data by `site`. Within each site, group by `variety` to create objects containing both 1931 and 1932 yields.
    *   Target structure: `Record<SiteName, Array<{ variety: string, yield1931: number, yield1932: number }>>`.
    *   Sort varieties by yield (sum of both years) to maintain the "sorted" intention of the original chart.

### Step 2: Container & Layout Structure (L0)
*   **Header**:
    *   Title: "Barley Yield Analysis".
    *   Legend: Visual indicators for 1931 (e.g., Purple) and 1932 (e.g., Teal) using Lucide icons or colored badges.
*   **Navigation (The "Facet" Replacement)**:
    *   Implement a horizontal scrolling list or distinct tabs for the 6 Sites.
    *   Use Glassmorphism styling for the active tab to indicate selection.

### Step 3: Visualization Component (L1 Chart)
*   Use `Recharts`:
    *   **Type**: `ComposedChart` with Layout `vertical`.
    *   **XAxis**: Type `number`, representing Yield.
    *   **YAxis**: Type `category`, dataKey `variety`. Ensure `width` is sufficient for text labels (approx 80-100px) or allow text wrapping.
    *   **Grid**: Vertical `CartesianGrid` (opacity reduced).
    *   **Marks**:
        *   Custom `Scatter` or `Line` segments to draw the "dumbbell" connector.
        *   Two `Scatter` series: One for 1931, one for 1932.
*   **Styling**:
    *   1931 Color: A cool tone (e.g., Indigo-500).
    *   1932 Color: A warm tone (e.g., Amber-500) or contrasting cool tone (e.g., Cyan-400) to match "Premium Aesthetics".
    *   Background: Dark/Glassmorphic container.

### Step 4: Interaction & Details (L5)
*   **Active State**: Utilize a React state `activeData` to track which variety is clicked.
*   **Detail View**: When a user taps a row (Variety), highlight that row (opacity change on others) and display a "Card" overlay or inline expansion showing the exact difference (Delta) between 1931 and 1932.

## 4. Data Extraction Strategy

I will copy the JSON array directly from the source HTML's `spec.datasets` object.

**Source Data Sample:**
```json
[
  {"yield": 27, "variety": "Manchuria", "year": 1931, "site": "University Farm"},
  {"yield": 48.86667, "variety": "Manchuria", "year": 1931, "site": "Waseca"},
  ...
]
```

**Processing Logic (Pseudo-code):**
1.  `const rawData = [...]`
2.  `const sites = unique(rawData.map(d => d.site))`
3.  `const groupedBySite = sites.map(site => { return { site, data: processSiteData(site) } })`
4.  `processSiteData`: Filter by site -> Pivot years to columns -> Calculate Total Yield (for sorting) -> Sort Descending.

## 5. Justification for Deviations
*   **Removing Simultaneous Facets**: The original desktop view shows all sites at once to allow vertical scanning for patterns (like the Morris site having swapped years). On mobile, this vertical scanning is physically impossible without extreme scrolling or shrinking. The **Tabbed** approach sacrifices simultaneous comparison for **readability**. To compensate, I will ensure the transition between tabs is smooth (animation), allowing the user to "flip" through sites to spot the pattern shift.