# Mobile Visualization Action Space (Agent Optimized)

## Part 1: Component Taxonomy & DOM Heuristics
| Component ID | Description | DOM Identification Strategies (Selector Hints) |
| --- | --- | --- |
| **L0_Container** | Root visualization container | `svg`, `div[role="graphics-document"]`, `.chart-container`, `.vis-wrapper` |
| **L1_DataModel** | Data Transformation Layer (Aggregation, Filtering) | N/A (Internal Logic / Data State) |
| **L1_Chart** | Individual chart in a multi-chart layout | `g.panel`, `g.facet`, `svg.small-multiple` |
| **L1_Interaction** | Interaction controls and state | `div.tooltip`, `g.brush`, Mouse/Touch Event Listeners |
| **L2_TitleBlock** | Block containing main title and subtitle | `g.title-group`, `text.chart-title`, `g[aria-label="title"]` |
| **L2_CoordSys** | Coordinate system wrapper | `g.grid-layer`, `g.cartesian-layer` |
| **L2_DataMarks** | The primary data visualization elements | `g.mark-layer`, `g.series-group`, `.bars`, `.lines`, `.scatter` |
| **L2_Annotations** | Text annotations overlaid on chart | `g.annotation-group`, `text.annotation` |
| **L3_Axes** | X or Y Axis container | `g.axis`, `g.x-axis`, `g.y-axis`, `g[role="graphics-axis"]` |
| **L3_Legend** | Legend block container | `g.legend`, `.legend-wrapper`, `div.legend`, `g[role="complementary"]` |
| **L4_Ticks** | Group of tick marks and labels | `g.tick`, `.tick` elements inside axis |
| **L4_MarkInstance** | Individual geometric shapes (bars, points) | `rect.bar`, `circle.dot`, `path.line-segment` |
| **L4_MarkLabel** | Labels attached to specific data marks | `text.bar-label`, `g.label-group` |
| **L5_TickLabel** | Text labels on axes | `text` inside `g.tick`, `text.tick-label` |

## Part 2: Planner Action Rules (Decision Matrix)

### Level 0/1: Container & Data Strategies
* **Component: L0_Container (Viewport)**
  * **Condition**: `viewport_overflow == true` OR `content_width > screen_width` `(Source: DOM/Visual)`
  * **Action**: `RESCALE_VIEWBOX`
  * **Param Schema**: `{ "fit": "contain" | "cover", "width": string }`
  * **Requires Data**: `[FALSE]`

* **Component: L0_Container (Margins)**
  * **Condition**: `whitespace_ratio > 0.3` `(Source: Visual)`
  * **Action**: `REPOSITION_MARGINS`
  * **Param Schema**: `{ "margin": number | string }`
  * **Requires Data**: `[FALSE]`

* **Component: L1_DataModel (Density)**
  * **Condition**: `data_density > 30 points` AND `screen_width < 400px` `(Source: Data)`
  * **Action**: `AGGREGATE_DATA`
  * **Param Schema**: `{ "method": "avg" | "sum" | "count", "interval": "monthly" | "weekly" }`
  * **Requires Data**: `[REQUIRES_DATA]`

* **Component: L1_DataModel (Series)**
  * **Condition**: `series_count > 5` AND `chart_type == "line"` `(Source: Data)`
  * **Action**: `FILTER_SERIES`
  * **Param Schema**: `{ "keep": "top_k", "k": number, "others": "gray" | "remove" }`
  * **Requires Data**: `[REQUIRES_DATA]`

* **Component: L1_Interaction**
  * **Condition**: `device_type == "touch"` `(Source: Environment)`
  * **Action**: `DISABLE_HOVER`
  * **Param Schema**: `{ "fallback": "click" | "tap" }`
  * **Requires Data**: `[FALSE]`

* **Component: L1_Interaction (Widgets)**
  * **Condition**: `screen_width < 600px` AND `has_widget == true` `(Source: DOM)`
  * **Action**: `REMOVE_WIDGETS`
  * **Param Schema**: `{ "target": "search" | "filter_dropdown", "fallback": "simple_toggle" }`
  * **Requires Data**: `[FALSE]`

* **Component: L1_Chart (Small Multiples)**
  * **Condition**: `facet_layout == "grid"` AND `columns > 1` `(Source: DOM)`
  * **Action**: `SERIALIZE_LAYOUT`
  * **Param Schema**: `{ "columns": 1 }`
  * **Requires Data**: `[FALSE]`

