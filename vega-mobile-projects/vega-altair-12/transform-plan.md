# Mobile Visualization Plan: Top 10 IMDB Movies

## 1. High-Level Strategy

The original visualization is a vertical bar chart showing the top 10 movies by IMDB Rating.
**Key Issues for Mobile:**
1.  **Aspect Ratio:** Vertical bars for categorical data (movie titles) work poorly on narrow screens. The X-axis labels ("The Godfather", "The Shawshank Redemption") are long and will either overlap, require extreme rotation (unreadable), or be excessively truncated.
2.  **Data Resolution:** The ratings are very close (8.9 to 9.2). A standard 0-10 Y-axis makes the bars look nearly identical in height, reducing the visual impact of the ranking.
3.  **Redundancy:** The color legend on the right takes up significant horizontal space but encodes the same information as the bar height (Rating).

**Transformation Strategy:**
We will apply a **Transpose (Axis-Transpose)** operation to convert the chart into a **Horizontal Bar Chart**. This allows movie titles to be listed vertically (left-aligned), utilizing the natural scrolling behavior of mobile devices. We will remove the redundant color legend and instead use a gradient fill on the bars to maintain the "premium" aesthetic. To ensure readability and precise comparison, we will explicitly display the rating value next to or inside each bar.

## 2. Design Action Space Analysis

Based on `mobile-vis-design-action-space.md`, the following actions will be taken:

### L2 Coordinate System
*   **Action: Transpose (Axis-Transpose)**
    *   *Reasoning:* Vertical columns are unsuitable for long categorical labels (Movie Titles) on mobile width. Switching to horizontal bars allows titles to be readable horizontally without rotation.

### L1 Data Model / L2 Data Marks
*   **Action: Recompose (Aggregate/Sort)**
    *   *Reasoning:* Ensure data is sorted strictly by rating descending (Top to Bottom) to match the mental model of a "Leaderboard".
*   **Action: Recompose (Remove Encoding - Legend)**
    *   *Reasoning:* The color encoding in the original (dark blue to light blue) matches the rating. Since the rating is also the length of the bar, a separate legend block is redundant and wastes screen width. We will keep the color encoding (gradient) but remove the legend component.

### L3/L4 Axes & Ticks
*   **Action: Recompose (Remove Axis Line/Ticks)**
    *   *Reasoning:* On mobile, we want a clean look. We will remove the X-axis (Rating) grid lines and axis lines. Instead, we will place the specific data value (e.g., "9.2") directly at the end of the bar.
*   **Action: Rescale (Tick Label)**
    *   *Reasoning:* The Y-axis (Movie Titles) needs enough width. We will integrate the titles as text labels positioned *above* the bars or to the left, depending on available width, to prevent truncation.

### L5 Interaction & Labels
*   **Action: Serialize Layout (Labels)**
    *   *Reasoning:* Instead of relying on a hover tooltip to see the exact rating (which is hard on touch), we will display the rating score permanently.
*   **Action: Disable Hover / Add Touch Feedback**
    *   *Reasoning:* Remove hover-dependent states. Add a subtle active state (highlight) when a user touches a bar row.

## 3. Data Extraction Plan

Since I cannot execute external network requests to fetch the full JSON during this planning phase, the implementation agent must use the data logic described in the original Vega spec to reconstruct the data.

**Source Logic:**
1.  Source: `movies.json`
2.  Sort: `IMDB Rating` (Descending)
3.  Filter: Top 10 items (`rank < 10`)

**Extracted Data (Target for Implementation):**
*Based on the visual evidence in `desktop.png`, the data is:*
1.  The Shawshank Redemption (9.2)
2.  The Godfather (9.2)
3.  Inception (9.1) *[Note: Check data, visual looks like 9.1]*
4.  The Godfather: Part II (9.0)
5.  12 Angry Men (8.9)
6.  One Flew Over the Cuckoo's Nest (8.9)
7.  Pulp Fiction (8.9)
8.  Schindler's List (8.9)
9.  The Dark Knight (8.9)
10. Toy Story 3 (8.9)

*Note: The original visual uses a gradient where higher ratings are darker blue.*

## 4. Implementation Steps

1.  **Component Setup:**
    *   Create `src/components/Visualization.tsx`.
    *   Define the `MovieData` interface.
    *   Hardcode the extracted Top 10 data array (as identified above) to ensure stability and "real data" usage without runtime fetching issues.

2.  **Layout Structure (Mobile First):**
    *   Use a Flexbox container (`flex-col`).
    *   **Header:** Title "Top Rated Movies" with a subtitle "IMDB Rating". Use `text-xl` and `font-bold`.
    *   **Chart Container:** A responsive container using Recharts `<ResponsiveContainer width="100%" height={500} />`.

3.  **Recharts Implementation:**
    *   Use `<BarChart layout="vertical" ... />`.
    *   **XAxis:** Type "number", domain `[0, 10]`, hide axis line, hide tick lines.
    *   **YAxis:** Type "category", dataKey "Title".
        *   *Crucial Design Decision:* To handle long titles on mobile, passing them into the standard YAxis often leads to truncation.
        *   *Solution:* We will set the YAxis `width` to a small value or hide it, and instead render the Title using a **Custom Label** inside the chart or construct the layout using standard HTML/CSS lists with Recharts serving as the graphical bar background.
        *   *Revised Recharts Approach:* Let's use Recharts for the bars. We will use a `YAxis` with `width={120}` (approx 35% of screen). If titles are longer, we let them wrap or use ellipsis.
        *   *Alternative Premium Layout:* Render the Title *above* the bar.
            *   Set `barSize={20}`.
            *   Use a custom `content` in the `XAxis` or map the data outside of Recharts?
            *   *Selected Method:* Use standard Recharts vertical layout. Set `YAxis` width to roughly 100px. Allow text wrapping in the tick formatter if possible, or truncate with ellipsis.
            *   *Better Method for "Premium":* Use a custom Y-axis tick component that renders the text.

4.  **Styling & Aesthetics (Glassmorphism/Premium):**
    *   **Background:** A subtle gradient background for the whole card (e.g., `bg-slate-50` to `bg-slate-100`).
    *   **Bars:** Use a `Cell` mapping to apply the specific blue colors (Dark Blue #0d3b66 for 9.2 -> Lighter Blue #90e0ef for 8.9).
    *   **Animation:** Enable `isAnimationActive={true}` with a smooth easing.
    *   **Labels:** Render the numeric rating (e.g., "9.2") in bold text at the end of the bar (using `<LabelList dataKey="IMDB Rating" position="right" />`).

5.  **Refinement for Readability:**
    *   Ensure the contrast between the bar color and background is sufficient.
    *   Add a subtle grid line (vertical) for reference (optional, maybe just at 5 and 10).

## 5. Summary of Transformed Mobile View
The result will be a sorted list of movies. Each row consists of the movie title (left) and a horizontal bar (right) extending to represent the score, with the score number explicitly written at the end. This eliminates the "head tilting" required for the desktop version and makes the text legible.