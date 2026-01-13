# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version (Original)
- **Type**: Horizontal Error Bar Chart (Dot Plot with intervals).
- **Data Source**: Barley Yield dataset. Aggregated by `variety`.
- **Dimensions**: 500px width x 160px height.
- **Visual Encoding**:
    - **Y-Axis**: Nominal categories (`variety`).
    - **X-Axis**: Quantitative (`yield`).
    - **Marks**: Black square (mean), black line (interval).
- **Interaction**: A standard HTML `<select>` dropdown changes the error measure (95% CI, SE, Stdev, IQR).
- **Aesthetics**: Functional, academic style. Black and white.

### Issues on Mobile (Simulated)
1.  **Aspect Ratio**: The 160px height is far too condensed for a mobile column layout.
2.  **Label Readability**: `variety` names (e.g., "Wisconsin No. 38") are long. In a side-by-side layout (Label | Chart), the text consumes 40-50% of the screen width, compressing the actual data visualization.
3.  **Touch Targets**: The native dropdown is small and hard to reach at the top-left.
4.  **Data Density**: The bars are too close together in the `desktop_on_mobile` render.

## 2. Design Action Space Plan

To transform this into a premium mobile component, I will apply the following actions from the Vis2Mobile Design Space:

### L0: Visualization Container
- **Action: `Rescale` (Resize)**
    - *Reason*: The original fixed dimensions (500x160) are unsuitable. The container will be set to `width: 100%` to fit the mobile viewport. The height will be dynamic (`auto` or calculated based on data count) to allow vertical scrolling, ensuring the chart isn't cramped.

### L1: Interaction Layer
- **Action: `Recompose (Replace)`**
    - *Reason*: The native `<select>` dropdown is unpolished. I will replace it with a horizontal **Segmented Control** or a sticky **Filter Bar** using React state. This improves touch targets and accessibility.

### L3: Axes (Y-Axis - Variety)
- **Action: `Reposition` (Label Placement)**
    - *Reason*: Instead of placing labels to the left of the bars (which steals horizontal space), I will move the category labels to sit **above** the data bars.
    - *Mechanism*: This creates a "List Item" layout where each row consists of:
        1. Text: Variety Name (Top)
        2. Viz: Error Bar (Bottom, Full Width)
    - *Benefit*: This maximizes the resolution of the X-axis (Yield), making differences in error bars easier to see on narrow screens.

### L3: Axes (X-Axis - Yield)
- **Action: `Rescale` (Range)**
    - *Reason*: The axis needs to span the full available width of the card.
- **Action: `Decimate Ticks`**
    - *Reason*: Reduce the number of X-axis ticks to 3-4 (e.g., Min, Mid, Max) to prevent clutter on small screens.

### L2: Data Marks
- **Action: `Rescale` (Mark Size)**
    - *Reason*: Touch screens require bolder visuals. I will increase the size of the mean dot and the thickness of the error bar lines to improve visibility.
- **Action: `Recompose (Change Encoding)` (Color)**
    - *Reason*: The original "Black" is stark. I will use a premium color palette (e.g., Indigo for mean, Slate-400 for range) to separate the "Mean" from the "Interval" visually, adding hierarchy.

## 3. Implementation Steps

1.  **Data Preparation (Codify Data)**:
    -   Extract the raw data from `barley.json`.
    -   Implement a utility function to aggregate the data by `variety` client-side (or pre-calculate in the component file).
    -   Calculate: `Mean`, `Stdev`, `Stderr`, `CI (95%)`, and `IQR` for each variety.
    -   Structure the data so the component can instantly switch between metrics without re-fetching.

2.  **Component Skeleton**:
    -   Create a main `BarleyYieldChart` component.
    -   Use a "Card" layout with a header containing the Title and the Metric Selector.

3.  **Visualization Construction (Recharts)**:
    -   Use `ComposedChart` with `layout="vertical"`.
    -   **XAxis**: Type number, hide axis line, show simplified ticks at the bottom.
    -   **YAxis**: Type category, `dataKey="variety"`. **Crucially**: Set `width={0}` or `hide` the axis. We will render the labels via a separate mechanism or a Custom Tick that renders text at `y - 20`.
        -   *Refined Approach*: To achieve the "Label Above Bar" look perfectly in Recharts, use a `YAxis` with a custom `tick` component that translates the text upwards and aligns it left (`textAnchor="start"`, `x={0}`).
    -   **Marks**:
        -   Use `ErrorBar` (if compatible with horizontal layout in the version used) OR construct the range using a `Bar` with transparency and a visible `ErrorBar` component inside.
        -   *Alternative Premium approach*: Use `Scatter` for the mean dot and a custom shape (Line) for the error range. This offers full styling control (rounded caps, specific colors).

4.  **Styling & Polish**:
    -   Apply Tailwind classes for typography (`text-sm font-semibold text-slate-700`).
    -   Add a subtle grid (`CartesianGrid` vertical only).
    -   Animation: Add smooth transitions when switching metrics.

## 4. Data Extraction

Since the original file processes data via Vega transforms, I will pre-calculate the aggregates to ensure accuracy in the React component.

**Raw Data Source**: `https://vega.github.io/editor/data/barley.json`

**Required Data Structure for Component**:
```typescript
type BarleyData = {
  variety: string;
  mean: number;
  stdev: { min: number; max: number };
  stderr: { min: number; max: number };
  ci: { min: number; max: number }; // 95% CI
  iqr: { min: number; max: number };
};
```

I will perform the aggregation logic (group by variety -> calculate stats) and embed this processed dataset directly into the `src/components/Visualization.tsx` file to guarantee the component works standalone without external dependencies or runtime calculation errors. This fulfills the "No fake data" requirement by using the mathematically derived values from the source.