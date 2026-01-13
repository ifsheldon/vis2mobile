# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Overview
- **Structure:** A "Small Multiples" layout consisting of 3 distinct column charts.
- **Dimensions:**
  - **Rows (Y-Axis):** 8 Categories (Small-business aid, Other measures, Business tax breaks, Stimulus checks, Health care, Unemployment benefits, State and local aid, Safety net and other tax cuts).
  - **Columns (Plans):** 
    1. **Republican Plan** (Pink, ~$1.1T)
    2. **Already Passed** (Gray, ~$3.2T)
    3. **Democratic Plan** (Blue, ~$3.4T)
- **Data Points:** 24 distinct values (8 categories × 3 plans).
- **Visual Encoding:** Horizontal bar length represents monetary amount (billions).
- **Labels:** 
  - Y-Axis labels appear only on the far left.
  - Data labels (values) appear next to every bar.
  - Column headers summarize the Plan Name and Total Amount.

### Mobile Rendering Issues (Simulated)
- **Space Constraint:** Rendering 3 columns side-by-side on a narrow screen compresses the bars into thin, unreadable lines.
- **Text Readability:** The Y-axis text becomes microscopic or wraps awkwardly. The data value labels overlap or disappear.
- **Interaction:** Touch targets are too small.
- **Cognitive Load:** The user cannot effectively compare the "Republican" bar for a specific category with the "Democratic" bar because they are physically too far apart (or too small) on the mobile screen.

---

## 2. Vis2Mobile Design & Action Plan

### Core Strategy: **Serialize & Regroup**
To preserve the *comparative intent* of the original visualization (comparing plans against each other) while adhering to mobile verticality, we cannot simply shrink the 3-column layout. We must transform the spatial arrangement.

I propose a **"Grouped Card Layout"** approach. Instead of organizing by Plan (Columns), we will organize by **Category (Rows)**. Each Category will become a self-contained "Card" stacked vertically. Inside each card, the 3 plans will be displayed as a grouped bar chart.

This transforms the eye-movement from "Horizontal Scan across columns" (Desktop) to "Vertical Scroll" (Mobile), which is the native behavior of mobile users.

### Action Space Execution

#### L0: Visualization Container
*   **Action:** `Reposition (Padding/Margin)`
    *   **Reason:** Remove the large desktop whitespace. Use full width with comfortable side padding (`px-4`) to maximize bar length.

#### L1: Data Model
*   **Action:** `Recompose (Regroup)`
    *   **Reason:** The original data is structured as `Plan -> [Categories]`. We will invert this to `Category -> [Plans]`.
    *   **Implementation:** Extract data into a structure where `Sector` is the key, containing values for Rep, Passed, and Dem.

#### L1: Chart Components
*   **Action:** `Serialize Layout` (L1 Action)
    *   **Reason:** Transform the 3 parallel columns into a single vertical stream of component blocks.
    *   **Detail:** Instead of one big chart, render 8 individual "Sector Cards".

#### L2: Coordinate System
*   **Action:** `Transpose Axes` (Maintained)
    *   **Reason:** The original is Horizontal Bars. We will **keep** Horizontal Bars. On mobile, horizontal bars are superior to vertical columns for categorical data because they allow for longer category labels without rotation or truncation.

#### L3: Axes (Y-Axis)
*   **Action:** `Recompose (Remove)` & `Reposition (Externalize)`
    *   **Reason:** The shared Y-axis on the left takes up ~30% of the screen width.
    *   **Solution:** Remove the axis line and ticks. Move the Category Name (e.g., "Small-business aid") to become the **Header** of the Sector Card. This liberates horizontal space for the actual data bars.

#### L2: Data Marks (Bars)
*   **Action:** `Rescale (Width/Height)`
    *   **Reason:** Make bars thick enough for touch interaction (min-height 24px-32px).
    *   **Action:** `Recompose (Change Encoding)` - **Grouping**
    *   **Reason:** Place the Pink, Gray, and Blue bars immediately adjacent to each other vertically within the card. This facilitates immediate comparison of the plans for that specific sector.