* **Component: L1_Chart (Pagination)**
  * **Condition**: `panel_count > 3` AND `vertical_space_constrained == true` `(Source: DOM)`
  * **Action**: `PAGINATE_PANELS`
  * **Param Schema**: `{ "page_size": 1, "control": "dots" | "arrows" }`
  * **Requires Data**: `[FALSE]`

* **Component: L1_Chart (Type Switching)**
  * **Condition**: `chart_type == "bar"` AND `mark_density > 0.8` `(Source: Visual)`
  * **Action**: `SWITCH_CHART_TYPE`
  * **Param Schema**: `{ "to_type": "line" | "heatmap" | "list" }`
  * **Requires Data**: `[REQUIRES_DATA]`

### Level 2/3: Components & Layout
* **Component: L2_TitleBlock (Title)**
  * **Condition**: `title_width > screen_width - padding` `(Source: Visual)`
  * **Action**: `RESCALE_FONT`
  * **Param Schema**: `{ "target_size": string | number, "unit": "px" | "rem" }`
  * **Requires Data**: `[FALSE]`

* **Component: L2_TitleBlock (Subtitle)**
  * **Condition**: `screen_width < 400px` `(Source: DOM)`
  * **Action**: `REMOVE_SUBTITLE`
  * **Param Schema**: `{}`
  * **Requires Data**: `[FALSE]`

* **Component: L2_Legend**
  * **Condition**: `screen_width < 500px` AND `position == "right"` `(Source: DOM/Visual)`
  * **Action**: `REPOSITION_LEGEND`
  * **Param Schema**: `{ "target": "bottom" | "top", "layout": "flex_row" | "flex_col" }`
  * **Requires Data**: `[FALSE]`

* **Component: L2_Legend (Overflow)**
  * **Condition**: `item_count > 10` AND `layout == "horizontal"` `(Source: DOM)`
  * **Action**: `COMPENSATE_TOGGLE`
  * **Param Schema**: `{ "widget": "dropdown" | "modal" | "accordion" }`
  * **Requires Data**: `[FALSE]`

* **Component: L2_Legend (Nuance)**
  * **Condition**: `item_count > 5` AND `screen_width < 380px` `(Source: Data)`
  * **Action**: `FILTER_LEGEND_ITEMS`
  * **Param Schema**: `{ "keep": "top_k", "k": 3, "hide_corresponding_data": boolean }`
  * **Requires Data**: `[REQUIRES_DATA]`

* **Component: L2_DataMarks (Simplification)**
  * **Condition**: `mark_type == "image"` AND `screen_width < 400px` `(Source: DOM)`
  * **Action**: `SIMPLIFY_MARK`
  * **Param Schema**: `{ "fallback_shape": "rect" | "circle", "keep_color": boolean }`
  * **Requires Data**: `[FALSE]`

* **Component: L2_DataMarks (Focus)**
  * **Condition**: `data_density > 50` OR `user_intent == "focus"` `(Source: Visual/User)`
  * **Action**: `GRAY_OUT_CONTEXT`
  * **Param Schema**: `{ "trigger": "static" | "interactive", "opacity_ratio": 0.1 }`
  * **Requires Data**: `[REQUIRES_DATA]`

* **Component: L2_Annotations**
  * **Condition**: `overlap_ratio > 0` `(Source: Visual)`
  * **Action**: `EXTERNALIZE_ANNOTATIONS`
  * **Param Schema**: `{ "position": "below" | "side", "link_style": "numbered" | "line" }`
  * **Requires Data**: `[FALSE]`

* **Component: L3_Axes (Structure)**
  * **Condition**: `chart_type == "bar"` AND `x_axis_label_count > 10` AND `screen_width < 400px` `(Source: Code/DOM)`
  * **Action**: `TRANSPOSE_CHART`
  * **Param Schema**: `{ "swap_axes": boolean }`
  * **Requires Data**: `[REQUIRES_DATA]`

* **Component: L3_Axes (Noise Reduction)**
  * **Condition**: `screen_width < 360px` `(Source: DOM)`
  * **Action**: `REMOVE_AXIS_TITLE`
  * **Param Schema**: `{ "axis": "y" | "x" | "both" }`
  * **Requires Data**: `[FALSE]`

* **Component: L3_Axes (Interaction)**
  * **Condition**: `content_width > screen_width` AND `interaction_policy == "allow_scroll"` `(Source: Config)`
  * **Action**: `ENABLE_PAN_ZOOM`
  * **Param Schema**: `{ "axis": "x" | "y", "mode": "pan" | "zoom" }`
  * **Requires Data**: `[FALSE]`

