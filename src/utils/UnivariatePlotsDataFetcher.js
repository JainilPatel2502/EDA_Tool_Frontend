// export const getHistogram = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/histogram?column=${column}`
//   );
//   const data = await res.json();
//   return data;
// };

// export const getBarPlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/bar?column=${column}`
//   );
//   const data = await res.json();

//   return data;
// };
// export const getBoxPlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/box?column=${column}`
//   );
//   const data = await res.json();

//   return data;
// };
// export const getPiePlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/pie?column=${column}`
//   );
//   const data = await res.json();

//   return data;
// };
// export const getDensityPlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/density?column=${column}`
//   );
//   const data = await res.json();

//   return data;
// };
// export const getDotPlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/dot?column=${column}`
//   );
//   const data = await res.json();

//   return data;
// };
// export const getParetoPlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/pareto?column=${column}`
//   );
//   const data = await res.json();

//   return data;
// };
// export const getViolinPlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/violin?column=${column}`
//   );
//   const data = await res.json();

//   return data;
// };
// export const getStemPlot = async (column) => {
//   const res = await fetch(
//     `http://127.0.0.1:8000/univariate/stem?column=${column}`
//   );
//   const data = await res.json();
//   console.log(data);
//   return data;
// };

// Histogram
export const getHistogram = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/histogram?column=${column}`
  );
  const { bins, counts } = await res.json();
  return {
    data: [
      {
        type: "bar",
        x: bins.slice(0, -1), // bins.length = counts.length + 1
        y: counts,
        marker: { color: "#3b82f6" },
      },
    ],
    layout: {
      title: `Histogram of ${column}`,
      xaxis: { title: "Bins" },
      yaxis: { title: "Count" },
    },
  };
};

// Bar Plot
export const getBarPlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/bar?column=${column}`
  );
  const raw = await res.json();
  return {
    data: [
      {
        type: "bar",
        x: raw.map((r) => r.label),
        y: raw.map((r) => r.value),
        marker: { color: "#f59e0b" },
      },
    ],
    layout: {
      title: `Bar Chart of ${column}`,
      xaxis: { title: "Category" },
      yaxis: { title: "Frequency" },
    },
  };
};

// Box Plot
export const getBoxPlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/box?column=${column}`
  );
  const data = await res.json();
  return {
    data: [
      {
        type: "box",
        y: [data.min, data.q1, data.median, data.q3, data.max],
        boxpoints: "outliers",
        name: column,
      },
    ],
    layout: {
      title: `Box Plot of ${column}`,
      yaxis: { title: column },
    },
  };
};

// Pie Plot
export const getPiePlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/pie?column=${column}`
  );
  const raw = await res.json();
  return {
    data: [
      {
        type: "pie",
        labels: raw.map((r) => r.label),
        values: raw.map((r) => r.value),
      },
    ],
    layout: {
      title: `Pie Chart of ${column}`,
    },
  };
};

// Density Plot
export const getDensityPlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/density?column=${column}`
  );
  const raw = await res.json();
  return {
    data: [
      {
        type: "scatter",
        mode: "lines",
        x: raw.map((p) => p.x),
        y: raw.map((p) => p.y),
        line: { color: "#10b981" },
      },
    ],
    layout: {
      title: `Density Plot of ${column}`,
      xaxis: { title: column },
      yaxis: { title: "Density" },
    },
  };
};

// Dot Plot
export const getDotPlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/dot?column=${column}`
  );
  const raw = await res.json();
  return {
    data: [
      {
        type: "scatter",
        mode: "markers",
        x: raw.map((_, i) => i),
        y: raw.map((r) => r.value),
        marker: { color: "#ef4444" },
      },
    ],
    layout: {
      title: `Dot Plot of ${column}`,
      xaxis: { title: "Index" },
      yaxis: { title: column },
    },
  };
};

// Pareto Chart
export const getParetoPlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/pareto?column=${column}`
  );
  const raw = await res.json();
  return {
    data: [
      {
        type: "bar",
        x: raw.map((r) => r.category),
        y: raw.map((r) => r.count),
        name: "Counts",
      },
      {
        type: "scatter",
        mode: "lines+markers",
        yaxis: "y2",
        x: raw.map((r) => r.category),
        y: raw.map((r) => r.cumulative_pct),
        name: "Cumulative %",
        line: { shape: "spline" },
      },
    ],
    layout: {
      title: `Pareto Chart of ${column}`,
      yaxis: { title: "Count" },
      yaxis2: {
        title: "Cumulative %",
        overlaying: "y",
        side: "right",
      },
    },
  };
};

// Violin Plot
export const getViolinPlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/violin?column=${column}`
  );
  const raw = await res.json();
  return {
    data: [
      {
        type: "violin",
        y: raw.kde.map((point) => point.x), // vertical violin
        points: "all",
        box: {
          visible: true,
        },
        line: {
          color: "blue",
        },
        name: column,
      },
    ],
    layout: {
      title: `Violin Plot of ${column}`,
    },
  };
};

// Stem-and-Leaf Plot (as table or bar-like)
export const getStemPlot = async (column) => {
  const res = await fetch(
    `http://127.0.0.1:8000/univariate/stem?column=${column}`
  );
  const raw = await res.json();
  return {
    data: [
      {
        type: "bar",
        x: raw.map((r) => r.stem),
        y: raw.map((r) => r.leaves.length),
        text: raw.map((r) => `Leaves: ${r.leaves.join(", ")}`),
        hoverinfo: "text+y",
      },
    ],
    layout: {
      title: `Stem-and-Leaf Plot of ${column}`,
      xaxis: { title: "Stem" },
      yaxis: { title: "# of Leaves" },
    },
  };
};