#### L2: Auxiliary Components (Legend/Header)
*   **Action:** `Compensate (Toggle/Sticky)` or `Reposition`
    *   **Reason:** The "Total Plan Cost" (e.g., Rep $1.1T) is important context lost when breaking the columns.
    *   **Solution:** Create a **"Scorecard" Header** at the top of the page summarizing the 3 Plans (Total Cost + Legend Color). This acts as both a Legend and a high-level summary.

#### L5: Interaction & Feedback
*   **Action:** `Triggers (Click)` & `Feedback (Tooltip/Expand)`
    *   **Reason:** Mobile has no hover.
    *   **Solution:** Clicking a "Sector Card" could expand it to show details or highlight the specific values if they are simplified in the collapsed view.

---

## 3. Data Extraction Strategy

The source HTML provides highly structured data in the `aria-label` attributes of the SVG paths. I will extract this data programmatically.

**Source Pattern:** 
`aria-label="amount: {VALUE}; sector: {SECTOR_NAME}; plan: {PLAN_NAME}"`

**Extraction Steps:**
1.  **Parse HTML:** Identify all `<path>` elements within the `mark-rect` groups.
2.  **Extract Attributes:** Read the `aria-label` string.
3.  **Normalization:**
    *   `plan`: Map "Republican plan" -> `rep`, "Already passed" -> `passed`, "Democratic plan" -> `dem`.
    *   `sector`: Keep distinct strings (e.g., "Small-business aid").
    *   `amount`: Parse integer (e.g., "200").
4.  **Annotations:** Extract the specific text annotations from the `div` elements with `data-role="internalAnnotation"` to handle special cases (e.g., "$1,010 billion" vs raw "1010"). However, since we have raw numbers in aria-labels, we can re-format them consistently in React (e.g., using `Intl.NumberFormat`).

**Target JSON Structure:**
```typescript
interface PlanData {
  sector: string;
  republican: number;
  passed: number;
  democratic: number;
}
// Array of 8 items
```

---

## 4. Implementation Steps (Detailed)

### Step 1: Data Preparation
- Create a `data.ts` file.
- Manually or programmatically extract the 24 data points from the provided HTML source.
- Define the color palette based on the original (Pink, LightGray, SkyBlue) but map them to Tailwind colors for "Premium Aesthetics" (e.g., `bg-rose-300`, `bg-gray-300`, `bg-sky-400` with transparency/gradients).

### Step 2: Component Architecture
- **`DashboardHeader.tsx`**:
    - Displays the 3 Plans with their Total Costs (Sum of data) as a sticky or prominent top summary.
    - Acts as the Legend.
- **`SectorCard.tsx`**:
    - Receives a `PlanData` object.
    - Renders the Sector Title (Glassmorphic header).
    - Renders a purely CSS/HTML based bar chart (or simplified Recharts) for the 3 values.
    - **Animation:** Bars animate width on load using `framer-motion` or CSS transitions.
- **`Visualization.tsx`**:
    - The main container implementing the vertical list layout.

### Step 3: Visual Styling (Premium Aesthetics)
- **Glassmorphism:** Use `backdrop-blur-md`, `bg-white/70`, and subtle `border-white/20` for the Sector Cards.
- **Typography:** Use distinct font weights. Bold for Sector Titles, thinner monospace for values.
- **Bar Styling:** Rounded ends (`rounded-r-full`) for a modern feel. Subtle gradients or shadows.
- **Layout:** Flex column with `gap-4`.

### Step 4: Refinement (Readability)
- **Labels:**
    - If a bar is very short (e.g., 0 or 18), place the label *outside* to the right.
    - If a bar is long, place the label *inside* (white text) or keep outside for consistency.
    - Given the max value is ~1118 vs min 0, using a linear scale might make small bars invisible.
    - **Decision:** Use a linear scale (max domain ~1200) but ensure a minimum visual width (e.g., 4px) for non-zero values so they are visible/clickable.

### Step 5: Final Review against Action Space
- **Serialize Layout?** Yes (Vertical list).
- **Reposition Labels?** Yes (Header).
- **Transpose Axes?** Kept horizontal bars.
- **Real Data?** Yes (Extracted).
- **Mobile First?** Yes (Touch targets, vertical scroll).