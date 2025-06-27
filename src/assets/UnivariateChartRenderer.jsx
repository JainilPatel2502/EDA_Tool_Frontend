import Plot from "react-plotly.js";
import { useEffect, useState, useRef } from "react";
import {
  getHistogram,
  getBarPlot,
  getBoxPlot,
  getPiePlot,
  getDensityPlot,
  getDotPlot,
  getParetoPlot,
} from "../utils/UnivariatePlotsDataFetcher";

function UnivariateChartRenderer({ column, plot }) {
  const [plotData, setPlotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plotRevision, setPlotRevision] = useState(0);
  const [plotInfo, setPlotInfo] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const plotContainerRef = useRef(null);

  // Descriptions for each plot type
  const plotDescriptions = {
    histogram:
      "Shows the distribution of numerical data using bars to represent frequency within bins",
    bar_chart:
      "Displays categorical data with rectangular bars proportional to the values they represent",
    box: "Displays the distribution of numerical data showing quartiles, median, and potential outliers",
    pie: "Shows proportion of categories as slices of a circle, useful for part-to-whole comparisons",
    density: "Smoothed representation of the distribution of numerical data",
    dot: "Simple scatterplot of values along a single axis, good for spotting clusters",
    pareto:
      "Combines a bar chart with a line chart showing cumulative percentages",
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
        switch (plot) {
          case "histogram":
            data = await getHistogram(column);
            break;
          case "bar_chart":
            data = await getBarPlot(column);
            break;
          case "box":
            data = await getBoxPlot(column);
            break;
          case "pie":
            data = await getPiePlot(column);
            break;
          case "density":
            data = await getDensityPlot(column);
            break;
          case "dot":
            data = await getDotPlot(column);
            break;
          case "pareto":
            data = await getParetoPlot(column);
            break;

          default:
            setError(`Unsupported plot type: ${plot}`);
            break;
        }

        setPlotData(data);
        setPlotInfo(plotDescriptions[plot] || "");
      } catch (err) {
        setError(`Error loading plot: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (column && plot) {
      setPlotData(null); // reset while loading
      getPlotData();
    }
  }, [column, plot]);

  // Handler for plot interactions
  const handlePlotClick = (data) => {
    console.log("Plot clicked:", data);
    // Here you could implement cross-filtering or other interactive features
  };

  if (!column || !plot) {
    return (
      <div className="max-w-4xl mx-auto mt-6 p-8 bg-white rounded-xl shadow-md text-center">
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
          {column ? "Select a plot type" : "Select a column and plot type"}
        </h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-6 p-8 bg-white rounded-xl shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading {plot} plot...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-6 p-8 bg-white rounded-xl shadow-md">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-red-800 text-lg font-medium">Error</h3>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const formattedPlotType = plot.replace(/_/g, " ");

  return (
    <div
      className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-md"
      ref={plotContainerRef}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-semibold capitalize">
          {formattedPlotType} of{" "}
          <span className="font-mono text-blue-600">{column}</span>
        </h2>
        <div className="flex items-center mt-2 md:mt-0">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-1">Help</span>
          </button>
          <button
            className="ml-4 text-gray-500 hover:text-gray-700 flex items-center"
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
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-1">Save</span>
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
          <h3 className="font-semibold text-blue-800">About this plot:</h3>
          <p className="mt-1">{plotInfo}</p>
          <h4 className="font-semibold mt-2 text-blue-800">
            Interaction tips:
          </h4>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Click and drag to zoom into a specific area</li>
            <li>Double-click to reset the zoom</li>
            <li>Hover over elements for detailed information</li>
            <li>Use the modebar (appears on hover) for additional options</li>
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
              plot_bgcolor: "#fff",
              margin: {
                ...(plotData.layout?.margin || {}),
                t: 80,
                b: 80,
              },
              width: plotContainerRef.current?.clientWidth || undefined,
              height: 500,
            }}
            config={{
              responsive: true,
              displaylogo: false,
              modeBarButtonsToRemove: ["lasso2d", "select2d"],
              modeBarButtonsToAdd: ["drawline", "drawopenpath", "eraseshape"],
              ...plotData.config,
            }}
            onClick={handlePlotClick}
            revision={plotRevision}
            className="w-full"
          />
        ) : (
          <p className="text-center text-gray-500 italic py-10">
            No plot data available
          </p>
        )}

        {/* Interactive legend/info panel, positioned at the bottom-right of the plot */}
        {plotData && (
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-md shadow-md max-w-xs text-sm hidden md:block">
            <h4 className="font-bold text-gray-700">Quick Guide</h4>
            <p className="mt-1 text-gray-600">
              {plot === "histogram"
                ? "Bars show frequency distribution of values."
                : plot === "bar_chart"
                ? "Height shows frequency of each category."
                : plot === "box"
                ? "Box shows quartiles, whiskers show range, points are outliers."
                : plot === "pie"
                ? "Size of each slice represents proportion."
                : plot === "density"
                ? "Curve shows the probability distribution of values."
                : plot === "dot"
                ? "Each dot represents a data point's value."
                : plot === "pareto"
                ? "Bars show frequency, line shows cumulative percentage."
                : plot === "violin"
                ? "Width shows frequency distribution at each value."
                : plot === "stem"
                ? "Each row shows a stem (significant digits) and its leaves."
                : "Hover over elements for more details."}
            </p>
          </div>
        )}
      </div>

      {/* Additional stats section */}
      {plotData && plotData.data && plotData.data.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 border-t pt-2 flex justify-between items-center">
          <div>
            <span className="font-semibold">Plot type:</span>{" "}
            {formattedPlotType}
          </div>
          <div>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                // Trigger modal or expand to show detailed statistics
                // For now, we'll just toggle the help panel
                setShowHelp(!showHelp);
              }}
            >
              Show detailed statistics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnivariateChartRenderer;
