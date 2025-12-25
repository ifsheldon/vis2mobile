# Mobile Conversion Plan: Budgets Visualization

## Goal Description

Convert the desktop "Budgets" visualization (a Small Multiples Matrix of Sectors x Plans) into a mobile-friendly interactive component.
The original visualization compares budget amounts across 8 sectors for 3 different plans (Republican, Already Passed, Democratic), displaying totals for each plan.

## User Review Required
>
> [!NOTE]
> **Layout Transformation**: The visualization will change from a Grid Matrix (Rows=Sectors, Cols=Plans) to a **Grouped Horizontal Bar Chart**. This "linearizes" the content for vertical scrolling, which is the standard mobile pattern.

## Desktop Analysis & Action Space Mapping

Based on `mobile-vis-design-action-space.md`, here are the chosen transformation actions:

| Layer | Component | Action | Reasoning |
|---|---|---|---|
| **L1** | Chart Components | `Serialize layout` | The desktop 3-column matrix is too wide. We will **serialize** the columns into a vertical list grouped by Sector. |
| **L2** | Coordinate System | `Transpose (Axis-Transpose)` | Vertical bars in a grid are hard to label on mobile. **Horizontal bars** allow long Sector labels to be readable without rotation. |
| **L2** | Title/Legend | `Reposition` | The Plan Totals (originally column headers) will be moved to a **Legend/Summary Block** at the top or bottom to save vertical space near bars and provide context. |
| **L4** | Axes | `Recompose (Remove)` | We will **remove axis lines/ticks** to reduce clutter (`L4/L5 Remove`). Values will be shown via **Data Labels** on/next to bars (`L1/L2 Narrative logic`). |
| **L2** | DataMarks | `Rescale` | Bars will use `width: 100%` within their container to maximize usage of the narrow screen. |

### Justification for Omitted Actions

- **Data Reduction (L1 Recompose)**: We will **NOT** remove any sectors or plans. The mobile "vertical scroll" interaction affordance allows us to keep all data without overwhelming the user, unlike a fixed single-screen dashboard.

## Proposed Changes

### 1. New Component: `components/BudgetsMobileChart.tsx`

- **Type**: Grouped Horizontal Bar Chart.
- **Library**: `recharts` for the chart, `lucide-react` for icons if needed.
- **Structure**:
  - **Header**: Title ("Budgets") and a Legend summarizing the 3 Plans with their Total Amounts and Colors.
  - **Body**: A list of Sectors.
    - For each Sector: Title, followed by 3 horizontal bars (stacked vertically in a group).
    - **Encoding**:
      - Y-axis (Implicit): Sector categories.
      - X-axis (Implicit): Amount (Width of bar).
      - Color: Plan (Pink, Gray, Skyblue).
      - Label: Amount value displayed next to or inside the bar.
- **Data**: Extracted from `budgets-desktop.html` JSON Island.

### 2. Preview Page: `app/preview/budgets/page.tsx`

- A blank canvas page rendering `BudgetsMobileChart` for testing responsiveness.

### 3. Dashboard Integration: `app/page.tsx`

- Add a new Card for "Budgets" in the gallery.
- Link to the original HTML in `public/more-examples/`.

## Verification Plan

### Automated Tests

- **Lint/Check**: `bun run lint && bun run check` to ensure code quality.

### Manual Verification

1. **Mobile Aspect Ratio**: Open the preview page in the Browser Tool with dimensions `375x812` (iPhone X).
2. **Data Accuracy**: Verify that "Small-business aid" for "Republican plan" shows ~$200B and matches the original color (Pink).
3. **Responsive Layout**: Ensure no horizontal scrolling is required for the Page body (chart should fit width).
4. **Legibility**: Check that Sector names (e.g., "Safety net and other tax cuts") are fully visible and not truncated.
