// import Plot from "react-plotly.js";
// import { useEffect, useState } from "react";
// import {
//   getScatterPlot,
//   getLinePlot,
//   getBoxByCategory,
//   getGroupedBarPlot,
//   getHeatmap,
//   getStackedBarPlot,
//   getHexbinPlot,
//   getBubblePlot,
//   getMosaicPlot,
// } from "../utils/BivariatePlotsDataFetcher";

// function BivariateChartRenderer({ xCol, yCol, sizeCol, chartType }) {
//   const [plotData, setPlotData] = useState(null);

//   useEffect(() => {
//     const getPlotData = async () => {
//       let data = null;

//       switch (chartType) {
//         case "scatter":
//           data = await getScatterPlot(xCol, yCol);
//           break;
//         case "line":
//           data = await getLinePlot(xCol, yCol);
//           break;
//         case "box_by_category":
//           data = await getBoxByCategory(xCol, yCol); // x = category, y = value
//           break;
//         case "grouped_bar":
//           data = await getGroupedBarPlot(xCol, yCol); // x = category, y = group
//           break;
//         case "heatmap":
//           data = await getHeatmap([xCol, yCol]); // expects array of numeric columns
//           break;
//         case "stacked_bar":
//           data = await getStackedBarPlot(xCol, yCol);
//           break;
//         case "hexbin":
//           data = await getHexbinPlot(xCol, yCol);
//           break;
//         case "bubble":
//           data = await getBubblePlot(xCol, yCol, sizeCol);
//           break;
//         case "mosaic":
//           data = await getMosaicPlot(xCol, yCol);
//           break;
//         default:
//           console.warn("Unsupported chart type:", chartType);
//           break;
//       }

//       setPlotData(data);
//     };

//     if (xCol && yCol && chartType) {
//       setPlotData(null); // reset while loading
//       getPlotData();
//     }
//   }, [xCol, yCol, sizeCol, chartType]);

//   return (
//     <div className="max-w-5xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-md">
//       <h2 className="text-xl font-semibold text-center mb-4 capitalize">
//         {chartType} plot of <span className="font-mono">{xCol}</span> vs{" "}
//         <span className="font-mono">{yCol}</span>
//       </h2>

//       {plotData ? (
//         <Plot
//           data={plotData.data}
//           layout={{
//             ...plotData.layout,
//             autosize: true,
//             paper_bgcolor: "#fff",
//           }}
//           useResizeHandler
//           style={{ width: "100%", height: "100%" }}
//         />
//       ) : (
//         <p className="text-center text-gray-500 italic">Loading plot...</p>
//       )}
//     </div>
//   );
// }

// export default BivariateChartRenderer;

import Plot from "react-plotly.js";
import { useEffect, useState, useRef } from "react";
import {
  getScatterPlot,
  getLinePlot,
  getBoxByCategory,
  getGroupedBarPlot,
  getHeatmap,
  getStackedBarPlot,
  getHexbinPlot,
  getBubblePlot,
  getMosaicPlot,
} from "../utils/BivariatePlotsDataFetcher";