* **Component: L3_Axes (Domain)**
  * **Condition**: `has_outliers == true` AND `screen_width < 400px` `(Source: Data)`
  * **Action**: `CROP_AXIS_DOMAIN`
  * **Param Schema**: `{ "percentile": [5, 95], "max_crop_ratio": 0.2 }`
  * **Requires Data**: `[REQUIRES_DATA]`

* **Component: L3_Gridlines**
  * **Condition**: `density > 0.5` OR `screen_width < 400px` `(Source: Visual)`
  * **Action**: `REMOVE_GRIDLINES`
  * **Param Schema**: `{ "axis": "x" | "both" }`
  * **Requires Data**: `[FALSE]`

* **Component: L3_Gridlines / L4_AxisLine / L5_TickLine (De-cluttering)**
  * **Condition**: `ink_ratio > 0.1` AND `screen_width < 360px` `(Source: Visual)`
  * **Action**: `REMOVE_DECORATIONS`
  * **Param Schema**: `{ "targets": ["gridlines", "axis_line", "tick_line"] }`
  * **Requires Data**: `[FALSE]`

### Level 4/5: Marks & Ticks
* **Component: L4_MarkInstance**
  * **Condition**: `mark_overlap > 0` OR `mark_width > available_space` `(Source: Visual)`
  * **Action**: `RESCALE_MARK_WIDTH`
  * **Param Schema**: `{ "scale_factor": number, "min_width": number }`
  * **Requires Data**: `[REQUIRES_DATA]`

* **Component: L4_MarkLabel (Priority 1)**
  * **Condition**: `label_width > mark_width` OR `overlap > 0` `(Source: Visual)`
  * **Action**: `EXTERNALIZE_LABEL`
  * **Param Schema**: `{ "position": "top" | "side" }`
  * **Requires Data**: `[FALSE]`

* **Component: L4_MarkLabel (Priority 2)**
  * **Condition**: `external_space_available == false` `(Source: Visual)`
  * **Action**: `REMOVE_LABEL`
  * **Param Schema**: `{ "fallback": "tooltip" }`
  * **Requires Data**: `[FALSE]`

* **Component: L4_Ticks**
  * **Condition**: `tick_overlap_predicted == true` `(Source: Visual)`
  * **Action**: `DECIMATE_TICKS`
  * **Param Schema**: `{ "target_count": number | "auto", "strategy": "uniform" | "extents_only" }`
  * **Requires Data**: `[FALSE]`

* **Component: L5_TickLabel**
  * **Condition**: `text_overflow == true` OR `label_length > 8 chars` `(Source: Visual/DOM)`
  * **Action**: `SIMPLIFY_LABEL`
  * **Param Schema**: `{ "format": "abbreviate" | "truncate" | "rotate" | "date_format" }`
  * **Requires Data**: `[FALSE]`

* **Component: L5_LegendSymbol**
  * **Condition**: `horizontal_space_constrained == true` `(Source: Visual)`
  * **Action**: `RESCALE_LEGEND_SYMBOL`
  * **Param Schema**: `{ "scale": 0.5 }`
  * **Requires Data**: `[FALSE]`

## Part 3: Coder Implementation Logic

### 3.1 Structural Changes (SVG/XML Attributes)
* **Action**: `TRANSPOSE_AXES`
  * **Strategy**: Swap layout definitions. Map X-scale to Y-range and Y-scale to X-range.
  * **Logic**:
    $$
    \text{Op}_{Transpose}(S_{LS}) \Rightarrow S_{SS} = \begin{cases} 
    \text{Axis}_{x} \leftarrow S_{LS}.\text{Axis}_{y} \\
    \text{Axis}_{y} \leftarrow S_{LS}.\text{Axis}_{x} \\
    \text{Range}_{x} \leftarrow [0, W_{screen}] \\
    \text{Range}_{y} \leftarrow [0, \infty) \quad (\text{Scrollable})
    \end{cases}
    $$
  * **Target**: SVG Attributes (`transform`, `d`, `x`, `y`)

* **Action**: `SERIALIZE_LAYOUT`
  * **Strategy**: Stack multiple chart panels vertically using a cumulative height offset.
  * **Logic**:
    $$
    \text{Pos}_{SS}(i) = \left( 0, \sum_{k=0}^{i-1} (H_{\text{mark}} + H_{\text{padding}}) \right)
    $$
  * **Target**: SVG transforms (`<g transform="translate(0, y)">`)

