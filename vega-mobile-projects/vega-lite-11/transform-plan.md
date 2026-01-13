# Vis2Mobile Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Details
The source visualization is a **Likert Scale Ratings Chart** (a variation of a strip plot or dot plot) representing user feedback on various tasks and device preferences.

- **Structure**: It is a faceted or multi-row chart where the Y-axis represents different questions (e.g., "Identify Errors", "Device Preference").
- **X-Axis**: Represents a rating scale from 1 to 5.
- **Data Encodings**:
    - **Blue Circles**: Position (x) indicates the rating value (1-5). Size indicates the **count** of participants who gave that rating.
    - **Black Vertical Tick**: Indicates the **median** rating for that specific question.
    - **Labels**:
        - **Left**: The Question/Task Name (e.g., "Identify Errors:").
        - **Inner Left/Right**: The semantic anchors for the scale (e.g., "Easy" vs. "Hard", "Toolbar" vs. "Gesture").
- **Visual Density**: The desktop view relies heavily on horizontal width to display the question label, the left anchor, the 1-5 scale, and the right anchor side-by-side.

### Issues in Mobile Aspect Ratio
- **Horizontal Compression**: As seen in `desktop_on_mobile.png`, strictly scaling the width down compresses the 1-5 scale into a tiny area. The bubbles overlap significantly, making it impossible to distinguish counts or positions.
- **Text Readability**: The labels ("Identify Errors:", "Easy", "Hard") become unreadably small or cluttered if kept in the same row.
- **Anchor Disassociation**: The semantic anchors ("Easy"/"Hard") are critical for interpreting the numbers. If wrapped or squashed, the user loses the context of what "1" or "5" means.

## 2. Design Plan & Action Space

The core strategy is to transform the "Single Wide Chart" into a **"Vertical List of Cards" (Small Multiples)**. This moves away from a single coordinate system for all rows and treats each question as an individual component.

### L1 Chart Components & Layout
*   **Action: `Serialize Layout` (Transpose/Stack)**
    *   **Reasoning**: The desktop version places labels and charts side-by-side. On mobile, we lack width. We will stack these elements vertically. Each Question becomes a "Card".
    *   **Plan**: Create a scrollable list where each item represents one Question. Inside the card, the title is at the top, the chart in the middle, and anchors at the bottom.

### L2 TitleBlock (Question Labels)
*   **Action: `Reposition`**
    *   **Reasoning**: Moving the Y-axis label (Question Name) from the left of the chart to the **top-left header** of each card ensures full text readability without eating into the horizontal space needed for the data.

### L2 Annotations (Anchors: "Easy"/"Hard")
*   **Action: `Reposition`**
    *   **Reasoning**: The desktop version puts anchors inline (e.g., "Easy --[Chart]-- Hard"). On mobile, we will place these **below the X-axis** of each card, aligned to the left (Start) and right (End). This frames the chart effectively.

### L3 Axes
*   **Action: `Recompose (Remove)` & `Simplify`**
    *   **Reasoning**: We don't need a full numbered axis (1, 2, 3, 4, 5) for every single card, which adds visual noise.
    *   **Plan**: Use a subtle grid or a single bottom axis line with tick marks for positions 1 through 5 inside the card.

### L2 Data Marks (The Bubbles and Median)
*   **Action: `Rescale`**
    *   **Reasoning**: The bubble sizes need to be recalibrated for mobile touch screens. They act as the primary data ink.
    *   **Plan**: Ensure the max bubble size fits comfortably within the mobile width (approx 340px-380px safe area) without overlapping neighbors too heavily.
*   **Action: `Compensate (Color/Shape)`**
    *   **Reasoning**: The black tick for Median is subtle. On mobile, we might want to make this more distinct, perhaps a colored vertical bar or a distinct icon above the timeline to prevent it from being lost inside large blue bubbles.

### L1 Interaction Layer
*   **Action: `Recompose (Replace)` (Hover to Click)**
    *   **Reasoning**: Desktop tooltips rely on hover. Mobile requires tap.
    *   **Plan**: Tapping a specific bubble will trigger a detail view (Popover or expansion) showing the exact count and percentage.
*   **Action: `Feedback` (Haptic/Visual)**
    *   **Reasoning**: Add a visual pulse when tapping a rating to confirm selection.

### Premium Aesthetics (Non-Action Space specific)
*   **Glassmorphism**: Use semi-transparent backgrounds for the cards to create depth.
*   **Typography**: Use distinct font weights (Bold for Question, lighter for Anchors) to establish hierarchy.

## 3. Data Extraction Plan

I will extract the following data structures from the provided HTML/Vega-Lite spec:

1.  **Raw Values (`values` array)**:
    *   Filter out `Tablet_First` and `Toolbar_First` rows (based on Vega transform spec `datum.name != 'Toolbar_First'`).
    *   Group data by `name` (The Question/Task).
    *   For each Question, calculate the frequency (count) of each `value` (1 through 5).
    *   Calculate the maximum count across all questions to normalize bubble sizes globally (so a "count of 5" looks the same size in all cards).

2.  **Medians (`medians` array)**:
    *   Map the `median`, `lo` (Low Anchor), and `hi` (High Anchor) to the corresponding Question `name`.

**Target Data Structure for Component:**
```typescript
interface QuestionData {
  id: string; // e.g., "Identify Errors:"
  question: string;
  lowLabel: string; // e.g., "Easy"
  highLabel: string; // e.g., "Hard"
  median: number;
  ratings: {
    score: number; // 1-5
    count: number; // Size of bubble
  }[];
}
```

## 4. Implementation Steps

1.  **Setup & Utility**:
    *   Create `data.ts` to hold the raw JSON extraction.
    *   Implement a helper function to aggregate the raw values into the `QuestionData` structure defined above.

2.  **Component Architecture**:
    *   `Visualization.tsx`: The main container rendering a responsive grid/list.
    *   `LikertCard.tsx`: A sub-component for rendering a single question's data.

3.  **Constructing `LikertCard`**:
    *   **Header**: Display the Question Name using Lucide icons for context if applicable (or just clean text).
    *   **Chart Area (Recharts)**:
        *   Use `ComposedChart` or `ScatterChart`.
        *   **X-Axis**: Type 'number', domain [0.5, 5.5], hide axis line but keep ticks.
        *   **Series 1 (Bubbles)**: `Scatter` plot. X = rating, Size = count. Custom shape to ensure circles look premium (gradient fill).
        *   **Series 2 (Median)**: `ReferenceLine` at x = median value. Style it as a prominent indicator (e.g., a dashed red line or a solid distinct bar).
    *   **Footer**: Flexbox row displaying `lowLabel` (left) and `highLabel` (right).

4.  **Styling & Animation**:
    *   Apply Tailwind classes for glassmorphism (`bg-white/10`, `backdrop-blur`).
    *   Add entry animations (Framer Motion or CSS keyframes) so cards slide in.
    *   Ensure touch targets are at least 44px.

5.  **Refinement**:
    *   Check contrast ratios.
    *   Ensure the median line is visible even if it overlaps a bubble (z-index handling).
    *   Add a "Summary" section at the top if necessary (optional, but good for "Premium" feel).