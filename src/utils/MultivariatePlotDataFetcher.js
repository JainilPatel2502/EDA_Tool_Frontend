const api = "http://127.0.0.1:8000/multivariate";

// Simple cache for API responses
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

// Color generation utilities
const generateColorScale = (n) => {
  const colorScales = [
    [
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
    ],
    [
      "#67001f",
      "#b2182b",
      "#d6604d",
      "#f4a582",
      "#fddbc7",
      "#d1e5f0",
      "#92c5de",
      "#4393c3",
      "#2166ac",
      "#053061",
    ],
    [
      "#7fc97f",
      "#beaed4",
      "#fdc086",
      "#ffff99",
      "#386cb0",
      "#f0027f",
      "#bf5b17",
      "#666666",
    ],
  ];

  // If we need more colors than available, we'll repeat with opacity variations
  const baseColors = colorScales[0]
    .concat(colorScales[1])
    .concat(colorScales[2]);

  if (n <= baseColors.length) {
    return baseColors.slice(0, n);
  }

  // Generate more colors by varying opacity
  const colors = [...baseColors];
  let opacityIndex = 0;
  const opacities = [0.8, 0.6, 0.4];

  while (colors.length < n) {
    const baseColor = baseColors[colors.length % baseColors.length];
    const opacity = opacities[opacityIndex % opacities.length];
    // Convert hex to rgba
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    colors.push(`rgba(${r},${g},${b},${opacity})`);
    opacityIndex++;
  }

  return colors;
};

const createStatsSummary = (data, cols) => {
  const stats = {};

  cols.forEach((col) => {
    if (!data || !data[0] || data[0][col] === undefined) return;

    const values = data.map((d) => parseFloat(d[col])).filter((v) => !isNaN(v));

    if (values.length === 0) return;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    values.sort((a, b) => a - b);
    const median =
      values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)];

    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    stats[col] = {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: mean,
      median: median,
      stdDev: stdDev,
      q1: values[Math.floor(values.length * 0.25)],
      q3: values[Math.floor(values.length * 0.75)],
    };
  });

  return stats;
};

export const getPairPlot = async (cols) => {
  if (!cols || cols.length < 2) return [];

  try {
    const queryParams = cols
      .map((col) => `cols=${encodeURIComponent(col)}`)
      .join("&");
    const endpoint = `${api}/pair_plot?${queryParams}`;

    const raw = await fetchWithCache(endpoint);

    // Generate a color palette for consistent coloring
    const colors = generateColorScale(raw.length);

    return raw.map((pair, index) => {
      // Create summary stats for tooltips
      const xValues = pair.data.map((d) => d.x);
      const yValues = pair.data.map((d) => d.y);
      const xStats = {
        min: Math.min(...xValues),
        max: Math.max(...xValues),
        avg: xValues.reduce((a, b) => a + b, 0) / xValues.length,
      };
      const yStats = {
        min: Math.min(...yValues),
        max: Math.max(...yValues),
        avg: yValues.reduce((a, b) => a + b, 0) / yValues.length,
      };

      return {
        data: [
          {
            x: pair.data.map((d) => d.x),
            y: pair.data.map((d) => d.y),
            mode: "markers",
            type: "scatter",
            name: `${pair.x_col} vs ${pair.y_col}`,
            marker: {
              color: colors[index % colors.length],
              size: 8,
              opacity: 0.7,
              line: { width: 1, color: "white" },
            },
            hovertemplate: `
              <b>${pair.x_col}</b>: %{x}<br>
              <b>${pair.y_col}</b>: %{y}<br>
              <extra></extra>
            `,
          },
        ],
        layout: {
          title: {
            text: `<b>${pair.x_col}</b> vs <b>${pair.y_col}</b>`,
            font: { size: 16 },
          },
          xaxis: {
            title: pair.x_col,
            zeroline: false,
            hoverformat: ".2f",
            showgrid: true,
            gridcolor: "rgba(0,0,0,0.1)",
          },
          yaxis: {
            title: pair.y_col,
            zeroline: false,
            hoverformat: ".2f",
            showgrid: true,
            gridcolor: "rgba(0,0,0,0.1)",
          },
          showlegend: false,
          margin: { l: 60, r: 30, t: 50, b: 60 },
          hoverlabel: { bgcolor: "#FFF", font: { size: 12 } },
          annotations: [
            {
              x: 0.5,
              y: -0.17,
              showarrow: false,
              text: `${pair.x_col} (Min: ${xStats.min.toFixed(
                2
              )}, Max: ${xStats.max.toFixed(2)}, Avg: ${xStats.avg.toFixed(
                2
              )})`,
              xref: "paper",
              yref: "paper",
              font: { size: 10 },
            },
            {
              x: -0.17,
              y: 0.5,
              showarrow: false,
              text: `${pair.y_col} (Min: ${yStats.min.toFixed(
                2
              )}, Max: ${yStats.max.toFixed(2)}, Avg: ${yStats.avg.toFixed(
                2
              )})`,
              xref: "paper",
              yref: "paper",
              textangle: -90,
              font: { size: 10 },
            },
          ],
        },
        config: {
          responsive: true,
          displaylogo: false,
          modeBarButtonsToAdd: ["drawline", "drawopenpath", "eraseshape"],
          toImageButtonOptions: {
            format: "png",
            filename: `${pair.x_col}_vs_${pair.y_col}`,
            height: 500,
            width: 700,
            scale: 2,
          },
        },
      };
    });
  } catch (error) {
    console.error("Error fetching pair plot data:", error);
    return [];
  }
};

