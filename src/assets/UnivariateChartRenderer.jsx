import Plot from "react-plotly.js";
import { useEffect, useState } from "react";
import {
  getHistogram,
  getBarPlot,
  getBoxPlot,
  getPiePlot,
  getDensityPlot,
  getDotPlot,
  getParetoPlot,
  getViolinPlot,
  getStemPlot,
} from "../utils/UnivariatePlotsDataFetcher";

function UnivariateChartRenderer({ column, plot }) {
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    const getPlotData = async () => {
      let data = null;

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
        case "violin":
          data = await getViolinPlot(column);
          break;
        case "stem":
          data = await getStemPlot(column);
          break;
        default:
          console.warn("Unsupported plot type:", plot);
          break;
      }

      setPlotData(data);
    };

    if (column && plot) {
      setPlotData(null); // reset while loading
      getPlotData();
    }
  }, [column, plot]);

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-center mb-4 capitalize">
        {plot} plot of <span className="font-mono">{column}</span>
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

export default UnivariateChartRenderer;
