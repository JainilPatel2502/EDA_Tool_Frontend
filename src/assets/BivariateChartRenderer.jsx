import Plot from "react-plotly.js";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const getPlotData = async () => {
      let data = null;

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
          console.warn("Unsupported chart type:", chartType);
          break;
      }

      setPlotData(data);
    };

    if (xCol && yCol && chartType) {
      setPlotData(null); // reset while loading
      getPlotData();
    }
  }, [xCol, yCol, sizeCol, chartType]);

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4 capitalize">
        {chartType} plot of <span className="font-mono">{xCol}</span> vs{" "}
        <span className="font-mono">{yCol}</span>
      </h2>

      {plotData ? (
        <Plot
          data={plotData.data}
          layout={{
            ...plotData.layout,
            autosize: true,
            paper_bgcolor: "#fff",
          }}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <p className="text-center text-gray-500 italic">Loading plot...</p>
      )}
    </div>
  );
}

export default BivariateChartRenderer;
