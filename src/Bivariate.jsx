import { useState } from "react";
import BivariateChartRenderer from "./assets/BivariateChartRenderer";

function Bivariate({ cols }) {
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [sizeCol, setSizeCol] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const types = [
    "scatter",
    "line",
    "box_by_category",
    "grouped_bar",
    "heatmap",
    "stacked_bar",
    "hexbin",
    "bubble",
    "mosaic",
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
        <h2 className="text-xl font-semibold">📌 Select Columns</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            className="border rounded p-2"
            value={xCol}
            onChange={(e) => setXCol(e.target.value)}
          >
            <option value="">-- X Column --</option>
            {cols.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <select
            className="border rounded p-2"
            value={yCol}
            onChange={(e) => setYCol(e.target.value)}
          >
            <option value="">-- Y Column --</option>
            {cols.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          {selectedType === "bubble" && (
            <select
              className="border rounded p-2"
              value={sizeCol}
              onChange={(e) => setSizeCol(e.target.value)}
            >
              <option value="">-- Size Column (Bubble) --</option>
              {cols.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-4 space-x-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded ${
                selectedType === type
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Render chart if valid selection */}
        {xCol && yCol && selectedType && (
          <BivariateChartRenderer
            xCol={xCol}
            yCol={yCol}
            sizeCol={selectedType === "bubble" ? sizeCol : undefined}
            chartType={selectedType}
          />
        )}
      </div>
    </div>
  );
}

export default Bivariate;
