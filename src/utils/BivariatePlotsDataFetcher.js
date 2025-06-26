/* bivariatePlotApi.js
   ---------------------------------------------------------------
   All functions return: { data: [...Plotly traces], layout: {...} }
   --------------------------------------------------------------- */

const API = "http://127.0.0.1:8000/bivariate";

/* ---------- 1. Scatter -------------------------------------------------- */
export const getScatterPlot = async (xCol, yCol) => {
  const res = await fetch(`${API}/scatter?x_col=${xCol}&y_col=${yCol}`);
  const raw = await res.json(); // [{x, y}, ...]
  return {
    data: [
      {
        type: "scatter",
        mode: "markers",
        x: raw.map((p) => p.x),
        y: raw.map((p) => p.y),
        marker: { color: "#3b82f6" },
        name: `${yCol} vs ${xCol}`,
      },
    ],
    layout: {
      title: `Scatter: ${yCol} vs ${xCol}`,
      xaxis: { title: xCol },
      yaxis: { title: yCol },
    },
  };
};

/* ---------- 2. Line ----------------------------------------------------- */
export const getLinePlot = async (xCol, yCol) => {
  const res = await fetch(`${API}/line?x_col=${xCol}&y_col=${yCol}`);
  const raw = await res.json(); // [{x, y}, ...]
  return {
    data: [
      {
        type: "scatter",
        mode: "lines+markers",
        x: raw.map((p) => p.x),
        y: raw.map((p) => p.y),
        line: { shape: "spline" },
        name: yCol,
      },
    ],
    layout: {
      title: `Line: ${yCol} over ${xCol}`,
      xaxis: { title: xCol },
      yaxis: { title: yCol },
    },
  };
};

/* ---------- 3. Box-by-Category ----------------------------------------- */
export const getBoxByCategory = async (catCol, valCol) => {
  const res = await fetch(
    `${API}/box_by_category?category_col=${catCol}&value_col=${valCol}`
  );
  const raw = await res.json(); // [{category,min,q1,median,q3,max}, ...]
  return {
    data: raw.map((r) => ({
      type: "box",
      name: r.category,
      q1: r.q1,
      median: r.median,
      q3: r.q3,
      lowerfence: r.min,
      upperfence: r.max,
      boxpoints: false,
    })),
    layout: { title: `Box plot of ${valCol} grouped by ${catCol}` },
  };
};

/* ---------- 4. Grouped Bar --------------------------------------------- */
export const getGroupedBarPlot = async (catCol, groupCol) => {
  const res = await fetch(
    `${API}/grouped_bar?category_col=${catCol}&group_col=${groupCol}`
  );
  const raw = await res.json(); // [{category,group,value}]
  const groups = [...new Set(raw.map((r) => r.group))];
  const cats = [...new Set(raw.map((r) => r.category))];

  const traces = groups.map((g) => ({
    type: "bar",
    name: g,
    x: cats,
    y: cats.map(
      (c) =>
        (raw.find((r) => r.group === g && r.category === c) || {}).value || 0
    ),
  }));

  return {
    data: traces,
    layout: {
      title: `Grouped bar: ${catCol} by ${groupCol}`,
      barmode: "group",
      xaxis: { title: catCol },
      yaxis: { title: "Count" },
    },
  };
};

/* ---------- 5. Heatmap / Correlation ----------------------------------- */
export const getHeatmap = async (cols) => {
  const res = await fetch(`${API}/heatmap?cols=${cols.join(",")}`);
  const raw = await res.json(); // [{x,y,value}]
  const xLabels = [...new Set(raw.map((p) => p.x))];
  const yLabels = [...new Set(raw.map((p) => p.y))];

  // Build Z matrix
  const z = yLabels.map((y) =>
    xLabels.map(
      (x) => (raw.find((p) => p.x === x && p.y === y) || {}).value || 0
    )
  );

  return {
    data: [
      {
        type: "heatmap",
        x: xLabels,
        y: yLabels,
        z,
        colorscale: "Viridis",
      },
    ],
    layout: {
      title: `Correlation Heatmap (${cols.join(", ")})`,
    },
  };
};

