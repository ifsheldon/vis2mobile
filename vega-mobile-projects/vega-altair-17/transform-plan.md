# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Characteristics
- **Type**: Faceted Dot Plot (also known as a Trellis Plot or Cleveland Dot Plot).
- **Data Structure**:
    - **Dimensions**: Site (Facet Row), Variety (Y-axis), Year (Color).
    - **Measure**: Yield (X-axis).
- **Layout**: 6 vertical panels (Sites), sharing a common X-axis scale (Yield 20-60+).
- **Encoding**:
    - Two colored points per row (Blue: 1932, Orange: 1931).
    - Position along X-axis indicates yield.
    - Facets group data by geographical site.
- **Observations**: The visualization effectively allows comparison of yields across varieties within a site and highlights the "Morris Mistake" (where 1931/1932 yields might be swapped compared to other sites).

### Mobile Readability Issues (Simulated)
1.  **Extreme Vertical Length**: Stacking 6 charts vertically on a phone results in excessive scrolling, making it impossible to compare the first site (University Farm) with the last (Duluth).
2.  **Horizontal Compression**: The variety labels (e.g., "Wisconsin No. 38") are long. In a standard side-by-side layout, they squeeze the data plotting area, making the differences in yield (the dots) clump together and hard to read.
3.  **Small Touch Targets**: The dots are too small for touch interaction to see specific values.
4.  **Legend Separation**: The legend is far from the data in a long scroll scenario.

## 2. High-Level Transformation Strategy

The core strategy is to transform the **Small Multiples (Facets)** into a **Interactive Navigation (Tabs/Pagination)** pattern to save vertical space, and to transform the **Row Layout** into a **Serialized Stack** to save horizontal space.

### Key Design Actions (From Action Space)

#### 1. L1 Chart Components: `PaginatePanels` (Small Multiple Transformation)
-   **Action**: Transform the vertically stacked facets (Sites) into a **Tabbed Interface** or **Carousel**.
-   **Reasoning**: Showing 6 sites simultaneously on mobile destroys the aspect ratio or forces infinite scrolling. By showing one site at a time with a switcher, we preserve the fidelity of the dot plot for the active site.
-   **Justification**: This aligns with the "Split states" strategy in the design space.

#### 2. L3 MarkSet: `Serialize Layout` (Label-Marks Relation)
-   **Action**: Instead of placing Variety labels *to the left* of the chart (consuming ~40% of width), place the label **above** the data track for each row.
-   **Reasoning**: This liberates 100% of the screen width for the quantitative axis (Yield). This maximizes the resolution of the data, making small differences between 1931 and 1932 visible.

#### 3. L2 Data Marks: `Recompose (Change Encoding)` -> Dumbbell Plot
-   **Action**: Explicitly connect the two dots (1931 and 1932) with a line.
-   **Reasoning**: The cognitive task is comparing the *change* or *difference* between years. A connector line emphasizes this relationship better than floating dots, especially on a mobile screen where context can be lost.

#### 4. L5 Interaction: `Fix Tooltip Position` & `Disable Hover`
-   **Action**: Remove hover. When a user taps a specific variety row, display detailed yield numbers in a fixed bottom sheet or a highlighted summary card at the top.
-   **Reasoning**: Fingers obscure tooltips. A dedicated data readout area ensures readability.

## 3. Detailed Implementation Plan

### Step 1: Data Extraction & Processing
1.  **Extract**: Copy the JSON array from the `data-9cc0564cb5591205eeeca8d2429dd11b` object in the source HTML.
2.  **Transform**:
    -   Group data by `site`.
    -   Within each site, group by `variety` to create objects containing both 1931 and 1932 values (e.g., `{ variety: "Manchuria", yield1931: 27, yield1932: 26.9 }`).
    -   Calculate min/max yield across *all* data to establish a global X-axis domain (ensuring visual consistency when switching tabs).

### Step 2: Container & Navigation (L0 & L1)
1.  **Layout**: Create a main container with `h-screen` and `flex-col`.
2.  **Site Selector**: Implement a horizontal scrollable list (Pills/Tabs) at the top to select the `Site`.
    -   *Styling*: Glassmorphism active state, muted inactive state.
3.  **Main Chart Area**: A responsive container taking up the remaining height.

### Step 3: Visualization Component (Recharts)
1.  **Component**: Use a customized `ScatterChart` or composite layout.
2.  **Y-Axis**: Hidden (`width={0}`). We will render labels externally to the chart area to control layout (Label above Bar).
3.  **X-Axis**:
    -   `type="number"`.
    -   Domain: Fixed based on global min/max (approx 10 to 70) to allow mental comparison between sites.
    -   Move Axis to top or bottom, simplify ticks (Steps of 10).
4.  **Custom Rendering**:
    -   Iterate through the varieties of the selected site.
    -   For each variety, render a "Card" or "Row":
        -   **Text Row**: Variety Name (Bold, legible font).
        -   **Chart Row**: A minimal Recharts instance (height ~40px) or SVG drawing just for this row (Dumbbell style).
        -   *Alternative (Better for Recharts)*: One single tall chart, but use `Customized` SVG components to draw the labels *inside* the plot area at specific Y coordinates, or simply map data to Y-index and render labels as HTML overlays.
    -   *Decision*: Render a list of HTML `div`s. Inside each `div`:
        -   Header: Variety Name.
        -   Body: A purely horizontal linear visualization (SVG or Recharts container) showing the 1931/1932 dots and connector.
        -   *Why*: This gives easier control over the "Label above Mark" layout than hacking Recharts Y-Axis.

### Step 4: Aesthetics & Interaction
1.  **Palette**:
    -   1931: Amber/Orange (Matches original "1931" loosely, high contrast).
    -   1932: Indigo/Blue (Matches original "1932", high contrast).
    -   Background: Dark/Glassmorphism suited for mobile "premium" feel.
2.  **Animations**:
    -   Use `framer-motion` for switching between Sites (slide/fade effect).
    -   Animate the dots growing into position.
3.  **Interactivity**:
    -   Tap a row to highlight it and show precise values (e.g., "1931: 27 vs 1932: 26.9 (+0.1)") in a "Heads Up Display" or just expand the row slightly to reveal text numbers.

## 4. Data Extraction

The data will be extracted directly from the `spec.datasets` field in the provided HTML.

**Sample Structure to be used in Typescript:**

```typescript
type BarleyData = {
  yield: number;
  variety: string;
  year: number;
  site: string;
};

// Extracted from source
const rawData: BarleyData[] = [
  {"yield": 27, "variety": "Manchuria", "year": 1931, "site": "University Farm"},
  {"yield": 48.86667, "variety": "Manchuria", "year": 1931, "site": "Waseca"},
  // ... rest of the 120 records
];
```

**Processed Structure for Component:**

```typescript
type ProcessedSiteData = {
  site: string;
  varieties: {
    name: string;
    yield1931: number;
    yield1932: number;
    diff: number; // For sorting or color coding delta
  }[];
};
```

This plan ensures the "Morris Mistake" narrative (the anomaly in the Morris site data) remains discoverable while making the chart actually usable on a mobile device.