* **Action**: `DECIMATE_TICKS`
  * **Strategy**: Calculate maximum possible ticks based on tick label width and screen width, then filter.
  * **Logic**:
    $$
    N_{ticks} = \left\lfloor \frac{W_{screen}}{\text{Width}_{\text{label}} \times \alpha} \right\rfloor
    $$
    If `strategy == "extents_only"`, return `[min, max]`.
  * **Target**: DOM Structure (Removes `<g class="tick">` elements)

* **Action**: `RESCALE_MARK_WIDTH`
  * **Strategy**: Reduce width of geometrical marks (rects) while ensuring minimum touch target.
  * **Constraint**: If $W_{new} < 40px$, create a transparent overlay rect ($W=40px$, opacity=0) to maintain interaction.
  * **Target**: Attribute `width` or `r` + New Overlay DOM Element.

* **Action**: `REMOVE_DECORATIONS`
  * **Strategy**: Minimize "Data-Ink" ratio by hiding non-essential structural lines.
  * **Logic**:
    Set `stroke: none`, `display: none` or `opacity: 0`.
  * **Target**: CSS/SVG Attributes on `.grid-line`, `.domain`, `.tick-line`.

* **Action**: `REMOVE_WIDGETS`
  * **Strategy**: Detect and hide complex HTML widgets that consume vertical space.
  * **Logic**: `display: none`.
  * **Target**: DOM containers (`.search-bar`, `.filter-panel`).

### 3.2 Behavioral Changes (JS/Events Injection)
* **Action**: `FIX_TOOLTIP_POSITION`
  * **Strategy**: Inject script to override default mouse-follow behavior. Force tooltip to fixed coordinates on touch devices.
  * **Logic**:
    $$
    P_{\text{tooltip}}(x, y) = \begin{cases} 
    (x_{\text{cursor}} + \delta, y_{\text{cursor}} + \delta) & \text{if Desktop (Hover)} \\
    (W_{screen}/2, H_{screen} - H_{\text{tooltip}}) & \text{if Mobile (Touch)}
    \end{cases}
    $$
  * **Target**: `<script>` injection, Event Listeners (`touchstart` vs `mousemove`).

* **Action**: `COMPENSATE_TOGGLE`
  * **Strategy**: Wrap elements in a container with a togglable UI controller (e.g., button).
  * **Target**: DOM Structure + Script Injection.

* **Action**: `DISABLE_HOVER`
  * **Strategy**: Remove `mouseover` listeners and attach `click`/`touchend` listeners for interactions (like tooltips).
  * **Target**: Event Listeners.

* **Action**: `PAGINATE_PANELS`
  * **Strategy**: Hide all panels except active index $k$. Add navigation buttons to increment/decrement $k$.
  * **Target**: CSS (`display: none`), JS State (`currentIndex`).

* **Action**: `ENABLE_PAN_ZOOM`
  * **Strategy**: Wrap the SVG or canvas in a scrollable div container.
  * **Logic**: Set container `overflow-x: auto` and SVG `width: content_width`.
  * **Target**: DOM Wrapping + CSS.

* **Action**: `EXTERNALIZE_ANNOTATIONS`
  * **Strategy**: "Numbered" Reference. Replace text with indices, list full text below.
  * **Logic**:
    1. Identify all `text.annotation`.
    2. Replace content with indices: ①, ②, ③.
    3. Append `ul.annotation-list` after logic chart container.
    4. Linkage: Add `data-id` or `href` anchor to allow tap-to-scroll.
  * **Target**: DOM Manipulation (SVG Text + New HTML List).

### 3.3 Text Manipulation Logic (Strings & Fonts)
* **Action**: `SIMPLIFY_LABEL`
  * **Strategy**: Dictionary Lookup -> Truncation.
  * **Logic**:
    $$
    \text{Text}_{display} = \begin{cases} 
    \text{Map}[\text{Text}] & \text{if exists} \\
    \text{Text}_{full} & \text{if } \text{Len}(\text{Text}) \leq L_{max} \\
    \text{Substring}(\text{Text}, 0, L_{max}) + \text{"..."} & \text{else}
    \end{cases}
    $$
  * **Logic (Rotation)**: If format is "rotate", calculate angle based on collision:
    $$
    \theta_{rotate} = \begin{cases} 
    -45^{\circ} & \text{if } W_{label} \times \cos(45^{\circ}) < \text{Gap}_{tick} \\
    -90^{\circ} & \text{otherwise}
    \end{cases}
    $$
  * **Target**: SVG transform `rotate(-45, x, y)`...