function BivariateChartRenderer({ xCol, yCol, sizeCol, chartType }) {
  const [plotData, setPlotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plotRevision, setPlotRevision] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const plotContainerRef = useRef(null);

  // Plot descriptions for help panel
  const plotDescriptions = {
    scatter:
      "Shows the relationship between two numerical variables, with each point representing a data point.",
    line: "Shows trends between two variables, with connected points usually representing time or sequence.",
    box_by_category:
      "Shows statistical distribution of a numerical variable across different categories.",
    grouped_bar:
      "Compares numerical values across categories, with bars grouped by a secondary category.",
    heatmap:
      "Shows correlation or density between two or more variables using color intensity.",
    stacked_bar:
      "Shows composition of categories, with segments in each bar representing sub-categories.",
    hexbin:
      "Shows density of data points in a 2D space, using hexagonal bins and color intensity.",
    bubble:
      "Similar to scatter plots, but with a third dimension shown through point size.",
    mosaic:
      "Shows relationship between categorical variables using proportionally sized rectangles.",
  };

  // Handle responsive resizing
  useEffect(() => {
    function handleResize() {
      setPlotRevision((rev) => rev + 1);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getPlotData = async () => {
      setLoading(true);
      setError(null);
      let data = null;

      try {
        switch (chartType) {
          case "scatter":
            data = await getScatterPlot(xCol, yCol);
            break;
          case "line":
            data = await getLinePlot(xCol, yCol);
            break;
          case "box_by_category":
            data = await getBoxByCategory(xCol, yCol); // x = category, y = value
            break;
          case "grouped_bar":
            data = await getGroupedBarPlot(xCol, yCol); // x = category, y = group
            break;
          case "heatmap":
            data = await getHeatmap([xCol, yCol]); // expects array of numeric columns
            break;
          case "stacked_bar":
            data = await getStackedBarPlot(xCol, yCol);
            break;
          case "hexbin":
            data = await getHexbinPlot(xCol, yCol);
            break;
          case "bubble":
            data = await getBubblePlot(xCol, yCol, sizeCol);
            break;
          case "mosaic":
            data = await getMosaicPlot(xCol, yCol);
            break;
          default:
            throw new Error(`Unsupported chart type: ${chartType}`);
        }

        setPlotData(data);
      } catch (err) {
        console.error(err);
        setError(`Error loading plot: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (xCol && yCol && chartType) {
      setPlotData(null); // reset while loading
      getPlotData();
    }
  }, [xCol, yCol, sizeCol, chartType]);

  // Handle plot interaction
  const handlePlotClick = (event) => {
    // You could implement cross-filtering or highlighting here
    if (event && event.points && event.points.length > 0) {
      console.log("Plot clicked:", event.points[0]);
      // Example: for further interactivity implementation
      // setSelectedPoints([...event.points]);
    }
  };

  const formattedChartType = chartType.replace(/_/g, " ");

  if (!xCol || !yCol || !chartType) {
    return (
      <div className="max-w-5xl mx-auto mt-6 p-8 bg-white rounded-xl shadow-md text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-medium text-gray-500 mt-4">
          Select columns and a chart type
        </h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-6 p-8 bg-white rounded-xl shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-500 mt-4">
          Loading {formattedChartType} plot...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-6 p-8 bg-white rounded-xl shadow-md">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-red-800 text-lg font-medium">Error</h3>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-5xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-md"
      ref={plotContainerRef}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-semibold capitalize">
          {formattedChartType} of{" "}
          <span className="font-mono text-blue-600">{xCol}</span>
          {chartType === "bubble" ? (
            <>
              {" "}
              vs <span className="font-mono text-blue-600">{yCol}</span> (sized
              by <span className="font-mono text-blue-600">{sizeCol}</span>)
            </>
          ) : (
            <>
              {" "}
              vs <span className="font-mono text-blue-600">{yCol}</span>
            </>
          )}
        </h2>

        <div className="flex items-center mt-2 md:mt-0">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {showHelp ? "Hide Help" : "Help"}
          </button>

          <button
            className="ml-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => {
              if (plotData?.config?.toImageButtonOptions) {
                // Trigger Plotly's native download functionality
                const evt = new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                });
                document
                  .querySelector(
                    '.modebar-btn[data-title="Download plot as a png"]'
                  )
                  ?.dispatchEvent(evt);
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Save
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm">
          <h3 className="font-semibold text-blue-800">
            About this chart type:
          </h3>
          <p className="mt-1">
            {plotDescriptions[chartType] ||
              "A visualization of the relationship between two variables."}
          </p>

          <h4 className="font-semibold text-blue-800 mt-3">
            Interaction tips:
          </h4>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Click and drag to zoom into a specific area</li>
            <li>Double-click to reset the zoom</li>
            <li>Hover over elements for detailed information</li>
            <li>Use the toolbar in the top-right corner for more options</li>
            {chartType === "scatter" && (
              <li>Look for trend lines that show the relationship direction</li>
            )}
            {chartType === "box_by_category" && (
              <li>Boxes show the quartiles and median values</li>
            )}
            {chartType === "heatmap" && (
              <li>Darker colors indicate stronger correlations</li>
            )}
            {chartType === "bubble" && (
              <li>Larger bubbles indicate higher values for {sizeCol}</li>
            )}
          </ul>
        </div>
      )}

      <div className="relative">
        {plotData ? (
          <Plot
            data={plotData.data}
            layout={{
              ...plotData.layout,
              autosize: true,
              paper_bgcolor: "#fff",
              plot_bgcolor: "#fafafa",
              margin: {
                ...(plotData.layout?.margin || {}),
                t: 80,
                b: 80,
              },
              width: plotContainerRef.current?.clientWidth || undefined,
              height: 550,
            }}
            config={{
              responsive: true,
              displaylogo: false,
              modeBarButtonsToRemove: [],
              ...plotData.config,
            }}
            onClick={handlePlotClick}
            revision={plotRevision}
            className="w-full"
          />
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 italic">No plot data available</p>
          </div>
        )}

        {/* Optional tooltip guide shown on desktop */}
        {plotData && (
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-md shadow-md max-w-xs text-sm hidden md:block">
            <h4 className="font-bold text-gray-700">Insights</h4>
            <p className="mt-1 text-gray-600">
              {chartType === "scatter" &&
                "Look for patterns and correlations between the two variables."}
              {chartType === "line" &&
                "Observe trends and changes over the sequence."}
              {chartType === "box_by_category" &&
                "Compare distributions across different categories."}
              {chartType === "grouped_bar" &&
                "Compare groups within and across categories."}
              {chartType === "heatmap" &&
                "Identify strong positive (blue) or negative (red) correlations."}
              {chartType === "stacked_bar" &&
                "Compare total sizes and proportions simultaneously."}
              {chartType === "hexbin" &&
                "Identify areas of high data point density."}
              {chartType === "bubble" &&
                "Compare three variables simultaneously."}
              {chartType === "mosaic" &&
                "Analyze categorical data relationships and proportions."}
            </p>
          </div>
        )}
      </div>

      {/* Footer with additional information */}
      {plotData && (
        <div className="mt-4 pt-2 border-t text-xs text-gray-500 flex justify-between items-center">
          <div>
            <span className="font-semibold">Columns: </span>
            {xCol}, {yCol}
            {chartType === "bubble" ? `, ${sizeCol}` : ""}
          </div>
          <div>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? "Hide" : "Show"} chart guidance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BivariateChartRenderer;
