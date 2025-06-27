/* eslint-disable no-unused-vars */
const API = "https://eda-tool.onrender.com//bivariate";

// Cache for API responses to reduce repeated calls
const responseCache = new Map();
const getCacheKey = (endpoint) => endpoint;

async function fetchWithCache(endpoint) {
  const cacheKey = getCacheKey(endpoint);

  // Check cache first
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  // Not in cache, make actual API call
  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Store in cache
    responseCache.set(cacheKey, data);

    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Helper to generate colors
const generateColors = (n, baseColor = null) => {
  const colorSchemes = {
    blue: [
      "#1f77b4",
      "#aec7e8",
      "#3366cc",
      "#6699ff",
      "#00458c",
      "#4d94ff",
      "#0066cc",
      "#0033cc",
      "#003399",
      "#001f66",
    ],
    green: [
      "#2ca02c",
      "#98df8a",
      "#33cc33",
      "#00b33c",
      "#009933",
      "#006622",
      "#004d1a",
      "#66ff66",
      "#00ff00",
      "#00cc00",
    ],
    red: [
      "#d62728",
      "#ff9896",
      "#cc0000",
      "#ff0000",
      "#ff6666",
      "#990000",
      "#800000",
      "#cc3333",
      "#ff3333",
      "#ff8080",
    ],
    purple: [
      "#9467bd",
      "#c5b0d5",
      "#8c4eb8",
      "#7a3dad",
      "#5c2d80",
      "#4c2466",
      "#663399",
      "#472366",
      "#8b008b",
      "#800080",
    ],
    orange: [
      "#ff7f0e",
      "#ffbb78",
      "#ff9933",
      "#ff8000",
      "#cc6600",
      "#b35900",
      "#994d00",
      "#804000",
      "#663300",
      "#4d2600",
    ],
    teal: [
      "#17becf",
      "#9edae5",
      "#00cccc",
      "#00b3b3",
      "#009999",
      "#008080",
      "#006666",
      "#004d4d",
      "#003333",
      "#80ffff",
    ],
  };

  const scheme =
    baseColor && colorSchemes[baseColor]
      ? colorSchemes[baseColor]
      : colorSchemes.blue;

  if (n <= scheme.length) {
    return scheme.slice(0, n);
  }

  // If we need more colors than available, we'll generate them
  const result = [...scheme];
  while (result.length < n) {
    // Generate a color by tweaking an existing one
    const baseColorHex = scheme[result.length % scheme.length];
    const r = parseInt(baseColorHex.slice(1, 3), 16);
    const g = parseInt(baseColorHex.slice(3, 5), 16);
    const b = parseInt(baseColorHex.slice(5, 7), 16);

    // Adjust the RGB values slightly
    const r2 = Math.min(
      255,
      Math.max(0, r + Math.floor(Math.random() * 40) - 20)
    );
    const g2 = Math.min(
      255,
      Math.max(0, g + Math.floor(Math.random() * 40) - 20)
    );
    const b2 = Math.min(
      255,
      Math.max(0, b + Math.floor(Math.random() * 40) - 20)
    );

    const newColor = `#${r2.toString(16).padStart(2, "0")}${g2
      .toString(16)
      .padStart(2, "0")}${b2.toString(16).padStart(2, "0")}`;
    result.push(newColor);
  }

  return result;
};

// Helper to format numbers intelligently
const formatNumber = (num) => {
  if (Math.abs(num) < 0.01 && num !== 0) {
    return num.toExponential(2);
  }
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: Math.abs(num) < 1 && num !== 0 ? 2 : 0,
  });
};

// Get basic statistics from an array of numbers
const getBasicStats = (arr) => {
  if (!arr || !arr.length) return {};

  const sorted = [...arr].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return {
    mean,
    median,
    min,
    max,
    count: sorted.length,
    sum,
  };
};