/* ---------- 6. Stacked Bar --------------------------------------------- */
export const getStackedBarPlot = async (xCol, stackCol) => {
  const res = await fetch(
    `${API}/stacked_bar?x_col=${xCol}&stack_col=${stackCol}`
  );
  const raw = await res.json(); // [{x, StackA: 10, StackB: 4, ...}, ...]
  const xVals = raw.map((r) => r.x);
  const stackCats = Object.keys(raw[0]).filter((k) => k !== "x");

  const traces = stackCats.map((cat) => ({
    type: "bar",
    name: cat,
    x: xVals,
    y: raw.map((r) => r[cat]),
  }));

  return {
    data: traces,
    layout: {
      title: `Stacked Bar: ${xCol} split by ${stackCol}`,
      barmode: "stack",
      xaxis: { title: xCol },
      yaxis: { title: "Count" },
    },
  };
};

/* ---------- 7. Hexbin --------------------------------------------------- */
export const getHexbinPlot = async (xCol, yCol) => {
  const res = await fetch(`${API}/hexbin?x_col=${xCol}&y_col=${yCol}`);
  const raw = await res.json(); // [{x,y,value}]
  const xLabels = [...new Set(raw.map((p) => p.x))].sort((a, b) => a - b);
  const yLabels = [...new Set(raw.map((p) => p.y))].sort((a, b) => a - b);

  const z = yLabels.map((y) =>
    xLabels.map(
      (x) => (raw.find((p) => p.x === x && p.y === y) || {}).value || 0
    )
  );

  return {
    data: [
      {
        type: "heatmap",
        x: xLabels,
        y: yLabels,
        z,
        colorscale: "Blues",
      },
    ],
    layout: {
      title: `Hexbin density: ${yCol} vs ${xCol}`,
      xaxis: { title: xCol },
      yaxis: { title: yCol },
    },
  };
};

/* ---------- 8. Bubble --------------------------------------------------- */
export const getBubblePlot = async (xCol, yCol, sizeCol) => {
  const res = await fetch(
    `${API}/bubble?x_col=${xCol}&y_col=${yCol}&size_col=${sizeCol}`
  );
  const raw = await res.json(); // [{x,y,size}]
  return {
    data: [
      {
        type: "scatter",
        mode: "markers",
        x: raw.map((p) => p.x),
        y: raw.map((p) => p.y),
        marker: {
          size: raw.map((p) => p.size),
          sizemode: "area",
          sizeref: (2.0 * Math.max(...raw.map((p) => p.size))) / 100 ** 2,
          sizemin: 4,
          color: "#6366f1",
          opacity: 0.7,
        },
        text: raw.map((p) => `size: ${p.size}`),
      },
    ],
    layout: {
      title: `Bubble plot (${sizeCol} sized)`,
      xaxis: { title: xCol },
      yaxis: { title: yCol },
    },
  };
};

/* ---------- 9. Mosaic --------------------------------------------------- */
export const getMosaicPlot = async (col1, col2) => {
  const res = await fetch(`${API}/mosaic?col1=${col1}&col2=${col2}`);
  const raw = await res.json(); // [{x,y,value,percentage}]
  const xCats = [...new Set(raw.map((r) => r.x))];
  const yCats = [...new Set(raw.map((r) => r.y))];

  const traces = yCats.map((y) => ({
    type: "bar",
    name: y,
    x: xCats,
    y: xCats.map(
      (x) => (raw.find((r) => r.x === x && r.y === y) || {}).value || 0
    ),
  }));

  return {
    data: traces,
    layout: {
      title: `Mosaic / Stacked bar: ${col1} vs ${col2}`,
      barmode: "stack",
      xaxis: { title: col1 },
      yaxis: { title: "Count" },
    },
  };
};

/* ---------- Optional combined/default export --------------------------- */
export default {
  getScatterPlot,
  getLinePlot,
  getBoxByCategory,
  getGroupedBarPlot,
  getHeatmap,
  getStackedBarPlot,
  getHexbinPlot,
  getBubblePlot,
  getMosaicPlot,
};
