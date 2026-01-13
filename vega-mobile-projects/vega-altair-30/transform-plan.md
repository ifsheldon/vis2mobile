# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Overview
- **Type**: Line Chart (Sine Wave).
- **Data Domain**: X-axis (approx 1.0 to 7.0), Y-axis (approx -1.0 to 1.0).
- **Visual Elements**:
    - A smooth blue line representing the data points.
    - **Annotation 1 (Decreasing)**: Located around $x \approx 2.8$. Features a rotated text "decreasing" ($340^\circ$) and a specific geometric symbol (a rectangular box with an 'X' inside).
    - **Annotation 2 (Increasing)**: Located around $x \approx 5.4$. Features text "increasing" and a distinct arrow pointing up-right ($23^\circ$) indicating the slope.
- **Style**: Academic/Technical style (Vega-Lite default). White background, gridlines present.

### Mobile Rendering Issues
- **Aspect Ratio Distortion**: Compressing the width makes the sine wave steepness look exaggerated.
- **Unreadable Text**: The "decreasing" and "increasing" labels, especially the rotated one, will become illegible if simply scaled down.
- **Crowding**: The visual annotations (the box and the arrow) are relatively large and may obscure the data line on a narrow screen.
- **Lack of Interaction**: Static labels do not allow for precise data reading on touch devices.

## 2. Design Action Space & Strategy

To transform this into a premium, mobile-first component, I will apply the following actions from the **Vis2Mobile Design Action Space**:

### L0: Visualization Container
- **Action: `Rescale`**
    - **Reasoning**: The chart must adapt to the full width of the mobile screen (`width: 100%`) with a fixed height (e.g., 300px-400px) to maintain a readable aspect ratio.

### L3: Axes (X & Y)
- **Action: `Decimate Ticks` & `Simplify Labels`**
    - **Reasoning**: The desktop version has many ticks (0.2 intervals). On mobile, this creates clutter. I will reduce the tick count (e.g., to 5 ticks for Y and 5 for X) to allow for larger font sizes.
- **Action: `Recompose (Remove)` (Axis Lines)**
    - **Reasoning**: Remove the solid axis lines and rely on subtle gridlines for a cleaner, modern look ("Premium Aesthetics").

### L2: Annotations (The Core Narrative)
The original visualization's main purpose is to highlight specific behaviors (trends).
- **Action: `Recompose (Replace)` (Icons)**
    - **Reasoning**: The custom SVG shapes (the 'X' box and the raw arrow) look dated and don't scale well visually on mobile. I will replace them with modern **Lucide React icons** inside styled markers (e.g., `TrendingDown` for decreasing, `TrendingUp` for increasing).
- **Action: `Reposition` (Labels)**
    - **Reasoning**: Rotated text is hard to read on mobile. I will make all text horizontal. I will use **Glassmorphism** (blurred background pills) for the labels so they can sit on top of the grid/line without reducing readability.
- **Action: `Compensate (Color)`**
    - **Reasoning**: Instead of just black text, I will color-code the annotations (e.g., Red/Orange for decreasing, Green/Cyan for increasing) to reinforce the narrative visually without relying solely on text.

### L1: Interaction Layer
- **Action: `Triggers` (Hover $\to$ Touch)**
    - **Reasoning**: Implement a distinct `CustomTooltip` that appears on touch.
- **Action: `Feedback` (Active Dot)**
    - **Reasoning**: When the user drags their finger across the sine wave, a glowing dot should follow the line to give precise coordinate feedback.

## 3. Data Extraction Plan

I will extract the raw data directly from the `datasets` object in the source HTML. No fake data will be generated.

**Source**: `spec.datasets['data-96202df407f72fe0bbe8279fda25847b']`

**Data Structure**:
Array of objects:
```json
[
  {"x": 1, "y": 0.8414...},
  {"x": 1.12..., "y": 0.90...},
  ...
]
```

**Annotation Coordinates (Approximate from spec)**:
1.  **Decreasing Point**: $x \approx 2.8$, $y \approx 0.3$ (Based on visual placement in original).
2.  **Increasing Point**: $x \approx 5.4$, $y \approx -0.4$ (Based on arrow placement).

## 4. Implementation Plan

### Step 1: Component Structure
- Create `src/components/Visualization.tsx`.
- Use a `Card` layout with a modern header ("Trend Analysis") to provide context, solving the missing title issue.

### Step 2: Styling & Theme
- **Palette**: Dark mode compatible. Deep slate/zinc background.
- **Line Style**: Use an SVG `<defs>` gradient for the sine wave stroke (e.g., transitioning from blue to teal) to add the "Premium" factor.
- **Glassmorphism**: Use `backdrop-blur-md bg-white/10` for tooltip and annotation labels.

### Step 3: Chart Configuration (Recharts)
- **Library**: `Recharts`.
- **Component**: `LineChart`.
- **XAxis**: type="number", domain=['auto', 'auto'], hide line, tickLine={false}.
- **YAxis**: hide (or minimal ticks), domain=[-1.1, 1.1] to ensure the peak/trough aren't cut off.

### Step 4: Recreating Annotations
Instead of drawing raw SVG paths matching the original pixel-perfectly (which breaks responsiveness):
1.  **Decreasing Annotation**:
    - Use `<ReferenceDot>` at $x=2.8$.
    - Custom Renderer: A container holding a Lucide `TrendingDown` icon and a label "Decreasing".
    - Style: Red/Amber accent color.
2.  **Increasing Annotation**:
    - Use `<ReferenceDot>` at $x=5.4$.
    - Custom Renderer: A container holding a Lucide `TrendingUp` icon and a label "Increasing".
    - Style: Emerald/Cyan accent color.

### Step 5: Interaction
- Add `<Tooltip />` with a `content={<CustomTooltip />}` prop.
- The tooltip will show the exact X and Y values formatted to 2 decimal places.

### Step 6: Typography
- Use `Inter` or standard sans-serif via Tailwind.
- Ensure font sizes for axis ticks are at least 12px.
- Ensure annotation labels are at least 14px and have sufficient contrast.

## 5. Summary of Differences (Desktop vs. Mobile Plan)
| Feature | Desktop Original | Mobile Transformation |
| :--- | :--- | :--- |
| **Ratio** | Wide (Landscape) | Tall/Square (Portrait friendly) |
| **Labels** | Rotated, black text | Horizontal, Glassmorphic pills, Color-coded |
| **Symbols** | Custom SVG box/arrow | Lucide Icons (`TrendingUp`/`Down`) |
| **Grid** | Standard Grid | Subtle/Hidden for cleanliness |
| **Interaction** | None/Default | Touch Tooltip + Active Dot |