/* ---------- 1. Scatter -------------------------------------------------- */
export const getScatterPlot = async (xCol, yCol) => {
  try {
    const endpoint = `${API}/scatter?x_col=${encodeURIComponent(
      xCol
    )}&y_col=${encodeURIComponent(yCol)}`;
    const raw = await fetchWithCache(endpoint); // [{x, y}, ...]

    // Calculate correlation coefficient and regression line
    const xValues = raw.map((p) => p.x);
    const yValues = raw.map((p) => p.y);

    // Basic stats for annotations
    const xStats = getBasicStats(xValues);
    const yStats = getBasicStats(yValues);

    // Calculate correlation coefficient
    let correlation = 0;
    if (xValues.length > 1) {
      const xMean = xStats.mean;
      const yMean = yStats.mean;

      let numerator = 0;
      let denomX = 0;
      let denomY = 0;

      for (let i = 0; i < xValues.length; i++) {
        const xDiff = xValues[i] - xMean;
        const yDiff = yValues[i] - yMean;
        numerator += xDiff * yDiff;
        denomX += xDiff * xDiff;
        denomY += yDiff * yDiff;
      }

      correlation = numerator / (Math.sqrt(denomX) * Math.sqrt(denomY));
    }

    // Calculate regression line
    const slope =
      (correlation * (yStats.max - yStats.min)) / (xStats.max - xStats.min);
    const intercept = yStats.mean - slope * xStats.mean;

    const regressionX = [xStats.min, xStats.max];
    const regressionY = regressionX.map((x) => slope * x + intercept);

    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          x: xValues,
          y: yValues,
          marker: {
            color: "#3b82f6",
            opacity: 0.7,
            size: 8,
            line: {
              color: "#2563eb",
              width: 1,
            },
          },
          name: `${yCol} vs ${xCol}`,
          hovertemplate: `<b>${xCol}</b>: %{x}<br><b>${yCol}</b>: %{y}<extra></extra>`,
        },
        {
          type: "scatter",
          mode: "lines",
          x: regressionX,
          y: regressionY,
          line: {
            color: "#ef4444",
            width: 2,
            dash: "dash",
          },
          name: "Trend Line",
          hovertemplate:
            "Trend Line<br>y = " +
            formatNumber(slope) +
            "x + " +
            formatNumber(intercept) +
            "<extra></extra>",
        },
      ],
      layout: {
        title: {
          text: `<b>Scatter Plot: ${yCol} vs ${xCol}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: {
            text: xCol,
            font: { size: 14 },
          },
          zeroline: true,
          zerolinecolor: "rgba(0,0,0,0.2)",
          gridcolor: "rgba(0,0,0,0.1)",
          hoverformat: ".2f",
        },
        yaxis: {
          title: {
            text: yCol,
            font: { size: 14 },
          },
          zeroline: true,
          zerolinecolor: "rgba(0,0,0,0.2)",
          gridcolor: "rgba(0,0,0,0.1)",
          hoverformat: ".2f",
        },
        hovermode: "closest",
        legend: {
          orientation: "h",
          y: -0.2,
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Correlation Coefficient:</b> ${formatNumber(
              correlation
            )}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
          {
            x: 0.5,
            y: 1.05,
            xref: "paper",
            yref: "paper",
            text: `<b>Trend Line:</b> y = ${formatNumber(
              slope
            )}x + ${formatNumber(intercept)}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToAdd: ["drawline", "drawopenpath", "eraseshape"],
        toImageButtonOptions: {
          format: "png",
          filename: `scatter_${xCol}_vs_${yCol}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in scatter plot:", error);
    return {
      data: [],
      layout: { title: `Error loading scatter plot` },
    };
  }
};

/* ---------- 2. Line ----------------------------------------------------- */
export const getLinePlot = async (xCol, yCol) => {
  try {
    const endpoint = `${API}/line?x_col=${encodeURIComponent(
      xCol
    )}&y_col=${encodeURIComponent(yCol)}`;
    const raw = await fetchWithCache(endpoint); // [{x, y}, ...]

    // Sort by x value for proper line connection
    const sortedData = [...raw].sort((a, b) => a.x - b.x);

    // Calculate statistics for trend analysis
    const xValues = sortedData.map((p) => p.x);
    const yValues = sortedData.map((p) => p.y);
    const xStats = getBasicStats(xValues);
    const yStats = getBasicStats(yValues);

    // Simple moving average (smoothed line) with window size of 3
    const smoothedY = [];
    for (let i = 0; i < yValues.length; i++) {
      if (i === 0 || i === yValues.length - 1) {
        smoothedY.push(yValues[i]);
      } else {
        smoothedY.push((yValues[i - 1] + yValues[i] + yValues[i + 1]) / 3);
      }
    }

    return {
      data: [
        {
          type: "scatter",
          mode: "lines+markers",
          x: sortedData.map((p) => p.x),
          y: sortedData.map((p) => p.y),
          line: {
            shape: "linear",
            color: "#3b82f6",
            width: 2,
          },
          marker: {
            size: 6,
            color: "#2563eb",
          },
          name: yCol,
          hovertemplate: `<b>${xCol}</b>: %{x}<br><b>${yCol}</b>: %{y}<extra></extra>`,
        },
        {
          type: "scatter",
          mode: "lines",
          x: sortedData.map((p) => p.x),
          y: smoothedY,
          line: {
            shape: "spline",
            color: "rgba(16, 185, 129, 0.7)",
            width: 2,
            dash: "dash",
          },
          name: "Smoothed Trend",
          hoverinfo: "skip",
          showlegend: true,
        },
      ],
      layout: {
        title: {
          text: `<b>Line Plot: ${yCol} over ${xCol}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: {
            text: xCol,
            font: { size: 14 },
          },
          zeroline: false,
          gridcolor: "rgba(0,0,0,0.1)",
        },
        yaxis: {
          title: {
            text: yCol,
            font: { size: 14 },
          },
          zeroline: false,
          gridcolor: "rgba(0,0,0,0.1)",
        },
        legend: {
          orientation: "h",
          y: -0.2,
        },
        hovermode: "closest",
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Summary:</b> Min=${formatNumber(
              yStats.min
            )}, Max=${formatNumber(yStats.max)}, Average=${formatNumber(
              yStats.mean
            )}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
          {
            x: 0.5,
            y: 1.05,
            xref: "paper",
            yref: "paper",
            text: `<b>Range:</b> ${xCol}: ${formatNumber(
              xStats.min
            )} to ${formatNumber(xStats.max)}, ${yCol}: ${formatNumber(
              yStats.min
            )} to ${formatNumber(yStats.max)}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToAdd: ["drawline", "drawopenpath", "eraseshape"],
        toImageButtonOptions: {
          format: "png",
          filename: `line_${yCol}_over_${xCol}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in line plot:", error);
    return {
      data: [],
      layout: { title: `Error loading line plot` },
    };
  }
};

/* ---------- 3. Box-by-Category ----------------------------------------- */
export const getBoxByCategory = async (catCol, valCol) => {
  try {
    const endpoint = `${API}/box_by_category?category_col=${encodeURIComponent(
      catCol
    )}&value_col=${encodeURIComponent(valCol)}`;
    const raw = await fetchWithCache(endpoint); // [{category,min,q1,median,q3,max}, ...]

    // Sort by median for better visualization
    const sortedData = [...raw].sort((a, b) => b.median - a.median);

    // Generate colors
    const colors = generateColors(sortedData.length, "teal");

    // Calculate overall statistics and category counts
    const allMedians = sortedData.map((r) => r.median);
    const overallMedian = getBasicStats(allMedians).mean;

    return {
      data: sortedData.map((r, idx) => ({
        type: "box",
        name: r.category,
        y: [r.min, r.q1, r.median, r.q3, r.max], // We'll use notched box plots
        boxmean: true, // Show mean
        boxpoints: "suspectedoutliers",
        notched: true, // Add notches for confidence intervals
        marker: {
          color: colors[idx % colors.length],
          opacity: 0.7,
          outliercolor: "rgba(219, 39, 119, 0.6)",
        },
        line: {
          width: 1,
        },
        hoverinfo: "y",
        hovertemplate:
          `<b>${r.category}</b><br>` +
          `Min: ${formatNumber(r.min)}<br>` +
          `Q1: ${formatNumber(r.q1)}<br>` +
          `Median: ${formatNumber(r.median)}<br>` +
          `Q3: ${formatNumber(r.q3)}<br>` +
          `Max: ${formatNumber(r.max)}<extra></extra>`,
      })),
      layout: {
        title: {
          text: `<b>Box Plot of ${valCol} grouped by ${catCol}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: {
            text: catCol,
            font: { size: 14 },
          },
        },
        yaxis: {
          title: {
            text: valCol,
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
          zeroline: false,
        },
        boxmode: "group",
        showlegend: false,
        shapes: [
          // Add a horizontal line for overall median
          {
            type: "line",
            xref: "paper",
            x0: 0,
            x1: 1,
            y0: overallMedian,
            y1: overallMedian,
            line: {
              color: "rgba(220, 38, 38, 0.5)",
              width: 2,
              dash: "dash",
            },
          },
        ],
        annotations: [
          {
            x: 1.02,
            y: overallMedian,
            xref: "paper",
            yref: "y",
            text: "Overall Median",
            showarrow: false,
            font: { size: 10, color: "rgba(220, 38, 38, 0.9)" },
            bgcolor: "rgba(255,255,255,0.7)",
            borderwidth: 1,
            borderpad: 2,
          },
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Comparison:</b> ${sortedData.length} categories of ${catCol} showing distribution of ${valCol}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: `boxplot_${valCol}_by_${catCol}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in box by category plot:", error);
    return {
      data: [],
      layout: { title: `Error loading box plot` },
    };
  }
};

/* ---------- 4. Grouped Bar --------------------------------------------- */
export const getGroupedBarPlot = async (catCol, groupCol) => {
  try {
    const endpoint = `${API}/grouped_bar?category_col=${encodeURIComponent(
      catCol
    )}&group_col=${encodeURIComponent(groupCol)}`;
    const raw = await fetchWithCache(endpoint); // [{category,group,value}]

    // Extract unique categories and groups
    const groups = [...new Set(raw.map((r) => r.group))];
    const categories = [...new Set(raw.map((r) => r.category))];

    // Sort categories by total value for better visualization
    const categoryTotals = {};
    categories.forEach((cat) => {
      categoryTotals[cat] = raw
        .filter((r) => r.category === cat)
        .reduce((sum, r) => sum + r.value, 0);
    });

    const sortedCategories = [...categories].sort(
      (a, b) => categoryTotals[b] - categoryTotals[a]
    );

    // Generate colors for groups
    const colors = generateColors(groups.length, "green");

    // Create traces for each group
    const traces = groups.map((g, idx) => ({
      type: "bar",
      name: g,
      x: sortedCategories,
      y: sortedCategories.map(
        (c) =>
          (raw.find((r) => r.group === g && r.category === c) || {}).value || 0
      ),
      marker: {
        color: colors[idx % colors.length],
        opacity: 0.8,
        line: {
          color: "rgba(58, 58, 58, 0.5)",
          width: 1,
        },
      },
      hovertemplate: `<b>${catCol}:</b> %{x}<br><b>${groupCol}:</b> ${g}<br><b>Value:</b> %{y}<extra></extra>`,
    }));

    // Calculate group totals for annotations
    const groupTotals = {};
    groups.forEach((g) => {
      groupTotals[g] = raw
        .filter((r) => r.group === g)
        .reduce((sum, r) => sum + r.value, 0);
    });

    const totalSum = Object.values(groupTotals).reduce((a, b) => a + b, 0);

    const percentages = {};
    Object.entries(groupTotals).forEach(([group, total]) => {
      percentages[group] = ((total / totalSum) * 100).toFixed(1) + "%";
    });

    return {
      data: traces,
      layout: {
        title: {
          text: `<b>Grouped Bar Chart: ${catCol} by ${groupCol}</b>`,
          font: { size: 18 },
        },
        barmode: "group",
        bargap: 0.15,
        bargroupgap: 0.1,
        xaxis: {
          title: {
            text: catCol,
            font: { size: 14 },
          },
          tickangle: sortedCategories.length > 5 ? -45 : 0,
          automargin: true,
        },
        yaxis: {
          title: {
            text: "Count",
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        hoverlabel: { bgcolor: "white" },
        hovermode: "closest",
        legend: {
          orientation: Object.keys(groupTotals).length > 5 ? "v" : "h",
          y: Object.keys(groupTotals).length > 5 ? 1 : -0.15,
          bgcolor: "rgba(255,255,255,0.8)",
          bordercolor: "rgba(0,0,0,0.1)",
          borderwidth: 1,
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Group Distribution:</b> ${Object.entries(percentages)
              .map(([g, p]) => `${g}: ${p}`)
              .join(", ")}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: `grouped_bar_${catCol}_by_${groupCol}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in grouped bar plot:", error);
    return {
      data: [],
      layout: { title: `Error loading grouped bar plot` },
    };
  }
};

/* ---------- 5. Heatmap / Correlation ----------------------------------- */
export const getHeatmap = async (cols) => {
  try {
    const endpoint = `${API}/heatmap?cols=${cols
      .map((col) => encodeURIComponent(col))
      .join(",")}`;
    const raw = await fetchWithCache(endpoint); // [{x,y,value}]

    // Extract unique x and y labels
    const xLabels = [...new Set(raw.map((p) => p.x))];
    const yLabels = [...new Set(raw.map((p) => p.y))];

    // Build Z matrix for the heatmap
    const z = yLabels.map((y) =>
      xLabels.map(
        (x) => (raw.find((p) => p.x === x && p.y === y) || {}).value || 0
      )
    );

    // Format annotations text - show correlation value in each cell
    const textMatrix = yLabels.map((y) =>
      xLabels.map((x) => {
        const value =
          (raw.find((p) => p.x === x && p.y === y) || {}).value || 0;
        return value.toFixed(2);
      })
    );

    return {
      data: [
        {
          type: "heatmap",
          x: xLabels,
          y: yLabels,
          z,
          text: textMatrix,
          colorscale: "RdBu_r", // Red-Blue diverging colorscale
          zmid: 0, // Center the colorscale at 0
          showscale: true,
          colorbar: {
            title: {
              text: "Correlation",
              side: "right",
            },
            thickness: 15,
            len: 0.9,
            y: 0.5,
          },
          hovertemplate:
            "<b>%{x}</b> vs <b>%{y}</b><br>Correlation: %{z:.3f}<extra></extra>",
        },
      ],
      layout: {
        title: {
          text: `<b>Correlation Heatmap</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: "Variables",
          tickangle: 45,
        },
        yaxis: {
          title: "Variables",
          automargin: true,
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Correlation Matrix for:</b> ${cols.join(", ")}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
          {
            x: 0.5,
            y: 1.05,
            xref: "paper",
            yref: "paper",
            text: "Closer to 1 (blue) = Strong positive correlation, Closer to -1 (red) = Strong negative correlation",
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
          // Add correlation values as annotations
          ...raw.map((item) => ({
            x: item.x,
            y: item.y,
            text: item.value.toFixed(2),
            font: {
              color: Math.abs(item.value) > 0.7 ? "white" : "black",
              size: 10,
            },
            showarrow: false,
          })),
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: `correlation_heatmap`,
          height: 700,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in heatmap plot:", error);
    return {
      data: [],
      layout: { title: `Error loading heatmap` },
    };
  }
};

/* ---------- 6. Stacked Bar --------------------------------------------- */
export const getStackedBarPlot = async (xCol, stackCol) => {
  try {
    const endpoint = `${API}/stacked_bar?x_col=${encodeURIComponent(
      xCol
    )}&stack_col=${encodeURIComponent(stackCol)}`;
    const raw = await fetchWithCache(endpoint); // [{x, StackA: 10, StackB: 4, ...}, ...]

    // Extract x values and stack categories
    const xVals = raw.map((r) => r.x);
    const stackCats = Object.keys(raw[0]).filter((k) => k !== "x");

    // Sort x values by total for better visualization
    const xTotals = {};
    xVals.forEach((x) => {
      const row = raw.find((r) => r.x === x) || {};
      xTotals[x] = stackCats.reduce((sum, cat) => sum + (row[cat] || 0), 0);
    });

    const sortedXVals = [...xVals].sort((a, b) => xTotals[b] - xTotals[a]);

    // Generate colors for stack categories
    const colors = generateColors(stackCats.length, "purple");

    // Create traces for each stack category
    const traces = stackCats.map((cat, idx) => ({
      type: "bar",
      name: cat,
      x: sortedXVals,
      y: sortedXVals.map((x) => (raw.find((r) => r.x === x) || {})[cat] || 0),
      marker: {
        color: colors[idx % colors.length],
        line: { width: 1, color: "rgba(255,255,255,0.4)" },
      },
      hovertemplate: `<b>${xCol}:</b> %{x}<br><b>${stackCol}:</b> ${cat}<br><b>Value:</b> %{y}<extra></extra>`,
    }));

    // Calculate stack category totals and percentages for annotations
    const catTotals = {};
    stackCats.forEach((cat) => {
      catTotals[cat] = raw.reduce((sum, r) => sum + (r[cat] || 0), 0);
    });

    const totalSum = Object.values(catTotals).reduce((a, b) => a + b, 0);
    const percentages = {};
    Object.entries(catTotals).forEach(([cat, total]) => {
      percentages[cat] = ((total / totalSum) * 100).toFixed(1) + "%";
    });

    return {
      data: traces,
      layout: {
        title: {
          text: `<b>Stacked Bar Chart: ${xCol} split by ${stackCol}</b>`,
          font: { size: 18 },
        },
        barmode: "stack",
        xaxis: {
          title: {
            text: xCol,
            font: { size: 14 },
          },
          tickangle: sortedXVals.length > 5 ? -45 : 0,
          automargin: true,
        },
        yaxis: {
          title: {
            text: "Count",
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        hovermode: "closest",
        legend: {
          orientation: stackCats.length > 5 ? "v" : "h",
          y: stackCats.length > 5 ? 1 : -0.15,
          bgcolor: "rgba(255,255,255,0.8)",
          bordercolor: "rgba(0,0,0,0.1)",
          borderwidth: 1,
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Distribution by ${stackCol}:</b> ${Object.entries(
              percentages
            )
              .slice(0, 5)
              .map(([cat, p]) => `${cat}: ${p}`)
              .join(", ")}${stackCats.length > 5 ? "..." : ""}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: `stacked_bar_${xCol}_by_${stackCol}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in stacked bar plot:", error);
    return {
      data: [],
      layout: { title: `Error loading stacked bar plot` },
    };
  }
};

/* ---------- 7. Hexbin --------------------------------------------------- */
export const getHexbinPlot = async (xCol, yCol) => {
  try {
    const endpoint = `${API}/hexbin?x_col=${encodeURIComponent(
      xCol
    )}&y_col=${encodeURIComponent(yCol)}`;
    const raw = await fetchWithCache(endpoint); // [{x,y,value}]

    // Extract unique x and y coordinates for the hexbin grid
    const xLabels = [...new Set(raw.map((p) => p.x))].sort((a, b) => a - b);
    const yLabels = [...new Set(raw.map((p) => p.y))].sort((a, b) => a - b);

    // Create z matrix for heatmap rendering of hexbins
    const z = yLabels.map((y) =>
      xLabels.map(
        (x) => (raw.find((p) => p.x === x && p.y === y) || {}).value || 0
      )
    );

    // Find max count for color scaling
    const maxCount = Math.max(...raw.map((p) => p.value));

    return {
      data: [
        {
          type: "heatmap",
          x: xLabels,
          y: yLabels,
          z,
          colorscale: "Viridis",
          showscale: true,
          colorbar: {
            title: {
              text: "Count",
              side: "right",
            },
            thickness: 15,
            len: 0.9,
            y: 0.5,
          },
          hovertemplate:
            `<b>${xCol}</b>: %{x}<br>` +
            `<b>${yCol}</b>: %{y}<br>` +
            `<b>Count</b>: %{z}<br>` +
            `<extra></extra>`,
          zauto: true,
        },
      ],
      layout: {
        title: {
          text: `<b>Density Heatmap: ${yCol} vs ${xCol}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: {
            text: xCol,
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        yaxis: {
          title: {
            text: yCol,
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Density Distribution:</b> Darker colors represent higher concentration of data points`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
          {
            x: 0.5,
            y: 1.05,
            xref: "paper",
            yref: "paper",
            text: `<b>Max Count:</b> ${maxCount} data points in the most dense cell`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: `hexbin_density_${yCol}_vs_${xCol}`,
          height: 600,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in hexbin plot:", error);
    return {
      data: [],
      layout: { title: `Error loading hexbin density plot` },
    };
  }
};

/* ---------- 8. Bubble --------------------------------------------------- */
export const getBubblePlot = async (xCol, yCol, sizeCol) => {
  try {
    const endpoint = `${API}/bubble?x_col=${encodeURIComponent(
      xCol
    )}&y_col=${encodeURIComponent(yCol)}&size_col=${encodeURIComponent(
      sizeCol
    )}`;
    const raw = await fetchWithCache(endpoint); // [{x,y,size}]

    // Calculate statistics for annotations
    const xValues = raw.map((p) => p.x);
    const yValues = raw.map((p) => p.y);
    const sizes = raw.map((p) => p.size);

    const xStats = getBasicStats(xValues);
    const yStats = getBasicStats(yValues);
    const sizeStats = getBasicStats(sizes);

    // Calculate size reference for better visual scaling
    const maxSize = Math.max(...sizes);
    const sizeRef = (2.0 * maxSize) / 100 ** 2;

    // Create color gradient based on size
    const colors = sizes.map((size) => {
      const normalized =
        (size - sizeStats.min) / (sizeStats.max - sizeStats.min || 1);
      return `rgb(${Math.round(70 + 150 * normalized)}, ${Math.round(
        100 + 50 * normalized
      )}, 241)`;
    });

    return {
      data: [
        {
          type: "scatter",
          mode: "markers",
          x: xValues,
          y: yValues,
          text: raw.map(
            (p, i) =>
              `${xCol}: ${formatNumber(p.x)}<br>` +
              `${yCol}: ${formatNumber(p.y)}<br>` +
              `${sizeCol}: ${formatNumber(p.size)}`
          ),
          marker: {
            size: sizes,
            sizemode: "area",
            sizeref: sizeRef,
            sizemin: 4,
            color: colors,
            opacity: 0.7,
            line: {
              width: 1,
              color: "rgba(0,0,0,0.3)",
            },
            colorscale: "Blues",
            colorbar: {
              title: sizeCol,
              thickness: 15,
              len: 0.9,
              y: 0.5,
            },
          },
          hovertemplate:
            `<b>${xCol}</b>: %{x}<br>` +
            `<b>${yCol}</b>: %{y}<br>` +
            `<b>${sizeCol}</b>: %{marker.size}<extra></extra>`,
        },
      ],
      layout: {
        title: {
          text: `<b>Bubble Plot: ${yCol} vs ${xCol} (sized by ${sizeCol})</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: {
            text: xCol,
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
          zeroline: true,
          zerolinecolor: "rgba(0,0,0,0.2)",
        },
        yaxis: {
          title: {
            text: yCol,
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
          zeroline: true,
          zerolinecolor: "rgba(0,0,0,0.2)",
        },
        hovermode: "closest",
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Size Range (${sizeCol}):</b> Min=${formatNumber(
              sizeStats.min
            )}, Max=${formatNumber(sizeStats.max)}, Avg=${formatNumber(
              sizeStats.mean
            )}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
          {
            x: 0.5,
            y: 1.05,
            xref: "paper",
            yref: "paper",
            text: `<b>Range:</b> ${xCol}: ${formatNumber(
              xStats.min
            )} to ${formatNumber(xStats.max)}, ${yCol}: ${formatNumber(
              yStats.min
            )} to ${formatNumber(yStats.max)}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToAdd: ["select2d", "lasso2d", "resetScale2d"],
        toImageButtonOptions: {
          format: "png",
          filename: `bubble_${yCol}_vs_${xCol}_by_${sizeCol}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in bubble plot:", error);
    return {
      data: [],
      layout: { title: `Error loading bubble plot` },
    };
  }
};

/* ---------- 9. Mosaic --------------------------------------------------- */
export const getMosaicPlot = async (col1, col2) => {
  try {
    const endpoint = `${API}/mosaic?col1=${encodeURIComponent(
      col1
    )}&col2=${encodeURIComponent(col2)}`;
    const raw = await fetchWithCache(endpoint); // [{x,y,value,percentage}]

    // Extract unique categories for x and y
    const xCats = [...new Set(raw.map((r) => r.x))];
    const yCats = [...new Set(raw.map((r) => r.y))];

    // Sort categories by their total values for better visualization
    const xTotals = {};
    xCats.forEach((x) => {
      xTotals[x] = raw
        .filter((r) => r.x === x)
        .reduce((sum, r) => sum + r.value, 0);
    });

    const sortedXCats = [...xCats].sort((a, b) => xTotals[b] - xTotals[a]);

    // Generate colors for the y categories
    const colors = generateColors(yCats.length, "orange");

    // Create one trace per y category
    const traces = yCats.map((y, idx) => ({
      type: "bar",
      name: y,
      x: sortedXCats,
      y: sortedXCats.map(
        (x) => (raw.find((r) => r.x === x && r.y === y) || {}).value || 0
      ),
      marker: {
        color: colors[idx % colors.length],
        line: { width: 1, color: "rgba(255,255,255,0.4)" },
      },
      hovertemplate: `<b>${col1}</b>: %{x}<br><b>${col2}</b>: ${y}<br><b>Count</b>: %{y}<br><b>Percentage</b>: ${sortedXCats.map(
        (x) => {
          const item = raw.find((r) => r.x === x && r.y === y) || {};
          return item.percentage
            ? `${(item.percentage * 100).toFixed(1)}%`
            : "0%";
        }
      )}<extra></extra>`,
    }));

    // Calculate category percentages for annotations
    const totalSum = raw.reduce((sum, r) => sum + r.value, 0);

    const yPercentages = {};
    yCats.forEach((y) => {
      const yTotal = raw
        .filter((r) => r.y === y)
        .reduce((sum, r) => sum + r.value, 0);
      yPercentages[y] = ((yTotal / totalSum) * 100).toFixed(1) + "%";
    });

    return {
      data: traces,
      layout: {
        title: {
          text: `<b>Mosaic Plot: ${col1} vs ${col2}</b>`,
          font: { size: 18 },
        },
        barmode: "stack",
        xaxis: {
          title: {
            text: col1,
            font: { size: 14 },
          },
          tickangle: sortedXCats.length > 5 ? -45 : 0,
          automargin: true,
        },
        yaxis: {
          title: {
            text: "Count",
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        hovermode: "closest",
        legend: {
          orientation: yCats.length > 5 ? "v" : "h",
          y: yCats.length > 5 ? 1 : -0.15,
          title: {
            text: col2,
            font: { size: 12 },
          },
          bgcolor: "rgba(255,255,255,0.8)",
          bordercolor: "rgba(0,0,0,0.1)",
          borderwidth: 1,
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Distribution of ${col2}:</b> ${Object.entries(
              yPercentages
            )
              .slice(0, 5)
              .map(([y, p]) => `${y}: ${p}`)
              .join(", ")}${yCats.length > 5 ? "..." : ""}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: `mosaic_${col1}_vs_${col2}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in mosaic plot:", error);
    return {
      data: [],
      layout: { title: `Error loading mosaic plot` },
    };
  }
};

/* ---------- Optional combined export --------------------------- */
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
