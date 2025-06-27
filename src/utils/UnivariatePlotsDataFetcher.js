/* eslint-disable no-unused-vars */
const baseURL = "http://127.0.0.1:8000/univariate";

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

// Helper to format numbers for display
const formatNumber = (num) => {
  if (num === undefined || num === null) return "N/A";
  if (Math.abs(num) < 0.01 && num !== 0) {
    return num.toExponential(2);
  }
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: Math.abs(num) < 1 ? 2 : 0,
  });
};

// Generate a nice color palette with variations
const generateColorPalette = (n = 1, baseColor = null) => {
  const palettes = {
    blue: ["#1f77b4", "#aec7e8", "#3a6fbf", "#5d9ad3", "#1b4779", "#9cc7ff"],
    orange: ["#ff7f0e", "#ffbb78", "#e86e00", "#ffaa45", "#a94b00", "#ffc285"],
    green: ["#2ca02c", "#98df8a", "#208020", "#78cc78", "#165016", "#b3e6a8"],
    red: ["#d62728", "#ff9896", "#bd1919", "#f75b5c", "#8c1212", "#ff7775"],
    purple: ["#9467bd", "#c5b0d5", "#7c51a2", "#b38cd8", "#5e3b7c", "#d7c7e8"],
    brown: ["#8c564b", "#c49c94", "#6d3c32", "#ad7164", "#4a2921", "#dbb7ac"],
    pink: ["#e377c2", "#f7b6d2", "#d74ea2", "#ef90be", "#a3377e", "#fcd3e7"],
    gray: ["#7f7f7f", "#c7c7c7", "#646464", "#a6a6a6", "#4a4a4a", "#e0e0e0"],
  };

  // If baseColor is provided and valid, use that palette
  const colorList =
    baseColor && palettes[baseColor] ? palettes[baseColor] : palettes.blue;

  // If n is 1, return the main color
  if (n === 1) return [colorList[0]];

  // If n <= available colors in the palette, return that many
  if (n <= colorList.length) return colorList.slice(0, n);

  // If we need more colors, generate variations
  const result = [...colorList];
  let i = 0;
  while (result.length < n) {
    // Cycle through colors with opacity variations
    const baseColorHex = colorList[i % colorList.length];
    const opacity = 0.9 - Math.floor(i / colorList.length) * 0.2;

    // Convert hex to rgba
    const r = parseInt(baseColorHex.slice(1, 3), 16);
    const g = parseInt(baseColorHex.slice(3, 5), 16);
    const b = parseInt(baseColorHex.slice(5, 7), 16);

    result.push(`rgba(${r}, ${g}, ${b}, ${opacity})`);
    i++;
  }

  return result;
};

