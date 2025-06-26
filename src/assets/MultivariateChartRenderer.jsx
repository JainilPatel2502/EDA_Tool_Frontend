/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import {
  getPairPlot,
  getParallelCoordinates,
  getRadarChart,
  getTreemap,
  getSunburst,
  getChordDiagram,
  getSankey,
  getUpsetPlot,
  getScatter3D,
  getContourPlot,
} from "../utils/MultivariatePlotDataFetcher";

function MultivariateChartRenderer({
  plot,
  columns = [],
  category = "",
  pathCols = [],
  valueCol = "",
  source = "",
  target = "",
  x = "",
  y = "",
  z = "",
}) {
  const [plotData, setPlotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePoints, setActivePoints] = useState([]);
  const [plotRevision, setPlotRevision] = useState(0);
  const plotContainerRef = useRef(null);

  // Handle responsive resizing
  useEffect(() => {
    function handleResize() {
      setPlotRevision((rev) => rev + 1);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchPlotData() {
      setLoading(true);
      setError(null);
      setActivePoints([]);
      let data = null;

      try {
        if (plot === "pair" && columns.length >= 2) {
          data = await getPairPlot(columns);
        } else if (plot === "parallel" && columns.length >= 2) {
          data = await getParallelCoordinates(columns, category);
        } else if (plot === "radar" && category && columns.length >= 1) {
          data = await getRadarChart(category, columns);
        } else if (
          (plot === "treemap" || plot === "sunburst") &&
          pathCols.length >= 1 &&
          valueCol
        ) {
          data =
            plot === "treemap"
              ? await getTreemap(pathCols, valueCol)
              : await getSunburst(pathCols, valueCol);
        } else if (plot === "chord" && source && target) {
          data = await getChordDiagram(source, target, valueCol);
        } else if (plot === "sankey" && columns.length >= 2) {
          data = await getSankey(columns);
        } else if (plot === "upset" && columns.length >= 2) {
          data = await getUpsetPlot(columns);
        } else if (plot === "scatter3d" && x && y && z) {
          data = await getScatter3D(x, y, z);
        } else if (plot === "contour" && x && y && z) {
          data = await getContourPlot(x, y, z);
        }
        setPlotData(data);
      } catch (err) {
        setError("Error loading plot: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (plot) {
      fetchPlotData();
    }
  }, [plot, columns, category, pathCols, valueCol, source, target, x, y, z]);

  // Handle plot interactions
  const handlePlotClick = (event) => {
    if (!event || !event.points || event.points.length === 0) return;

    const point = event.points[0];
    console.log("Plot clicked:", point);

    // Here we could implement cross-filtering or details on demand
    setActivePoints((prev) => {
      const pointId = `${point.curveNumber}-${point.pointNumber}`;
      if (prev.includes(pointId)) {
        return prev.filter((p) => p !== pointId);
      } else {
        return [...prev, pointId];
      }
    });
  };

  const handleLegendClick = (event) => {
    console.log("Legend clicked:", event);
    // We could implement custom legend behavior here
    return false; // Prevents default legend click behavior
  };

  if (!plot) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">Loading visualization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  // Enhance the default layout with common improvements
  const enhanceLayout = (layout) => {
    return {
      ...layout,
      autosize: true,
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "white",
        font: { family: "Arial", size: 12 },
      },
      modebar: { orientation: "v" },
      font: { family: "Arial, sans-serif" },
      dragmode: "zoom",
      ...layout,
    };
  };

  const enhancedConfig = {
    responsive: true,
    displaylogo: false,
    modeBarButtonsToAdd: ["select2d", "lasso2d", "resetScale2d", "toggleHover"],
    toImageButtonOptions: {
      format: "png",
      filename: "multivariate_plot",
      scale: 2,
    },
  };

  if (plot === "pair" && Array.isArray(plotData)) {
    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        ref={plotContainerRef}
      >
        {plotData.map((pair, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <Plot
              key={idx}
              data={pair.data}
              layout={enhanceLayout({
                ...pair.layout,
                height: 450,
                width: plotContainerRef.current
                  ? plotContainerRef.current.offsetWidth / 2 - 20
                  : 400,
              })}
              config={enhancedConfig}
              revision={plotRevision}
              onClick={handlePlotClick}
              onLegendClick={handleLegendClick}
              className="w-full"
            />
            <div className="absolute top-2 right-2">
              <div className="bg-white rounded-full p-1 shadow-sm cursor-pointer hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (plotData && plotData.data && plotData.data.length > 0) {
    return (
      <div
        className="relative bg-white rounded-lg shadow-sm"
        ref={plotContainerRef}
      >
        <Plot
          data={plotData.data}
          layout={enhanceLayout({
            ...plotData.layout,
            height: 600,
            width: plotContainerRef.current
              ? plotContainerRef.current.offsetWidth
              : undefined,
          })}
          config={plotData.config || enhancedConfig}
          revision={plotRevision}
          onClick={handlePlotClick}
          onLegendClick={handleLegendClick}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
      <p className="font-medium">No visualization data available.</p>
      <p className="text-sm mt-1">
        Try different parameters or check your data source.
      </p>
    </div>
  );
}

export default MultivariateChartRenderer;
