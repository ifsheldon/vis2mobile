# Mobile Visualization Transformation Plan

## 1. Analysis of Original Visualization

### Desktop Version Analysis
*   **Type**: Animated Scatter Plot (Bubble Chart).
*   **Variables**:
    *   **X-Axis**: Fertility Rate (Babies per woman).
    *   **Y-Axis**: Life Expectancy.
    *   **Color**: Region (South Asia, Europe, etc.).
    *   **Time**: Controlled by a slider (Year 1955-2005).
    *   **Identity**: Country.
*   **Key Features**:
    *   **Animation**: A slider allows navigating through years.
    *   **Search**: A text input to find specific countries.
    *   **Trails**: When a specific query matches, it shows the historical trail of that country.
    *   **Big Background Text**: Displays the current year prominently behind the chart.
*   **Issues on Mobile (Observed from `desktop_on_mobile.png`)**:
    *   **Unreadable Text**: Axis titles and tick labels are too small.
    *   **Touch Targets**: The native HTML slider and search input are too small for fingers.
    *   **Layout**: The square/landscape aspect ratio wastes vertical space on mobile.
    *   **Overplotting**: Bubbles overlap significantly, making selection difficult without precise cursor control.
    *   **Tooltip Occlusion**: Hover-based tooltips would be blocked by the user's finger.

## 2. High-Level Strategy & Design Action Space

My strategy focuses on maximizing screen real estate for the chart while moving controls (timeline, search, legend) to ergonomic zones (bottom of screen).

### Planned Actions from Action Space

#### **L0: Visualization Container**
*   **`Rescale`**: Set width to 100% and height to `70vh` (or a flexible vertical ratio like 4:5) to utilize the portrait mobile screen.
*   **`Reposition`**: Remove global padding/margins to let the chart "bleed" to the edges, creating an immersive experience.

#### **L1: Interaction Layer**
*   **`Recompose (Replace)` (Triggers)**: Replace `hover` interactions with `click/tap`. Users must tap a bubble to see details.
*   **`Reposition (Fix)` (Feedback)**: Instead of a floating tooltip, use a **Fixed Information Card** or "Heads-up Display" at the top of the chart or a bottom sheet to show details of the selected country (Country Name, Life Expectancy, Fertility).
*   **`Recompose (Replace)` (Features)**:
    *   Replace the native HTML slider with a custom, touch-friendly **Draggable Timeline** or "Play/Pause" button mechanism.
    *   Replace the input box with a **Search Modal/Overlay** trigger button.

#### **L2: Coordinate System & Axes**
*   **`Recompose (Remove)` (Axis Title)**: Remove "Life expectancy" and "Babies per woman..." titles from the axes. They consume valuable pixel height/width.
    *   *Justification*: Move these to a subtitle or the information card to clean up the chart area.
*   **`Decimate Ticks`**: Reduce tick counts (e.g., from ~10 to 3-4) for both X and Y axes to prevent clutter.
*   **`Recompose (Remove)` (Gridlines)**: Remove gridlines or make them extremely subtle to reduce visual noise.

#### **L2: Data Marks (Bubbles)**
*   **`Rescale`**: Ensure minimum bubble radius is touch-accessible (visual size vs trigger area).
*   **`Opacity` (Visual Encoding)**: Use slightly lower opacity for non-selected items to handle overplotting. When a country is selected, dim all others (Focus Mode).
*   **`Recompose (Trail)`**: The original "trails" are messy on mobile. I will only show the trail for the *currently selected* country, not multiple countries at once.

#### **L2: Title & Legend**
*   **`Reposition` (Legend)**: The color legend takes up chart space. I will move the Legend to a **scrollable bar** above the chart or inside the Search Modal.
*   **`Reposition` (Background Text)**: Keep the giant "Year" text in the background but ensure high transparency so it doesn't interfere with data reading.

## 3. Data Extraction Plan

I will use the data source URL found in the HTML file: `https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/gapminder.json`.

**Extraction Logic:**
1.  **Fetch**: Retrieve the JSON array.
2.  **Transform**: Group the flat array by `year`.
    *   Structure: `{ [year: number]: Array<CountryData> }`.
3.  **Color Mapping**: Extract unique `cluster` IDs (0-5) and map them to a premium Tailwind color palette (e.g., Emerald, Blue, Violet, Amber, Rose, Cyan) to replace the Vega `dark2` scheme.
4.  **Meta Data**: Extract the range (Min/Max) for Life Expectancy and Fertility Rate to set fixed domains for the axes (preventing axes jumping during animation).

## 4. Implementation Steps

### Step 1: Component Structure (Next.js)
*   `Visualization.tsx`: Main container. Manages state (`currentYear`, `selectedCountry`, `isPlaying`).
*   `ChartCanvas.tsx`: The Recharts implementation.
*   `Controls.tsx`: Glassmorphism control bar containing the Play button and Slider.
*   `Header.tsx`: Title and Search Trigger.
*   `DetailPanel.tsx`: Displays metrics for the selected bubble.

### Step 2: Visual Styling (Tailwind)
*   **Background**: A subtle gradient dark mode or clean light mode (glassmorphism style).
*   **Typography**: Large, bold numbers for the "Year" indicator. Legible sans-serif for labels.
*   **Motion**: Smooth transitions for bubbles when the year changes (Recharts animation handling).

### Step 3: Interaction Logic
*   **Animation Loop**: A `useEffect` hook that increments `currentYear` when `isPlaying` is true.
*   **Selection**: Tapping a bubble sets `selectedCountry`.
*   **Search**: A simple list filter that, when a user selects a result, pauses animation, sets the year to the latest available for that country, and highlights the bubble.

### Step 4: Recharts Implementation Details
*   Use `<ScatterChart />`.
*   **X-Axis**: Fertility Rate (Fixed Domain: 0 to 9).
*   **Y-Axis**: Life Expectancy (Fixed Domain: 20 to 90).
*   **Data**: Pass only the array for the `currentYear`.
*   **Custom Shape**: Render circles. If a country is selected, render a separate `<Scatter />` layer or Line to show its specific history (trail).

### Step 5: Mobile Optimization Checks
*   Ensure the slider thumb is 44x44px hit area.
*   Ensure text size is >12px (14px preferred for data).
*   Prevent page scrolling when interacting with the chart area (touch-action manipulation).