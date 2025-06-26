import { useState, useCallback, useMemo } from "react";
import MultivariateChartRenderer from "./assets/MultivariateChartRenderer";

function Multivariate({ cols }) {
  const [selectedType, setSelectedType] = useState("");
  const [selectedCols, setSelectedCols] = useState([]);
  const [categoryCol, setCategoryCol] = useState("");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [zCol, setZCol] = useState("");
  const [valueCol, setValueCol] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  const types = useMemo(
    () => [
      {
        id: "pair",
        label: "Pair Plot",
        description: "Visualize relationships between pairs of variables",
      },
      {
        id: "parallel",
        label: "Parallel Coordinates",
        description: "Compare multiple variables across observations",
      },
      {
        id: "radar",
        label: "Radar Chart",
        description: "Compare multiple variables by category",
      },
      {
        id: "treemap",
        label: "Treemap",
        description: "Hierarchical data with nested rectangles",
      },
      {
        id: "sunburst",
        label: "Sunburst",
        description: "Hierarchical data with radial layout",
      },
      {
        id: "chord",
        label: "Chord Diagram",
        description: "Visualize flow between categories",
      },
      {
        id: "sankey",
        label: "Sankey Diagram",
        description: "Visualize flow between sequential categories",
      },
      {
        id: "upset",
        label: "UpSet Plot",
        description: "Analyze set intersections",
      },
      {
        id: "scatter3d",
        label: "3D Scatter",
        description: "Visualize relationships in 3D space",
      },
      {
        id: "contour",
        label: "Contour Plot",
        description: "Visualize 3D surface with contour lines",
      },
    ],
    []
  );

  const toggleSelectedCol = useCallback((col) => {
    setSelectedCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }, []);

  const handleTypeChange = useCallback((type) => {
    setSelectedType(type);
    setSelectedCols([]);
    setCategoryCol("");
    setXCol("");
    setYCol("");
    setZCol("");
    setValueCol("");
  }, []);

  const plotProps = {
    plot: selectedType,
    columns: selectedCols,
    category: categoryCol,
    x: xCol,
    y: yCol,
    z: zCol,
    valueCol: valueCol,
    pathCols: selectedCols,
    source: xCol,
    target: yCol,
  };

  const isFormValid = useCallback(() => {
    switch (selectedType) {
      case "pair":
      case "upset":
      case "parallel":
      case "sankey":
        return selectedCols.length >= 2;
      case "radar":
        return categoryCol && selectedCols.length >= 1;
      case "treemap":
      case "sunburst":
        return selectedCols.length >= 1 && valueCol;
      case "chord":
        return xCol && yCol;
      case "scatter3d":
      case "contour":
        return xCol && yCol && zCol;
      default:
        return false;
    }
  }, [selectedType, selectedCols, categoryCol, xCol, yCol, zCol, valueCol]);

  const plotRequirements = useMemo(() => {
    switch (selectedType) {
      case "pair":
        return "Select at least 2 columns to compare their relationships";
      case "parallel":
        return "Select at least 2 columns (optionally a category column for grouping)";
      case "radar":
        return "Select a category column and at least 1 value column";
      case "treemap":
      case "sunburst":
        return "Select path columns for hierarchy and a value column";
      case "chord":
        return "Select source and target columns to show relationships";
      case "sankey":
        return "Select at least 2 columns to visualize flow";
      case "upset":
        return "Select at least 2 columns to analyze set intersections";
      case "scatter3d":
      case "contour":
        return "Select X, Y, and Z columns for 3D visualization";
      default:
        return "";
    }
  }, [selectedType]);

  const selectedTypeObj = useMemo(
    () => types.find((t) => t.id === selectedType) || {},
    [types, selectedType]
  );

  const handleInfoClick = useCallback(
    (type) => {
      setShowTooltip(showTooltip === type ? null : type);
    },
    [showTooltip]
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-md space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-semibold">📊 Multivariate Analysis</h2>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
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
            {showHelp ? "Hide Help" : "Show Help"}
          </button>
        </div>

        {showHelp && (
          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <h3 className="font-bold text-lg mb-2">
              Using the Multivariate Analysis Tool
            </h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>Select a visualization type from the available options</li>
              <li>
                Configure the required parameters for your selected
                visualization
              </li>
              <li>
                The chart will automatically render when all required fields are
                selected
              </li>
              <li>Hover over data points for detailed information</li>
              <li>
                Use the chart controls in the top-right corner to zoom, pan, and
                export
              </li>
            </ol>
            <div className="mt-3 font-medium">
              Choose a visualization based on what you want to analyze:
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {types.map((type) => (
                <li key={type.id} className="flex items-start gap-2">
                  <span className="font-semibold min-w-[100px]">
                    {type.label}:
                  </span>
                  <span>{type.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-2">Select Plot Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {types.map((type) => (
              <div key={type.id} className="relative">
                <button
                  onClick={() => handleTypeChange(type.id)}
                  className={`px-3 py-2 rounded flex items-center justify-between w-full border transition-all ${
                    selectedType === type.id
                      ? "bg-green-600 text-white border-green-700"
                      : "bg-white border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm">{type.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 cursor-pointer"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInfoClick(type.id);
                    }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showTooltip === type.id && (
                  <div className="absolute z-10 top-full left-0 mt-1 w-48 bg-white border rounded-md shadow-lg p-2 text-xs">
                    {type.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedType && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">
                Configure {selectedTypeObj.label}
              </h3>
              <div className="text-xs text-gray-500 italic">
                {plotRequirements}
              </div>
            </div>

            {[
              "pair",
              "parallel",
              "radar",
              "sankey",
              "upset",
              "treemap",
              "sunburst",
            ].includes(selectedType) && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  {selectedType === "radar"
                    ? "Value Columns"
                    : "Select Columns"}
                  :
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md bg-gray-50">
                  {cols.map((col) => (
                    <button
                      key={col}
                      onClick={() => toggleSelectedCol(col)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedCols.includes(col)
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
                {selectedCols.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {selectedCols.join(", ")}
                  </div>
                )}
              </div>
            )}

            {["radar", "parallel"].includes(selectedType) && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  {selectedType === "radar"
                    ? "Category Column"
                    : "Optional Category Column"}
                  :
                </label>
                <select
                  className="border rounded-md p-2 w-full bg-white"
                  value={categoryCol}
                  onChange={(e) => setCategoryCol(e.target.value)}
                >
                  <option value="">-- Select Category Column --</option>
                  {cols.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {["treemap", "sunburst"].includes(selectedType) && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Value Column:
                </label>
                <select
                  className="border rounded-md p-2 w-full bg-white"
                  value={valueCol}
                  onChange={(e) => setValueCol(e.target.value)}
                >
                  <option value="">-- Select Value Column --</option>
                  {cols.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  This column determines the size of each section in the
                  visualization
                </p>
              </div>
            )}

            {selectedType === "chord" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Source Column:
                  </label>
                  <select
                    className="border rounded-md p-2 w-full bg-white"
                    value={xCol}
                    onChange={(e) => setXCol(e.target.value)}
                  >
                    <option value="">-- Source --</option>
                    {cols.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Target Column:
                  </label>
                  <select
                    className="border rounded-md p-2 w-full bg-white"
                    value={yCol}
                    onChange={(e) => setYCol(e.target.value)}
                  >
                    <option value="">-- Target --</option>
                    {cols.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Value Column (optional):
                  </label>
                  <select
                    className="border rounded-md p-2 w-full bg-white"
                    value={valueCol}
                    onChange={(e) => setValueCol(e.target.value)}
                  >
                    <option value="">-- Value (optional) --</option>
                    {cols.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {["scatter3d", "contour"].includes(selectedType) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    X Axis:
                  </label>
                  <select
                    className="border rounded-md p-2 w-full bg-white"
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
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Y Axis:
                  </label>
                  <select
                    className="border rounded-md p-2 w-full bg-white"
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
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Z Axis:
                  </label>
                  <select
                    className="border rounded-md p-2 w-full bg-white"
                    value={zCol}
                    onChange={(e) => setZCol(e.target.value)}
                  >
                    <option value="">-- Z Column --</option>
                    {cols.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          {selectedType ? (
            isFormValid() ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-2 rounded-md flex items-center text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Rendering {selectedTypeObj.label}</span>
                </div>
                <MultivariateChartRenderer {...plotProps} />
                <div className="text-xs text-gray-500 italic mt-2">
                  Tip: Hover over data points for more details. Use chart
                  controls for zooming and other options.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-500 mb-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-center font-medium text-amber-800">
                  Please select all required fields for the{" "}
                  {selectedTypeObj.label}
                </p>
                <p className="text-center text-amber-600 text-sm mt-1">
                  {plotRequirements}
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                Select a visualization type
              </h3>
              <p className="text-gray-500 text-center">
                Choose from the options above to generate an interactive
                visualization
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Multivariate;