// Histogram Plot
export const getHistogram = async (column) => {
  try {
    const endpoint = `${baseURL}/histogram?column=${encodeURIComponent(
      column
    )}`;
    const { bins, counts } = await fetchWithCache(endpoint);

    // Calculate basic statistics from the histogram data
    const binMidpoints = bins
      .slice(0, -1)
      .map((binStart, i) => (binStart + bins[i + 1]) / 2);
    const weightedSum = binMidpoints.reduce(
      (sum, midpoint, i) => sum + midpoint * counts[i],
      0
    );
    const totalCount = counts.reduce((sum, count) => sum + count, 0);
    const mean = totalCount > 0 ? weightedSum / totalCount : 0;

    // Generate bin labels for better tooltips
    const binLabels = bins.slice(0, -1).map((binStart, i) => {
      const binEnd = bins[i + 1];
      return `${formatNumber(binStart)} to ${formatNumber(binEnd)}`;
    });

    // Generate colors based on counts
    const maxCount = Math.max(...counts);
    const colors = counts.map((count) => {
      const intensity = 0.3 + (count / maxCount) * 0.7;
      return `rgba(59, 130, 246, ${intensity})`;
    });

    return {
      data: [
        {
          type: "bar",
          x: bins.slice(0, -1),
          y: counts,
          text: binLabels,
          hovertemplate:
            "<b>Range:</b> %{text}<br>" +
            "<b>Count:</b> %{y}<br>" +
            "<b>Percent:</b> " +
            counts.map((c) => ((c / totalCount) * 100).toFixed(1) + "%") +
            "<extra></extra>",
          marker: {
            color: colors,
            line: { color: "rgba(59, 130, 246, 1)", width: 1 },
          },
          name: "Frequency",
        },
        // Add reference line for mean
        {
          type: "scatter",
          x: [mean, mean],
          y: [0, maxCount * 1.05],
          mode: "lines",
          line: { color: "red", width: 2, dash: "dash" },
          name: "Mean",
          hovertemplate:
            "<b>Mean:</b> " + formatNumber(mean) + "<extra></extra>",
        },
      ],
      layout: {
        title: {
          text: `<b>Histogram of ${column}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: { text: column, font: { size: 14 } },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        yaxis: {
          title: { text: "Frequency", font: { size: 14 } },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        bargap: 0.05,
        hovermode: "closest",
        showlegend: true,
        legend: { orientation: "h", y: -0.15 },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Statistics:</b> Total count: ${totalCount}, Mean: ${formatNumber(
              mean
            )}, Bins: ${bins.length - 1}`,
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
          filename: `histogram_${column}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in histogram:", error);
    return {
      data: [],
      layout: { title: `Error loading histogram for ${column}` },
    };
  }
};

// Bar Plot for categorical data
export const getBarPlot = async (column) => {
  try {
    const endpoint = `${baseURL}/bar?column=${encodeURIComponent(column)}`;
    const raw = await fetchWithCache(endpoint);

    // Sort by value for better visualization
    const sortedData = [...raw].sort((a, b) => b.value - a.value);

    // Generate colors - gradient based on values
    const values = sortedData.map((r) => r.value);
    const maxValue = Math.max(...values);
    const colorScale = generateColorPalette(sortedData.length, "orange");

    // Calculate stats
    const total = values.reduce((sum, val) => sum + val, 0);
    const percentages = values.map((val) => ((val / total) * 100).toFixed(1));

    // Prepare for pareto principle annotation
    const cumulativePercent = [];
    let runningSum = 0;
    values.forEach((val) => {
      runningSum += val;
      cumulativePercent.push(((runningSum / total) * 100).toFixed(1));
    });

    // Find where we cross 80% (Pareto principle)
    let paretoIndex = cumulativePercent.findIndex(
      (pct) => parseFloat(pct) >= 80
    );
    paretoIndex = paretoIndex === -1 ? values.length : paretoIndex + 1;

    return {
      data: [
        {
          type: "bar",
          x: sortedData.map((r) => r.label),
          y: sortedData.map((r) => r.value),
          text: percentages.map((pct) => `${pct}%`),
          textposition: "auto",
          hovertemplate:
            "<b>%{x}</b><br>Count: %{y}<br>Percentage: %{text}<extra></extra>",
          marker: {
            color: colorScale,
            line: {
              color: "rgba(58, 58, 58, 0.5)",
              width: 1,
            },
          },
          name: "Frequency",
        },
      ],
      layout: {
        title: {
          text: `<b>Bar Chart of ${column}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: {
            text: column,
            font: { size: 14 },
          },
          tickangle: sortedData.length > 10 ? -45 : 0,
          automargin: true,
        },
        yaxis: {
          title: {
            text: "Frequency",
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        bargap: 0.2,
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Statistics:</b> Categories=${sortedData.length}, Most frequent: ${sortedData[0].label} (${percentages[0]}%), Total count: ${total}`,
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
            text:
              paretoIndex < sortedData.length * 0.4
                ? `<b>Pareto observation:</b> ${paretoIndex} out of ${sortedData.length} categories account for 80% of occurrences`
                : "",
            showarrow: false,
            font: { size: 12 },
            opacity: paretoIndex < sortedData.length * 0.4 ? 1 : 0,
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
          filename: `bar_chart_${column}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in bar plot:", error);
    return {
      data: [],
      layout: { title: `Error loading bar chart for ${column}` },
    };
  }
};

// Box Plot
export const getBoxPlot = async (column) => {
  try {
    const endpoint = `${baseURL}/box?column=${encodeURIComponent(column)}`;
    const boxData = await fetchWithCache(endpoint);

    // Extract box plot statistics
    const { min, q1, median, q3, max } = boxData;

    // Calculate IQR and whiskers
    const iqr = q3 - q1;
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);

    // Calculate approximate mean (since we don't have raw data)
    // This is a rough approximation
    const approximateMean = (q1 + median + q3) / 3;

    return {
      data: [
        {
          type: "box",
          y: [min, q1, median, q3, max],
          boxpoints: false, // We don't have individual points
          name: column,
          marker: { color: "rgba(74, 144, 226, 0.7)" },
          boxmean: true, // Show approximate mean
          line: { width: 1 },
          fillcolor: "rgba(74, 144, 226, 0.5)",
          hoverinfo: "y",
          hovertemplate:
            "<b>Min:</b> " +
            formatNumber(min) +
            "<br>" +
            "<b>Q1:</b> " +
            formatNumber(q1) +
            "<br>" +
            "<b>Median:</b> " +
            formatNumber(median) +
            "<br>" +
            "<b>Q3:</b> " +
            formatNumber(q3) +
            "<br>" +
            "<b>Max:</b> " +
            formatNumber(max) +
            "<br>" +
            "<b>IQR:</b> " +
            formatNumber(iqr) +
            "<extra></extra>",
        },
      ],
      layout: {
        title: {
          text: `<b>Box Plot of ${column}</b>`,
          font: { size: 18 },
        },
        yaxis: {
          title: { text: column, font: { size: 14 } },
          zeroline: false,
          gridcolor: "rgba(0,0,0,0.1)",
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Box Plot Statistics:</b> Min=${formatNumber(
              min
            )}, Q1=${formatNumber(q1)}, Median=${formatNumber(
              median
            )}, Q3=${formatNumber(q3)}, Max=${formatNumber(max)}`,
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
            text: `<b>Additional Statistics:</b> IQR=${formatNumber(
              iqr
            )}, Lower Whisker=${formatNumber(
              lowerWhisker
            )}, Upper Whisker=${formatNumber(upperWhisker)}`,
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
          filename: `boxplot_${column}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in box plot:", error);
    return {
      data: [],
      layout: { title: `Error loading box plot for ${column}` },
    };
  }
};

// Pie Plot with improved colors and interactivity
export const getPiePlot = async (column) => {
  try {
    const endpoint = `${baseURL}/pie?column=${encodeURIComponent(column)}`;
    const raw = await fetchWithCache(endpoint);

    // Sort slices by value (largest first)
    const sortedData = [...raw].sort((a, b) => b.value - a.value);

    // Generate pleasing colors
    const colors = generateColorPalette(sortedData.length);

    // Calculate total for percentages
    const total = sortedData.reduce((sum, item) => sum + item.value, 0);

    // Format percentages for tooltip
    const percentages = sortedData.map((item) =>
      ((item.value / total) * 100).toFixed(1)
    );

    // Determine if we should group small slices
    const smallThreshold = 0.03; // 3% threshold
    let otherCount = 0;
    let otherValue = 0;
    const groupedData = [];

    sortedData.forEach((item, i) => {
      const percent = item.value / total;
      if (percent < smallThreshold && sortedData.length > 10) {
        otherCount++;
        otherValue += item.value;
      } else {
        groupedData.push({
          ...item,
          percent: percentages[i],
        });
      }
    });

    // Add "Other" category if we grouped any
    if (otherCount > 0) {
      groupedData.push({
        label: `Other (${otherCount} categories)`,
        value: otherValue,
        percent: ((otherValue / total) * 100).toFixed(1),
      });
    }

    return {
      data: [
        {
          type: "pie",
          labels: groupedData.map((r) => r.label),
          values: groupedData.map((r) => r.value),
          text: groupedData.map((r) => `${r.percent}%`),
          textinfo: "label+percent",
          hovertemplate:
            "<b>%{label}</b><br>Count: %{value}<br>Percentage: %{text}<extra></extra>",
          marker: {
            colors: colors.slice(0, groupedData.length),
            line: {
              color: "rgba(255, 255, 255, 0.8)",
              width: 1.5,
            },
          },
          pull: groupedData.map((_, i) => (i === 0 ? 0.1 : 0)), // Pull out the largest slice
          direction: "clockwise",
          showlegend: true,
        },
      ],
      layout: {
        title: {
          text: `<b>Pie Chart of ${column}</b>`,
          font: { size: 18 },
        },
        legend: {
          orientation: groupedData.length > 10 ? "v" : "h",
          y: groupedData.length > 10 ? 0.5 : -0.1,
          x: groupedData.length > 10 ? 1.1 : 0.5,
          xanchor: groupedData.length > 10 ? "left" : "center",
          yanchor: groupedData.length > 10 ? "middle" : "top",
        },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Category Statistics:</b> Total categories: ${
              sortedData.length
            }, Total count: ${total}, Most frequent: ${sortedData[0].label} (${(
              (sortedData[0].value / total) *
              100
            ).toFixed(1)}%)`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
        ],
        margin: {
          l: 20,
          r: 20,
          t: 100,
          b: 20,
        },
      },
      config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        toImageButtonOptions: {
          format: "png",
          filename: `pie_chart_${column}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in pie plot:", error);
    return {
      data: [],
      layout: { title: `Error loading pie chart for ${column}` },
    };
  }
};

// Density Plot
export const getDensityPlot = async (column) => {
  try {
    const endpoint = `${baseURL}/density?column=${encodeURIComponent(column)}`;
    const raw = await fetchWithCache(endpoint);

    // Get boxplot data for statistics
    const boxplotEndpoint = `${baseURL}/box?column=${encodeURIComponent(
      column
    )}`;
    const boxData = await fetchWithCache(boxplotEndpoint);
    const { min, q1, median, q3, max } = boxData || {};
    const iqr = q3 - q1;

    // Use data from the API
    const xValues = raw.map((p) => p.x);
    const yValues = raw.map((p) => p.y);
    const maxY = Math.max(...yValues);

    // Create base density plot
    const data = [
      {
        type: "scatter",
        mode: "lines",
        name: "Density",
        x: xValues,
        y: yValues,
        line: { color: "rgba(16, 185, 129, 1)", width: 2 },
        hovertemplate: "<b>x</b>: %{x}<br><b>Density</b>: %{y}<extra></extra>",
        fill: "tozeroy",
        fillcolor: "rgba(16, 185, 129, 0.2)",
      },
    ];

    // Add vertical lines for key statistics if we have them
    if (median !== undefined) {
      data.push({
        type: "scatter",
        x: [median, median],
        y: [0, maxY * 1.1],
        mode: "lines",
        name: "Median",
        line: { color: "rgba(37, 99, 235, 1)", width: 2, dash: "dot" },
        hovertemplate:
          "<b>Median</b>: " + formatNumber(median) + "<extra></extra>",
      });
    }

    // Add quantiles
    if (q1 !== undefined && q3 !== undefined) {
      // Add shaded area for IQR
      data.push({
        type: "scatter",
        x: [q1, q1, q3, q3],
        y: [0, maxY * 1.1, maxY * 1.1, 0],
        fill: "toself",
        fillcolor: "rgba(59, 130, 246, 0.2)",
        line: { width: 0 },
        name: "IQR Range",
        hovertemplate:
          "<b>IQR Range</b><br>" +
          "Q1: " +
          formatNumber(q1) +
          "<br>" +
          "Q3: " +
          formatNumber(q3) +
          "<br>" +
          "IQR: " +
          formatNumber(iqr) +
          "<extra></extra>",
        hoverlabel: { bgcolor: "rgba(59, 130, 246, 0.8)" },
      });

      // Q1 and Q3 lines
      data.push({
        type: "scatter",
        x: [q1, q1],
        y: [0, maxY * 1.1],
        mode: "lines",
        name: "Q1",
        line: { color: "rgba(59, 130, 246, 0.8)", width: 1, dash: "dot" },
        showlegend: true,
        hovertemplate: "<b>Q1</b>: " + formatNumber(q1) + "<extra></extra>",
      });

      data.push({
        type: "scatter",
        x: [q3, q3],
        y: [0, maxY * 1.1],
        mode: "lines",
        name: "Q3",
        line: { color: "rgba(59, 130, 246, 0.8)", width: 1, dash: "dot" },
        showlegend: true,
        hovertemplate: "<b>Q3</b>: " + formatNumber(q3) + "<extra></extra>",
      });
    }

    return {
      data,
      layout: {
        title: {
          text: `<b>Density Plot of ${column}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: { text: column, font: { size: 14 } },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        yaxis: {
          title: { text: "Density", font: { size: 14 } },
          gridcolor: "rgba(0,0,0,0.1)",
        },
        hovermode: "closest",
        showlegend: true,
        legend: { orientation: "h", y: -0.15 },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Distribution Statistics:</b> Min=${formatNumber(
              min
            )}, Median=${formatNumber(median)}, Max=${formatNumber(max)}`,
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
            text: `<b>Quartiles:</b> Q1=${formatNumber(q1)}, Q3=${formatNumber(
              q3
            )}, IQR=${formatNumber(iqr)}`,
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
          filename: `density_plot_${column}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in density plot:", error);
    return {
      data: [],
      layout: { title: `Error loading density plot for ${column}` },
    };
  }
};

// Dot Plot
export const getDotPlot = async (column) => {
  try {
    const endpoint = `${baseURL}/dot?column=${encodeURIComponent(column)}`;
    const raw = await fetchWithCache(endpoint);

    // Get boxplot data for statistics
    const boxplotEndpoint = `${baseURL}/box?column=${encodeURIComponent(
      column
    )}`;
    const boxData = await fetchWithCache(boxplotEndpoint);
    const { min, q1, median, q3, max } = boxData || {};

    // Get original values
    const values = raw.map((r) => r.value);

    // Generate color gradient based on values
    const minVal = min || Math.min(...values);
    const maxVal = max || Math.max(...values);
    const range = maxVal - minVal;

    const colors = values.map((val) => {
      // Create a blue-purple gradient based on value
      const normalized = (val - minVal) / range;
      const r = Math.floor(64 + normalized * (178 - 64)); // 64 to 178
      const g = Math.floor(68 + normalized * (24 - 68)); // 68 to 24
      const b = Math.floor(68 + normalized * (220 - 68)); // 68 to 220
      return `rgb(${r}, ${g}, ${b})`;
    });

    const data = [
      // Main dots
      {
        type: "scatter",
        mode: "markers",
        x: values,
        y: Array(values.length).fill(0), // All points on same y-level
        marker: {
          color: colors,
          size: 10,
          symbol: "circle",
          line: { width: 1, color: "rgba(0,0,0,0.3)" },
          opacity: 0.8,
        },
        hovertemplate: "<b>Value:</b> %{x}<extra></extra>",
        name: column,
      },
      // Add jittered dots for better visualization of clusters
      {
        type: "scatter",
        mode: "markers",
        x: values,
        y: values.map(() => (Math.random() - 0.5) * 0.5), // Jittered y values
        marker: {
          color: colors,
          size: 6,
          opacity: 0.4,
          symbol: "circle",
        },
        hovertemplate: "<b>Value:</b> %{x}<extra></extra>",
        name: "Distribution",
        showlegend: false,
      },
    ];

    // Add lines for key statistics if available
    if (median !== undefined) {
      data.push({
        type: "scatter",
        x: [median, median],
        y: [-1, 1],
        mode: "lines",
        name: "Median",
        line: { color: "green", width: 2, dash: "dot" },
        hovertemplate:
          "<b>Median:</b> " + formatNumber(median) + "<extra></extra>",
      });
    }

    return {
      data,
      layout: {
        title: {
          text: `<b>Dot Plot of ${column}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: { text: column, font: { size: 14 } },
          gridcolor: "rgba(0,0,0,0.1)",
          zeroline: false,
        },
        yaxis: {
          visible: false,
          zeroline: false,
          range: [-1, 1],
        },
        hovermode: "closest",
        showlegend: true,
        legend: { orientation: "h", y: -0.15 },
        margin: { t: 100, b: 80 },
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Statistics:</b> Min=${formatNumber(
              min
            )}, Max=${formatNumber(max)}, Median=${formatNumber(median)}`,
            showarrow: false,
            font: { size: 12 },
            bgcolor: "rgba(255,255,255,0.8)",
            bordercolor: "rgba(0,0,0,0.2)",
            borderwidth: 1,
            borderpad: 4,
          },
          {
            x: 0.5,
            y: -0.15,
            xref: "paper",
            yref: "paper",
            text: "Points are jittered vertically to show density. Darker points show actual positions.",
            showarrow: false,
            font: { size: 10 },
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
          filename: `dot_plot_${column}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in dot plot:", error);
    return {
      data: [],
      layout: { title: `Error loading dot plot for ${column}` },
    };
  }
};

// Pareto Chart
export const getParetoPlot = async (column) => {
  try {
    const endpoint = `${baseURL}/pareto?column=${encodeURIComponent(column)}`;
    const raw = await fetchWithCache(endpoint);

    // Generate colors - gradient based on position
    const colors = generateColorPalette(raw.length, "purple");

    // Find 80% threshold for Pareto principle
    const paretoIndex = raw.findIndex((item) => item.cumulative_pct >= 80);

    // Calculate statistics
    const totalCount = raw.reduce((sum, item) => sum + item.count, 0);
    const categories = raw.length;
    const paretoCategories = paretoIndex === -1 ? categories : paretoIndex + 1;
    const paretoRatio = ((paretoCategories / categories) * 100).toFixed(1);

    // Create more readable labels for hover
    const hoverTexts = raw.map((item, i) => {
      return (
        `<b>${item.category}</b><br>` +
        `Count: ${item.count}<br>` +
        `Percentage: ${((item.count / totalCount) * 100).toFixed(1)}%<br>` +
        `Cumulative: ${item.cumulative_pct.toFixed(1)}%`
      );
    });

    return {
      data: [
        {
          type: "bar",
          x: raw.map((r) => r.category),
          y: raw.map((r) => r.count),
          text: raw.map((r) => ((r.count / totalCount) * 100).toFixed(1) + "%"),
          textposition: "auto",
          hovertext: hoverTexts,
          hoverinfo: "text",
          marker: {
            color: colors,
            line: {
              color: "rgba(58, 58, 58, 0.5)",
              width: 1,
            },
          },
          name: "Frequency",
        },
        {
          type: "scatter",
          mode: "lines+markers",
          yaxis: "y2",
          x: raw.map((r) => r.category),
          y: raw.map((r) => r.cumulative_pct),
          marker: {
            color: "rgba(239, 68, 68, 1)",
            size: 8,
            symbol: "circle",
          },
          line: {
            color: "rgba(239, 68, 68, 1)",
            width: 3,
            shape: "linear",
          },
          name: "Cumulative %",
          hovertemplate: "<b>%{x}</b><br>Cumulative: %{y:.1f}%<extra></extra>",
        },
        // Add horizontal line at 80% for Pareto principle
        {
          type: "scatter",
          mode: "lines",
          yaxis: "y2",
          x: [raw[0].category, raw[raw.length - 1].category],
          y: [80, 80],
          line: {
            color: "rgba(0, 0, 0, 0.5)",
            width: 1,
            dash: "dash",
          },
          name: "80% Line",
          hoverinfo: "skip",
        },
      ],
      layout: {
        title: {
          text: `<b>Pareto Chart of ${column}</b>`,
          font: { size: 18 },
        },
        xaxis: {
          title: {
            text: column,
            font: { size: 14 },
          },
          tickangle: raw.length > 10 ? -45 : 0,
          automargin: true,
        },
        yaxis: {
          title: {
            text: "Frequency",
            font: { size: 14 },
          },
          gridcolor: "rgba(0,0,0,0.1)",
          range: [0, Math.max(...raw.map((r) => r.count)) * 1.1],
        },
        yaxis2: {
          title: {
            text: "Cumulative %",
            font: { size: 14 },
          },
          ticksuffix: "%",
          overlaying: "y",
          side: "right",
          range: [0, 105],
        },
        hovermode: "closest",
        bargap: 0.2,
        showlegend: true,
        legend: {
          orientation: "h",
          y: -0.15,
        },
        shapes: [
          // Add vertical line at 80% cumulative threshold
          paretoIndex !== -1
            ? {
                type: "line",
                x0: raw[paretoIndex].category,
                x1: raw[paretoIndex].category,
                y0: 0,
                y1: 1,
                yref: "paper",
                line: {
                  color: "rgba(0, 0, 0, 0.5)",
                  width: 1,
                  dash: "dot",
                },
              }
            : null,
        ].filter(Boolean),
        annotations: [
          {
            x: 0.5,
            y: 1.12,
            xref: "paper",
            yref: "paper",
            text: `<b>Pareto Analysis:</b> ${paretoCategories} out of ${categories} categories (${paretoRatio}%) account for 80% of the total frequency`,
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
          filename: `pareto_chart_${column}`,
          height: 500,
          width: 700,
          scale: 2,
        },
      },
    };
  } catch (error) {
    console.error("Error in pareto plot:", error);
    return {
      data: [],
      layout: { title: `Error loading pareto chart for ${column}` },
    };
  }
};