* **Action**: `FORMAT_DATE`
  * **Strategy**: Use semantic date formatting (D3 style) over truncation.
  * **Target**: Text Content.

* **Action**: `RESCALE_FONT`
  * **Strategy**: Scale font size relative to desktop baseline with linear scaling.
  * **Logic**:
    $$
    FS_{mobile} = \max(FS_{desktop} \times 0.8, 10px)
    $$

### 3.4 Data Transformation Logic
* **Action**: `AGGREGATE_DATA`
  * **Strategy**: Bin data points into larger intervals (e.g., daily to monthly) and compute aggregate statistic.
  * **Logic**:
    $$
    V_{bin} = \text{Aggregate}(\{ v_i, \dots, v_{i+n} \}, \text{method})
    $$
    where $\text{method} \in \{ \text{SUM}, \text{AVG}, \text{MAX} \}$
  * **Target**: Data Array (Pre-rendering).

* **Action**: `SWITCH_CHART_TYPE`
  * **Strategy**: **Generative Approach**. Ignore original SVG structure. Use `extracted_data` to generate new render function.
  * **Logic**: Re-map `x/y` channels to target mark generator (e.g., `<polyline>` points or `<g>` of rects for Heatmap).
  * **Target**: Complete Re-render.

* **Action**: `SIMPLIFY_MARK`
  * **Strategy**: Replace complex visual marks (images) with simple geometric primitives.
  * **Logic**:
    $$
    \text{Mark}_{visual} = \begin{cases} 
    \text{Image}(\text{src}) & \text{if } W_{screen} > \tau_{width} \\
    \text{Rect}(\text{color}) & \text{if } W_{screen} \leq \tau_{width}
    \end{cases}
    $$
    $$
    Size_{new} = \min(W_{screen} \times 0.1, 40px)
    $$
  * **Target**: SVG Elements (`<image>` -> `<rect>`/`<circle>`).

* **Action**: `EXTERNAL_LABEL`
  * **Strategy**: Calculate new position outside bar.
  * **Logic**:
    $$
    y_{new} = y_{bar} - H_{label} - padding
    $$
    (For vertical bars). If $y_{new} < 0$, trigger `REMOVE_LABEL`.

* **Action**: `REMOVE_LABEL`
  * **Strategy**: Hide labels that do not fit.
  * **Logic**:
    $$
    \text{Visibility} = \begin{cases} 
    \text{hidden} & \text{if } W_{label} > W_{mark} \\
    \text{visible} & \text{otherwise}
    \end{cases}
    $$

* **Action**: `CROP_AXIS_DOMAIN`
  * **Strategy**: Zoom into the 5th-95th percentile to handle outliers, with safety limits.
  * **Logic**:
    Calculate new domain $[D_{min}, D_{max}]$:
    $$
    D_{min} = \max(\text{Percentile}(5), \text{OriginalMin} \times (1 + \text{SafetyLimit}))
    $$
    $$
    D_{max} = \min(\text{Percentile}(95), \text{OriginalMax} \times (1 - \text{SafetyLimit}))
    $$
  * **Target**: Scale Domain Update.

* **Action**: `GRAY_OUT_CONTEXT`
  * **Strategy**: Visual focus enforcement.
  * **Logic**:
    $$
    \text{Opacity}(s) = \begin{cases} 
    1.0 & \text{if } s = \text{FocusedSeries} \\
    0.1 & \text{otherwise}
    \end{cases}
    $$
    **Conflict Rule**: If `DISABLE_HOVER` is active, `trigger` must be static (pre-defined) OR `tap`-based.
  * **Target**: Style attributes (`opacity`, `fill`, `stroke`).

* **Action**: `FILTER_LEGEND_ITEMS`
  * **Strategy**: Show Top K items, group rest into "Others".
  * **Logic**:
    $$
    \text{Items}_{kept} = \text{Top}_K(\text{Items}, \text{by}=\text{Value}) \cup \{ \text{"Others"} \}
    $$
    **Orphan Check**: If `hide_corresponding_data` is `true`, matching series for dropped items must also be hidden (`opacity: 0` or `display: none`).
  * **Target**: Legend DOM + Data Series visibility.