export const getParallelCoordinates = async (cols, category) => {
  if (!cols || cols.length < 2)
    return { data: [], layout: { title: "Parallel Coordinates" } };

  try {
    let queryParams = cols
      .map((col) => `cols=${encodeURIComponent(col)}`)
      .join("&");
    if (category) {
      queryParams += `&category_col=${encodeURIComponent(category)}`;
    }

    const endpoint = `${api}/parallel_coordinates?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Get stats for each column for better tooltips
    const stats = createStatsSummary(raw, cols);

    let data = [];

    if (category) {
      // Group data by category
      const categories = [...new Set(raw.map((d) => d[category]))];
      const colors = generateColorScale(categories.length);

      categories.forEach((cat, idx) => {
        const filteredData = raw.filter((d) => d[category] === cat);
        data.push({
          type: "parcoords",
          line: {
            color: colors[idx],
            colorscale: [
              [0, colors[idx]],
              [1, colors[idx]],
            ],
            showscale: false,
          },
          dimensions: cols.map((col) => ({
            label: col,
            values: filteredData.map((row) => row[col]),
            range: [stats[col]?.min || 0, stats[col]?.max || 100],
            tickvals: [
              stats[col]?.min || 0,
              stats[col]?.q1,
              stats[col]?.median,
              stats[col]?.q3,
              stats[col]?.max || 100,
            ],
            ticktext: [
              `Min: ${stats[col]?.min?.toFixed(2) || 0}`,
              `Q1: ${stats[col]?.q1?.toFixed(2) || 0}`,
              `Med: ${stats[col]?.median?.toFixed(2) || 0}`,
              `Q3: ${stats[col]?.q3?.toFixed(2) || 0}`,
              `Max: ${stats[col]?.max?.toFixed(2) || 100}`,
            ],
          })),
          name: `${category}: ${cat}`,
        });
      });
    } else {
      // Create one parallel coordinates plot without categories
      data.push({
        type: "parcoords",
        line: {
          color: "#1f77b4",
          colorscale: [
            [0, "#1f77b4"],
            [1, "#1f77b4"],
          ],
          showscale: false,
        },
        dimensions: cols.map((col) => ({
          label: col,
          values: raw.map((row) => row[col]),
          range: [stats[col]?.min || 0, stats[col]?.max || 100],
          tickvals: [
            stats[col]?.min || 0,
            stats[col]?.q1,
            stats[col]?.median,
            stats[col]?.q3,
            stats[col]?.max || 100,
          ],
          ticktext: [
            `Min: ${stats[col]?.min?.toFixed(2) || 0}`,
            `Q1: ${stats[col]?.q1?.toFixed(2) || 0}`,
            `Med: ${stats[col]?.median?.toFixed(2) || 0}`,
            `Q3: ${stats[col]?.q3?.toFixed(2) || 0}`,
            `Max: ${stats[col]?.max?.toFixed(2) || 100}`,
          ],
        })),
      });
    }

    return {
      data,
      layout: {
        title: {
          text: category
            ? `Parallel Coordinates by ${category}`
            : "Parallel Coordinates",
          font: { size: 18 },
        },
        margin: { l: 80, r: 80, t: 100, b: 80 },
        showlegend: !!category,
        legend: {
          orientation: "h",
          y: -0.2,
          title: { text: category },
        },
      },
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "parallel_coordinates",
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching parallel coordinates data:", error);
    return { data: [], layout: { title: "Parallel Coordinates - Error" } };
  }
};

// export const getRadarChart = async (categoryCol, valueCols) => {
//   if (!categoryCol || !valueCols || valueCols.length < 1) {
//     return { data: [], layout: { title: "Radar Chart" } };
//   }

//   try {
//     let queryParams = `category_col=${encodeURIComponent(categoryCol)}`;
//     queryParams +=
//       "&" +
//       valueCols.map((col) => `value_cols=${encodeURIComponent(col)}`).join("&");

//     const endpoint = `${api}/radar_chart?${queryParams}`;
//     const raw = await fetchWithCache(endpoint);

//     // Generate nice colors for each category
//     const colors = generateColorScale(raw.length);

//     // Create dataset with enhanced visualization
//     const data = raw.map((row, idx) => ({
//       type: "scatterpolar",
//       r: Object.values(row.values),
//       theta: Object.keys(row.values),
//       name: row.category,
//       fill: "toself",
//       fillcolor: colors[idx % colors.length]
//         .replace(")", ", 0.3)")
//         .replace("rgb", "rgba"),
//       line: {
//         color: colors[idx % colors.length],
//         width: 2,
//       },
//       hovertemplate:
//         Object.entries(row.values)
//           .map(
//             ([key, val]) =>
//               `<b>${key}</b>: ${typeof val === "number" ? val.toFixed(2) : val}`
//           )
//           .join("<br>") +
//         "<br><b>Category: </b>%{fullData.name}<extra></extra>",
//     }));

//     // Calculate the maximum value across all dimensions for consistent scaling
//     const maxValue = Math.max(
//       ...raw.flatMap((row) =>
//         Object.values(row.values).map((val) =>
//           typeof val === "number" ? val : 0
//         )
//       )
//     );

//     // Create a refined layout
//     const layout = {
//       polar: {
//         radialaxis: {
//           visible: true,
//           range: [0, maxValue * 1.1], // Add 10% padding
//           tickfont: { size: 10 },
//           tickangle: 45,
//           gridcolor: "rgba(0,0,0,0.1)",
//           ticksuffix: "",
//         },
//         angularaxis: {
//           tickfont: { size: 12 },
//           linecolor: "rgba(0,0,0,0.3)",
//           gridcolor: "rgba(0,0,0,0.1)",
//         },
//         bgcolor: "rgba(240,240,240,0.1)",
//       },
//       title: {
//         text: `Radar Chart by ${categoryCol}`,
//         font: { size: 18 },
//       },
//       legend: {
//         x: 1,
//         y: 1,
//         bgcolor: "rgba(255,255,255,0.6)",
//         bordercolor: "rgba(0,0,0,0.2)",
//         borderwidth: 1,
//         title: { text: categoryCol, font: { size: 14 } },
//       },
//       margin: { l: 80, r: 80, t: 100, b: 80 },
//       showlegend: true,
//       annotations: [
//         {
//           x: 0.5,
//           y: -0.15,
//           xref: "paper",
//           yref: "paper",
//           text: `Variables: ${valueCols.join(", ")}`,
//           showarrow: false,
//           font: { size: 12 },
//         },
//       ],
//     };

//     return {
//       data,
//       layout,
//       config: {
//         responsive: true,
//         displaylogo: false,
//         toImageButtonOptions: {
//           format: "png",
//           filename: "radar_chart",
//           scale: 2,
//         },
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching radar chart data:", error);
//     return { data: [], layout: { title: "Radar Chart - Error" } };
//   }
// };

export const getRadarChart = async (categoryCol, valueCols) => {
  if (!categoryCol || !valueCols || valueCols.length < 1) {
    return { data: [], layout: { title: "Radar Chart" } };
  }

  try {
    let queryParams = `category_col=${encodeURIComponent(categoryCol)}`;
    queryParams +=
      "&" +
      valueCols.map((col) => `value_cols=${encodeURIComponent(col)}`).join("&");

    const endpoint = `${api}/radar_chart?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Check if we have valid data
    if (!raw || raw.length === 0) {
      return {
        data: [],
        layout: {
          title: "Radar Chart - No Data Available",
          annotations: [
            {
              text: "No data available for the selected columns",
              showarrow: false,
              x: 0.5,
              y: 0.5,
              xref: "paper",
              yref: "paper",
              font: { size: 16, color: "#666" },
            },
          ],
        },
      };
    }

    // Handle normalization option (normalize values to 0-1 scale)
    // This helps when variables have very different scales
    const shouldNormalize = valueCols.length > 1;

    // Calculate min and max values for each dimension for normalization
    const dimensionStats = {};
    if (shouldNormalize) {
      valueCols.forEach((col) => {
        const values = raw.flatMap((row) => {
          const val = row.values[col];
          return typeof val === "number" && !isNaN(val) ? [val] : [];
        });

        dimensionStats[col] = {
          min: Math.min(...values),
          max: Math.max(...values),
          range: Math.max(...values) - Math.min(...values),
        };
      });
    }

    // Function to normalize value (if needed)
    const normalizeValue = (value, dimension) => {
      if (
        !shouldNormalize ||
        typeof value !== "number" ||
        isNaN(value) ||
        dimensionStats[dimension].range === 0
      ) {
        return value;
      }
      return (
        (value - dimensionStats[dimension].min) /
        dimensionStats[dimension].range
      );
    };

    // Generate distinct colors with better contrast
    const colors = generateColorScale(raw.length, {
      saturation: 0.8, // Higher saturation for vivid colors
      brightness: 0.9, // Slightly brighter colors
      alpha: 0.7, // More opaque
    });

    // Create dataset with enhanced visualization
    const data = raw.map((row, idx) => {
      // Handle missing or NaN values
      const processedValues = {};
      const originalValues = {};

      Object.entries(row.values).forEach(([key, val]) => {
        if (
          val === null ||
          val === undefined ||
          (typeof val === "number" && isNaN(val))
        ) {
          // Use a fallback value or skip
          processedValues[key] = 0;
          originalValues[key] = "N/A";
        } else {
          processedValues[key] = shouldNormalize
            ? normalizeValue(val, key)
            : val;
          originalValues[key] = val;
        }
      });

      // Create better hover template with both normalized and original values if applicable
      const hoverEntries = Object.entries(row.values).map(([key, val]) => {
        const displayVal = typeof val === "number" ? val.toFixed(2) : val;
        const normalizedVal = processedValues[key];

        if (shouldNormalize && typeof normalizedVal === "number") {
          return `<b>${key}</b>: ${displayVal} <i>(normalized: ${normalizedVal.toFixed(
            2
          )})</i>`;
        }
        return `<b>${key}</b>: ${displayVal}`;
      });

      const color = colors[idx % colors.length];
      const baseColor = color.replace(/[^0-9,]+/g, "").split(",");

      // Create a gradient effect for the fill
      const gradientColor = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.4)`;

      return {
        type: "scatterpolar",
        r: Object.values(processedValues),
        theta: Object.keys(processedValues),
        name: row.category,
        fill: "toself",
        fillcolor: gradientColor,
        line: {
          color: color,
          width: 2.5, // Thicker line for better visibility
          shape: "spline", // Smoother lines
        },
        hovertemplate:
          hoverEntries.join("<br>") +
          "<br><b>Category: </b>%{fullData.name}<extra></extra>",
        // Store original values for reference
        customdata: Object.values(originalValues),
        hoverlabel: {
          bgcolor: "white",
          bordercolor: color,
          font: { family: "Arial", size: 12 },
        },
        // Add marker points for clarity
        mode: "lines+markers",
        marker: {
          size: 5,
          color: color,
          symbol: "circle",
        },
      };
    });

    // Calculate the appropriate range for the chart
    const maxValue = shouldNormalize
      ? 1
      : Math.max(
          ...raw.flatMap((row) =>
            Object.values(row.values).map((val) =>
              typeof val === "number" && !isNaN(val) ? val : 0
            )
          )
        );

    // Create a refined layout with better grid and labels
    const layout = {
      polar: {
        radialaxis: {
          visible: true,
          range: [0, maxValue * 1.05], // Slight padding
          tickfont: { size: 10, color: "#444" },
          tickangle: 45,
          gridcolor: "rgba(0,0,0,0.1)",
          linecolor: "rgba(0,0,0,0.15)",
          nticks: 5, // Optimized number of ticks
          ticksuffix: shouldNormalize ? "" : " ",
          tickformat: shouldNormalize ? ".1f" : "",
          tickmode: "auto",
          layer: "below traces",
        },
        angularaxis: {
          tickfont: { size: 12, color: "#333", weight: 600 },
          linecolor: "rgba(0,0,0,0.2)",
          gridcolor: "rgba(0,0,0,0.05)",
          linewidth: 2,
          layer: "below traces",
          rotation: 90, // Orient the first category at the top
          direction: "clockwise",
        },
        bgcolor: "rgba(240,240,250,0.2)",
        hole: 0.05, // Small hole in the center for aesthetics
      },
      title: {
        text: `Radar Comparison by ${categoryCol}`,
        font: { size: 20, color: "#333", family: "Arial, sans-serif" },
        x: 0.5,
        y: 0.95,
      },
      legend: {
        x: 1.05,
        y: 1,
        bgcolor: "rgba(255,255,255,0.8)",
        bordercolor: "rgba(0,0,0,0.1)",
        borderwidth: 1,
        title: {
          text: categoryCol,
          font: { size: 14, color: "#444" },
        },
        font: { size: 12 },
        orientation: "v",
        yanchor: "top",
        xanchor: "left",
      },
      margin: { l: 80, r: 100, t: 100, b: 80 },
      showlegend: true,
      paper_bgcolor: "rgba(255,255,255,0)",
      plot_bgcolor: "rgba(255,255,255,0)",
      annotations: [
        {
          x: 0.5,
          y: -0.12,
          xref: "paper",
          yref: "paper",
          text: shouldNormalize
            ? `Variables: ${valueCols.join(", ")} (normalized to 0-1 scale)`
            : `Variables: ${valueCols.join(", ")}`,
          showarrow: false,
          font: { size: 12, color: "#666" },
        },
      ],
      dragmode: false, // Disable pan/zoom for cleaner interaction
    };

    return {
      data,
      layout,
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "radar_chart",
          scale: 2,
        },
        modeBarButtonsToAdd: ["resetScale", "hoverClosest"],
        modeBarButtonsToRemove: ["zoom2d", "pan2d", "select2d", "lasso2d"],
      },
      // Add this function to enable toggling categories by clicking legend
      onLegendClick: (event) => {
        const traces = document.querySelectorAll(
          '[class^="scatterlayer"] .trace'
        );
        const name = event.target.textContent;
        const traceIndex = data.findIndex((d) => d.name === name);

        if (traceIndex >= 0 && traces[traceIndex]) {
          traces[traceIndex].style.opacity =
            traces[traceIndex].style.opacity === "0.3" ? "1" : "0.3";
        }
        return false; // Prevent default behavior
      },
    };
  } catch (error) {
    console.error("Error fetching radar chart data:", error);
    return {
      data: [],
      layout: {
        title: "Radar Chart - Error",
        annotations: [
          {
            text: "Failed to load chart data. Please try again.",
            showarrow: false,
            x: 0.5,
            y: 0.5,
            xref: "paper",
            yref: "paper",
            font: { size: 16, color: "#d32f2f" },
          },
        ],
      },
    };
  }
};

export const getTreemap = async (pathCols, valueCol) => {
  if (!pathCols || pathCols.length < 1 || !valueCol) {
    return { data: [], layout: { title: "Treemap" } };
  }

  try {
    let queryParams = pathCols
      .map((col) => `path_cols=${encodeURIComponent(col)}`)
      .join("&");
    queryParams += `&value_col=${encodeURIComponent(valueCol)}`;

    const endpoint = `${api}/treemap?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Improved flatten tree function with correct parent-child relationships
    const flattenHierarchy = (
      tree,
      path = [],
      labels = [],
      parents = [],
      values = [],
      ids = []
    ) => {
      for (const key in tree) {
        const val = tree[key];
        const currentPath = [...path];

        // Add this node to path
        currentPath.push(key);

        // Create unique ID for this node
        const id = currentPath.join("-");
        ids.push(id);
        labels.push(key);

        // The parent is the last item in path before this node
        parents.push(
          currentPath.length > 1 ? currentPath.slice(0, -1).join("-") : ""
        );

        if (typeof val === "object" && val !== null) {
          // This is a branch node, continue recursion
          flattenHierarchy(val, currentPath, labels, parents, values, ids);
        } else {
          // The value is the value of this leaf
          values.push(val);
        }
      }
      return { labels, parents, values, ids };
    };

    const { labels, parents, values, ids } = flattenHierarchy(raw);

    // Generate colors based on depth for better visualization
    const maxDepth = Math.max(...parents.map((p) => p.split("-").length));
    const colors = [];
    const depths = parents.map((p) => (p === "" ? 0 : p.split("-").length));

    for (let i = 0; i < labels.length; i++) {
      const depth = depths[i];
      // Create a color scale from green (shallow) to blue (deep)
      const depthRatio = depth / maxDepth;
      const r = Math.round(65 - depthRatio * 65);
      const g = Math.round(146 - depthRatio * 100);
      const b = Math.round(153 + depthRatio * 80);
      colors.push(`rgb(${r},${g},${b})`);
    }

    return {
      data: [
        {
          type: "treemap",
          ids: ids,
          labels,
          parents,
          values,
          textinfo: "label+value+percent parent+percent root",
          marker: {
            colors,
            line: { width: 1, color: "rgba(255,255,255,0.7)" },
          },
          pathbar: { visible: true },
          branchvalues: "total",
          hovertemplate: `
            <b>%{label}</b><br>
            Value: %{value:,.2f}<br>
            Path: %{id}<br>
            Percentage of parent: %{percentParent:.1%}<br>
            Percentage of total: %{percentRoot:.1%}
            <extra></extra>
          `,
          hoverlabel: {
            bgcolor: "white",
            bordercolor: "#888",
            font: { family: "Arial", size: 12 },
          },
        },
      ],
      layout: {
        title: {
          text: `Treemap of ${valueCol} by ${pathCols.join(" → ")}`,
          font: { size: 18 },
        },
        margin: { l: 10, r: 10, t: 50, b: 10 },
        annotations: [
          {
            x: 0.5,
            y: -0.05,
            xref: "paper",
            yref: "paper",
            text: `Path hierarchy: ${pathCols.join(
              " → "
            )} | Value: ${valueCol}`,
            showarrow: false,
            font: { size: 12 },
          },
        ],
      },
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "treemap",
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching treemap data:", error);
    return { data: [], layout: { title: "Treemap - Error" } };
  }
};

export const getSunburst = async (pathCols, valueCol) => {
  if (!pathCols || pathCols.length < 1 || !valueCol) {
    return { data: [], layout: { title: "Sunburst Chart" } };
  }

  try {
    let queryParams = pathCols
      .map((col) => `path_cols=${encodeURIComponent(col)}`)
      .join("&");
    queryParams += `&value_col=${encodeURIComponent(valueCol)}`;

    const endpoint = `${api}/sunburst?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Using an improved flatten function with ids
    const flattenHierarchy = (
      tree,
      path = [],
      labels = [],
      parents = [],
      values = [],
      ids = []
    ) => {
      for (const key in tree) {
        const val = tree[key];
        const currentPath = [...path];

        // Add this node to path
        currentPath.push(key);

        // Create unique ID for this node
        const id = currentPath.join("-");
        ids.push(id);
        labels.push(key);

        // The parent is the last item in path before this node
        parents.push(
          currentPath.length > 1 ? currentPath.slice(0, -1).join("-") : ""
        );

        if (typeof val === "object" && val !== null) {
          // This is a branch node, continue recursion
          flattenHierarchy(val, currentPath, labels, parents, values, ids);
        } else {
          // The value is the value of this leaf
          values.push(val);
        }
      }
      return { labels, parents, values, ids };
    };

    const { labels, parents, values, ids } = flattenHierarchy(raw);

    // Generate a color sequence based on hierarchy level
    const maxDepth = Math.max(...parents.map((p) => p.split("-").length));
    const colors = [];
    const depths = parents.map((p) => (p === "" ? 0 : p.split("-").length));

    for (let i = 0; i < labels.length; i++) {
      const depth = depths[i];
      // Create a color scale from orange (inner) to purple (outer)
      const depthRatio = depth / maxDepth;
      const r = Math.round(255 - depthRatio * 155);
      const g = Math.round(165 - depthRatio * 135);
      const b = Math.round(0 + depthRatio * 220);
      colors.push(`rgb(${r},${g},${b})`);
    }

    return {
      data: [
        {
          type: "sunburst",
          ids: ids,
          labels,
          parents,
          values,
          textinfo: "label+value+percent parent",
          branchvalues: "total",
          marker: {
            colors,
            line: { width: 1, color: "rgba(255,255,255,0.7)" },
          },
          hovertemplate: `
            <b>%{label}</b><br>
            Value: %{value:,.2f}<br>
            Path: %{id}<br>
            Percentage of parent: %{percentParent:.1%}<br>
            Percentage of total: %{percentRoot:.1%}
            <extra></extra>
          `,
          hoverlabel: {
            bgcolor: "white",
            bordercolor: "#888",
            font: { family: "Arial", size: 12 },
          },
        },
      ],
      layout: {
        title: {
          text: `Sunburst Chart of ${valueCol} by ${pathCols.join(" → ")}`,
          font: { size: 18 },
        },
        margin: { l: 10, r: 10, t: 50, b: 10 },
        annotations: [
          {
            x: 0.5,
            y: -0.05,
            xref: "paper",
            yref: "paper",
            text: `Path hierarchy: ${pathCols.join(
              " → "
            )} | Value: ${valueCol}`,
            showarrow: false,
            font: { size: 12 },
          },
        ],
      },
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "sunburst",
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching sunburst data:", error);
    return { data: [], layout: { title: "Sunburst Chart - Error" } };
  }
};

export const getChordDiagram = async (source, target, valueCol) => {
  if (!source || !target) return [];

  try {
    let queryParams = `source_col=${encodeURIComponent(
      source
    )}&target_col=${encodeURIComponent(target)}`;
    if (valueCol) {
      queryParams += `&value_col=${encodeURIComponent(valueCol)}`;
    }

    const endpoint = `${api}/chord_diagram?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Extract all unique nodes
    const nodes = [
      ...new Set([
        ...raw.map((item) => item.source),
        ...raw.map((item) => item.target),
      ]),
    ];

    // Create a color map for consistent coloring
    const colors = generateColorScale(nodes.length);
    const nodeColors = {};
    nodes.forEach((node, i) => {
      nodeColors[node] = colors[i % colors.length];
    });

    // Transform the data for Plotly's Sankey diagram which we'll use to simulate a chord diagram
    const sourceIndices = raw.map((link) => nodes.indexOf(link.source));
    const targetIndices = raw.map((link) => nodes.indexOf(link.target));
    const values = raw.map((link) => link.value || 1);

    // Calculate total value for each node for better tooltips
    const nodeTotals = {};
    raw.forEach((link) => {
      nodeTotals[link.source] =
        (nodeTotals[link.source] || 0) + (link.value || 1);
      nodeTotals[link.target] =
        (nodeTotals[link.target] || 0) + (link.value || 1);
    });

    return {
      data: [
        {
          type: "sankey",
          orientation: "h",
          node: {
            pad: 15,
            thickness: 20,
            line: {
              color: "black",
              width: 0.5,
            },
            label: nodes,
            color: nodes.map((node) => nodeColors[node]),
            hovertemplate: `<b>%{label}</b><br>Total flow: ${
              valueCol ? valueCol + ": " : ""
            }%{value}<extra></extra>`,
          },
          link: {
            source: sourceIndices,
            target: targetIndices,
            value: values,
            color: sourceIndices.map((i) =>
              nodeColors[nodes[i]].replace(")", ", 0.4)").replace("rgb", "rgba")
            ),
            hovertemplate: `<b>%{source.label} → %{target.label}</b><br>${
              valueCol || "Value"
            }: %{value}<br>Percentage: %{customdata:.1%}<extra></extra>`,
            customdata: values.map((val) => val / Math.max(...values)),
          },
        },
      ],
      layout: {
        title: {
          text: valueCol
            ? `Flow of ${valueCol} between ${source} and ${target}`
            : `Connections between ${source} and ${target}`,
          font: { size: 18 },
        },
        annotations: [
          {
            x: 0.5,
            y: -0.1,
            xref: "paper",
            yref: "paper",
            text: `Source: ${source} | Target: ${target}${
              valueCol ? ` | Value: ${valueCol}` : ""
            }`,
            showarrow: false,
            font: { size: 12 },
          },
        ],
        margin: { l: 25, r: 25, t: 50, b: 50 },
      },
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "chord_diagram",
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching chord diagram data:", error);
    return [];
  }
};

export const getSankey = async (cols) => {
  if (!cols || cols.length < 2)
    return { data: [], layout: { title: "Sankey Diagram" } };

  try {
    const queryParams = cols
      .map((col) => `cols=${encodeURIComponent(col)}`)
      .join("&");

    const endpoint = `${api}/sankey?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Extract all unique sources and targets to create nodes
    const labels = [
      ...new Set(raw.flatMap((link) => [link.source, link.target])),
    ];
    const labelIndex = (label) => labels.indexOf(label);

    // Create color map by source category for visual consistency
    const uniqueSources = [...new Set(raw.map((link) => link.source))];
    const sourceColors = generateColorScale(uniqueSources.length);
    const colorMap = {};
    uniqueSources.forEach((source, i) => {
      colorMap[source] = sourceColors[i % sourceColors.length];
    });

    // Calculate totals for percentages
    const totalValue = raw.reduce((sum, link) => sum + link.value, 0);
    const sourceValues = {};
    raw.forEach((link) => {
      sourceValues[link.source] = (sourceValues[link.source] || 0) + link.value;
    });

    return {
      data: [
        {
          type: "sankey",
          orientation: "h",
          node: {
            label: labels,
            pad: 15,
            thickness: 20,
            line: {
              color: "black",
              width: 0.5,
            },
            hovertemplate: "<b>%{label}</b><extra></extra>",
          },
          link: {
            source: raw.map((d) => labelIndex(d.source)),
            target: raw.map((d) => labelIndex(d.target)),
            value: raw.map((d) => d.value),
            color: raw.map((link) => {
              // Color by source with transparency
              const baseColor = colorMap[link.source];
              return baseColor.replace("rgb", "rgba").replace(")", ", 0.6)");
            }),
            hovertemplate: `
              <b>%{source.label} → %{target.label}</b><br>
              Value: %{value:,}<br>
              % of total: %{customdata[0]:.1%}<br>
              % of source category: %{customdata[1]:.1%}
              <extra></extra>
            `,
            customdata: raw.map((link) => [
              link.value / totalValue,
              link.value / sourceValues[link.source],
            ]),
          },
        },
      ],
      layout: {
        title: {
          text: `Sankey Diagram: ${cols.join(" → ")}`,
          font: { size: 18 },
        },
        margin: { l: 25, r: 25, t: 50, b: 25 },
        annotations: [
          {
            x: 0.5,
            y: -0.1,
            xref: "paper",
            yref: "paper",
            text: `Flow path: ${cols.join(" → ")}`,
            showarrow: false,
            font: { size: 12 },
          },
        ],
      },
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "sankey_diagram",
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching sankey data:", error);
    return { data: [], layout: { title: "Sankey Diagram - Error" } };
  }
};

export const getUpsetPlot = async (setCols) => {
  if (!setCols || setCols.length < 2) return [];

  try {
    const queryParams = setCols
      .map((col) => `set_cols=${encodeURIComponent(col)}`)
      .join("&");

    const endpoint = `${api}/upset_plot?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // For UpsetPlot we need to transform the API result into a proper format
    // Assuming raw contains intersection sizes with set combinations

    // Extract set names and all intersections
    const setNames = Object.keys(raw[0] || {}).filter(
      (key) => key !== "size" && key !== "sets"
    );
    // const intersections = raw.map((item) => ({
    //   sets: item.sets || [],
    //   size: item.size || 0,
    // }));

    // Create bar chart for set sizes
    const setSizes = setNames.map((name) => {
      // Find the intersection that contains only this set
      const singleSetData = raw.find(
        (item) => item.sets?.length === 1 && item.sets[0] === name
      );
      return singleSetData?.size || 0;
    });

    // Create upset plot components
    const data = [
      // Set size bars (vertical)
      {
        type: "bar",
        x: setNames,
        y: setSizes,
        name: "Set Sizes",
        marker: { color: "#1f77b4" },
        xaxis: "x",
        yaxis: "y",
        hovertemplate: "<b>%{x}</b><br>Size: %{y}<extra></extra>",
      },
      // Intersection sizes (horizontal bars)
      {
        type: "bar",
        y: raw.map((_, i) => i),
        x: raw.map((item) => item.size),
        orientation: "h",
        name: "Intersection Sizes",
        marker: { color: "#2ca02c" },
        xaxis: "x2",
        yaxis: "y2",
        hovertemplate:
          "<b>Intersection Size</b>: %{x}<br>Sets: %{customdata}<extra></extra>",
        customdata: raw.map((item) => item.sets?.join(" ∩ ") || "Empty"),
      },
    ];

    // Create dot matrix for set intersections
    setNames.forEach((setName, idx) => {
      data.push({
        type: "scatter",
        mode: "markers",
        name: setName,
        x: Array(raw.length).fill(idx),
        y: raw.map((_, i) => i),
        marker: {
          symbol: "circle",
          size: 15,
          color: raw.map((item) =>
            item.sets?.includes(setName) ? "#d62728" : "rgba(240,240,240,0.8)"
          ),
        },
        showlegend: false,
        xaxis: "x3",
        yaxis: "y2",
        hoverinfo: "none",
      });
    });

    return {
      data,
      layout: {
        title: {
          text: "UpSet Plot: Set Intersections",
          font: { size: 18 },
        },
        grid: {
          rows: 2,
          columns: 2,
          pattern: "independent",
          roworder: "bottom to top",
        },
        annotations: raw.map((item, idx) => ({
          x: raw[idx].size,
          y: idx,
          xanchor: "left",
          yanchor: "middle",
          text: ` ${item.sets?.join(" ∩ ")}`,
          showarrow: false,
          xref: "x2",
          yref: "y2",
          font: { size: 10 },
        })),
        xaxis: {
          title: "Sets",
          domain: [0, 0.7],
          anchor: "y",
        },
        yaxis: {
          title: "Set Size",
          domain: [0, 0.3],
          anchor: "x",
        },
        xaxis2: {
          title: "Intersection Size",
          domain: [0.7, 1],
          anchor: "y2",
        },
        yaxis2: {
          title: "Intersections",
          domain: [0.4, 1],
          anchor: "x2",
        },
        xaxis3: {
          domain: [0, 0.7],
          anchor: "y2",
          showticklabels: false,
          showgrid: false,
          zeroline: false,
        },
        showlegend: true,
        legend: {
          x: 0.8,
          y: 0.1,
        },
      },
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "upset_plot",
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching upset plot data:", error);
    return [];
  }
};

export const getScatter3D = async (x, y, z) => {
  if (!x || !y || !z) return null;

  try {
    const queryParams = `x_col=${encodeURIComponent(
      x
    )}&y_col=${encodeURIComponent(y)}&z_col=${encodeURIComponent(z)}`;
    const endpoint = `${api}/scatter_3d?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Extract values for statistics
    const xValues = raw.map((p) => p.x);
    const yValues = raw.map((p) => p.y);
    const zValues = raw.map((p) => p.z);

    // Calculate statistics
    const stats = {
      x: {
        min: Math.min(...xValues),
        max: Math.max(...xValues),
        mean: xValues.reduce((a, b) => a + b, 0) / xValues.length,
      },
      y: {
        min: Math.min(...yValues),
        max: Math.max(...yValues),
        mean: yValues.reduce((a, b) => a + b, 0) / yValues.length,
      },
      z: {
        min: Math.min(...zValues),
        max: Math.max(...zValues),
        mean: zValues.reduce((a, b) => a + b, 0) / zValues.length,
      },
    };

    // Create a gradient of colors based on z value
    const markers = {
      size: 5,
      opacity: 0.8,
      color: zValues,
      colorscale: "Viridis",
      colorbar: {
        title: z,
        thickness: 15,
        len: 0.5,
        y: 0.5,
      },
      line: {
        color: "rgba(40,40,40,0.2)",
        width: 0.5,
      },
    };

    return {
      data: [
        {
          type: "scatter3d",
          mode: "markers",
          x: xValues,
          y: yValues,
          z: zValues,
          marker: markers,
          hovertemplate: `
            <b>${x}</b>: %{x:.4f}<br>
            <b>${y}</b>: %{y:.4f}<br>
            <b>${z}</b>: %{z:.4f}
            <extra></extra>
          `,
          name: "Data points",
          hoverlabel: {
            bgcolor: "white",
            bordercolor: "#888",
            font: { family: "Arial", size: 12 },
          },
        },
      ],
      layout: {
        title: {
          text: `3D Scatter Plot: ${x} vs ${y} vs ${z}`,
          font: { size: 18 },
        },
        scene: {
          xaxis: {
            title: x,
            backgroundcolor: "rgba(240,240,240,0.5)",
          },
          yaxis: {
            title: y,
            backgroundcolor: "rgba(240,240,240,0.5)",
          },
          zaxis: {
            title: z,
            backgroundcolor: "rgba(240,240,240,0.5)",
          },
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1 },
          },
        },
        margin: { l: 0, r: 0, t: 50, b: 0 },
        annotations: [
          {
            showarrow: false,
            x: 0.1,
            y: 0.95,
            xref: "paper",
            yref: "paper",
            text: `${x}: Min=${stats.x.min.toFixed(
              2
            )}, Max=${stats.x.max.toFixed(2)}, Mean=${stats.x.mean.toFixed(2)}`,
            font: { size: 10 },
          },
          {
            showarrow: false,
            x: 0.1,
            y: 0.9,
            xref: "paper",
            yref: "paper",
            text: `${y}: Min=${stats.y.min.toFixed(
              2
            )}, Max=${stats.y.max.toFixed(2)}, Mean=${stats.y.mean.toFixed(2)}`,
            font: { size: 10 },
          },
          {
            showarrow: false,
            x: 0.1,
            y: 0.85,
            xref: "paper",
            yref: "paper",
            text: `${z}: Min=${stats.z.min.toFixed(
              2
            )}, Max=${stats.z.max.toFixed(2)}, Mean=${stats.z.mean.toFixed(2)}`,
            font: { size: 10 },
          },
        ],
      },
      config: {
        responsive: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: "3d_scatter",
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching 3D scatter plot data:", error);
    return null;
  }
};

// export const getContourPlot = async (x, y, z) => {
//   if (!x || !y || !z) return null;

//   try {
//     const queryParams = `x_col=${encodeURIComponent(
//       x
//     )}&y_col=${encodeURIComponent(y)}&z_col=${encodeURIComponent(z)}`;
//     const endpoint = `${api}/contour?${queryParams}`;
//     const raw = await fetchWithCache(endpoint);

//     // Extract unique x and y values for proper gridding
//     const uniqueXValues = [...new Set(raw.map((r) => r[x]))].sort(
//       (a, b) => a - b
//     );
//     const uniqueYValues = [...new Set(raw.map((r) => r[y]))].sort(
//       (a, b) => a - b
//     );

//     // Create a 2D grid of z values
//     const zGrid = Array(uniqueYValues.length)
//       .fill()
//       .map(() => Array(uniqueXValues.length).fill(null));

//     raw.forEach((point) => {
//       const xIndex = uniqueXValues.indexOf(point[x]);
//       const yIndex = uniqueYValues.indexOf(point[y]);
//       if (xIndex !== -1 && yIndex !== -1) {
//         zGrid[yIndex][xIndex] = point[z];
//       }
//     });

//     return {
//       data: [
//         {
//           type: "contour",
//           x: uniqueXValues,
//           y: uniqueYValues,
//           z: zGrid,
//           contours: {
//             coloring: "heatmap",
//             showlabels: true,
//             labelfont: {
//               family: "Arial",
//               size: 10,
//               color: "white",
//             },
//           },
//           colorscale: "Viridis",
//           colorbar: {
//             title: {
//               text: z,
//               side: "right",
//             },
//             thickness: 15,
//             len: 0.9,
//             y: 0.5,
//           },
//           hovertemplate: `
//             <b>${x}</b>: %{x:.4f}<br>
//             <b>${y}</b>: %{y:.4f}<br>
//             <b>${z}</b>: %{z:.4f}
//             <extra></extra>
//           `,
//           hoverlabel: {
//             bgcolor: "white",
//             bordercolor: "#888",
//             font: { family: "Arial", size: 12 },
//           },
//         },
//         {
//           type: "scatter",
//           mode: "markers",
//           x: raw.map((r) => r[x]),
//           y: raw.map((r) => r[y]),
//           marker: {
//             color: "rgba(255,255,255,0.5)",
//             size: 3,
//             line: {
//               color: "rgba(0,0,0,0.2)",
//               width: 0.5,
//             },
//           },
//           name: "Data points",
//           hovertemplate: `
//             <b>${x}</b>: %{x:.4f}<br>
//             <b>${y}</b>: %{y:.4f}<br>
//             <b>${z}</b>: %{customdata:.4f}
//             <extra></extra>
//           `,
//           customdata: raw.map((r) => r[z]),
//         },
//       ],
//       layout: {
//         title: {
//           text: `Contour Plot: ${z} as a function of ${x} and ${y}`,
//           font: { size: 18 },
//         },
//         xaxis: {
//           title: x,
//           showgrid: true,
//           zeroline: false,
//           gridcolor: "rgba(0,0,0,0.1)",
//         },
//         yaxis: {
//           title: y,
//           showgrid: true,
//           zeroline: false,
//           gridcolor: "rgba(0,0,0,0.1)",
//         },
//         showlegend: true,
//         legend: {
//           x: 0.01,
//           y: 0.99,
//           bgcolor: "rgba(255,255,255,0.7)",
//           bordercolor: "rgba(0,0,0,0.2)",
//           borderwidth: 1,
//         },
//         annotations: [
//           {
//             x: 0.5,
//             y: -0.15,
//             xref: "paper",
//             yref: "paper",
//             text: `${z} values are represented by colors, with contour lines showing equal ${z} values`,
//             showarrow: false,
//             font: { size: 12 },
//           },
//         ],
//       },
//       config: {
//         responsive: true,
//         displaylogo: false,
//         scrollZoom: true,
//         toImageButtonOptions: {
//           format: "png",
//           filename: "contour_plot",
//           scale: 2,
//         },
//         modeBarButtonsToAdd: [
//           "drawline",
//           "drawopenpath",
//           "drawclosedpath",
//           "drawcircle",
//           "drawrect",
//           "eraseshape",
//         ],
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching contour plot data:", error);
//     return null;
//   }
// };
export const getContourPlot = async (x, y, z) => {
  if (!x || !y || !z) return null;

  try {
    const queryParams = `x_col=${encodeURIComponent(
      x
    )}&y_col=${encodeURIComponent(y)}&z_col=${encodeURIComponent(z)}`;
    const endpoint = `${api}/contour?${queryParams}`;
    const raw = await fetchWithCache(endpoint);

    // Check if we have enough data points
    if (raw.length < 10) {
      console.warn("Not enough data points for a meaningful contour plot");
      return null;
    }

    // Extract unique x and y values for proper gridding
    const uniqueXValues = [...new Set(raw.map((r) => r[x]))].sort(
      (a, b) => a - b
    );
    const uniqueYValues = [...new Set(raw.map((r) => r[y]))].sort(
      (a, b) => a - b
    );

    // Create a 2D grid with proper dimensions
    const zGrid = [];

    // Create a lookup map for quick access to z values
    const dataMap = new Map();
    raw.forEach((point) => {
      dataMap.set(`${point[x]}_${point[y]}`, point[z]);
    });

    // Build the grid with interpolation for missing values
    for (let i = 0; i < uniqueYValues.length; i++) {
      const row = [];
      const yVal = uniqueYValues[i];

      for (let j = 0; j < uniqueXValues.length; j++) {
        const xVal = uniqueXValues[j];
        const key = `${xVal}_${yVal}`;

        if (dataMap.has(key)) {
          // Use exact value if available
          row.push(dataMap.get(key));
        } else {
          // Find nearest data points for interpolation
          let nearest = raw.reduce(
            (closest, point) => {
              const distance = Math.sqrt(
                Math.pow(point[x] - xVal, 2) + Math.pow(point[y] - yVal, 2)
              );
              if (distance < closest.distance) {
                return { distance, value: point[z] };
              }
              return closest;
            },
            { distance: Infinity, value: null }
          );

          row.push(nearest.value);
        }
      }
      zGrid.push(row);
    }

    // Check if we have a valid grid (no nulls/undefined)
    const hasInvalidValues = zGrid.some((row) =>
      row.some((val) => val === null || val === undefined || isNaN(val))
    );

    if (hasInvalidValues) {
      console.warn("Grid contains invalid values, attempting to correct...");
      // Replace invalid values with average of surrounding values
      for (let i = 0; i < zGrid.length; i++) {
        for (let j = 0; j < zGrid[i].length; j++) {
          if (
            zGrid[i][j] === null ||
            zGrid[i][j] === undefined ||
            isNaN(zGrid[i][j])
          ) {
            // Calculate average of neighboring values
            let sum = 0;
            let count = 0;

            // Check surrounding cells
            for (let di = -1; di <= 1; di++) {
              for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;

                const ni = i + di;
                const nj = j + dj;

                if (
                  ni >= 0 &&
                  ni < zGrid.length &&
                  nj >= 0 &&
                  nj < zGrid[i].length
                ) {
                  if (
                    zGrid[ni][nj] !== null &&
                    zGrid[ni][nj] !== undefined &&
                    !isNaN(zGrid[ni][nj])
                  ) {
                    sum += zGrid[ni][nj];
                    count++;
                  }
                }
              }
            }

            zGrid[i][j] = count > 0 ? sum / count : 0;
          }
        }
      }
    }

    return {
      data: [
        {
          type: "contour",
          x: uniqueXValues,
          y: uniqueYValues,
          z: zGrid,
          contours: {
            coloring: "heatmap",
            showlabels: true,
            labelfont: {
              family: "Arial",
              size: 10,
              color: "white",
            },
          },
          colorscale: "Viridis",
          colorbar: {
            title: {
              text: z,
              side: "right",
            },
            thickness: 15,
            len: 0.9,
            y: 0.5,
          },
          hovertemplate: `
            <b>${x}</b>: %{x:.4f}<br>
            <b>${y}</b>: %{y:.4f}<br>
            <b>${z}</b>: %{z:.4f}
            <extra></extra>
          `,
          hoverlabel: {
            bgcolor: "white",
            bordercolor: "#888",
            font: { family: "Arial", size: 12 },
          },
        },
        {
          type: "scatter",
          mode: "markers",
          x: raw.map((r) => r[x]),
          y: raw.map((r) => r[y]),
          marker: {
            color: "rgba(255,255,255,0.5)",
            size: 3,
            line: {
              color: "rgba(0,0,0,0.2)",
              width: 0.5,
            },
          },
          name: "Data points",
          hovertemplate: `
            <b>${x}</b>: %{x:.4f}<br>
            <b>${y}</b>: %{y:.4f}<br>
            <b>${z}</b>: %{customdata:.4f}
            <extra></extra>
          `,
          customdata: raw.map((r) => r[z]),
        },
      ],
      layout: {
        title: {
          text: `Contour Plot: ${z} as a function of ${x} and ${y}`,
          font: { size: 18 },
        },
        xaxis: {
          title: x,
          showgrid: true,
          zeroline: false,
          gridcolor: "rgba(0,0,0,0.1)",
        },
        yaxis: {
          title: y,
          showgrid: true,
          zeroline: false,
          gridcolor: "rgba(0,0,0,0.1)",
        },
        showlegend: true,
        legend: {
          x: 0.01,
          y: 0.99,
          bgcolor: "rgba(255,255,255,0.7)",
          bordercolor: "rgba(0,0,0,0.2)",
          borderwidth: 1,
        },
        annotations: [
          {
            x: 0.5,
            y: -0.15,
            xref: "paper",
            yref: "paper",
            text: `${z} values are represented by colors, with contour lines showing equal ${z} values`,
            showarrow: false,
            font: { size: 12 },
          },
        ],
      },
      config: {
        responsive: true,
        displaylogo: false,
        scrollZoom: true,
        toImageButtonOptions: {
          format: "png",
          filename: "contour_plot",
          scale: 2,
        },
        modeBarButtonsToAdd: [
          "drawline",
          "drawopenpath",
          "drawclosedpath",
          "drawcircle",
          "drawrect",
          "eraseshape",
        ],
      },
    };
  } catch (error) {
    console.error("Error fetching contour plot data:", error);
    return null;
  }
};
