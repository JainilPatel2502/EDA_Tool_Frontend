import { useState, useEffect } from "react";
import UnivariateChartRenderer from "./assets/UnivariateChartRenderer";

function Univariate({ cols }) {
  const [selectedCol, setSelectedCol] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentColumns, setRecentColumns] = useState([]);

  const types = [
    { id: "histogram", label: "Histogram", icon: "📊", numeric: true },
    { id: "bar_chart", label: "Bar Chart", icon: "📈", categorical: true },
    { id: "box", label: "Box Plot", icon: "📦", numeric: true },
    { id: "pie", label: "Pie Chart", icon: "🥧", categorical: true },
    { id: "density", label: "Density Plot", icon: "🔔", numeric: true },
    { id: "dot", label: "Dot Plot", icon: "🔵", numeric: true },
    { id: "pareto", label: "Pareto Chart", icon: "📋", categorical: true },
  ];

  // Save recent selections
  useEffect(() => {
    if (selectedCol) {
      setRecentColumns((prev) => {
        const filtered = prev.filter((col) => col !== selectedCol);
        return [selectedCol, ...filtered].slice(0, 5);
      });
    }
  }, [selectedCol]);

  const filteredColumns = searchTerm
    ? cols.filter((col) => col.toLowerCase().includes(searchTerm.toLowerCase()))
    : cols;

  const selectColumn = (col) => {
    setSelectedCol(col);
    // Auto-select a reasonable default plot type if none selected
    if (!selectedType) {
      // This is simplified logic - would need to check data type properly
      setSelectedType("histogram"); // Default to histogram
    }
  };

  const selectChart = (type) => {
    setSelectedType(type);
  };

  return (
    // <div className="h-full bg-gray-100 text-gray-800 p-4 md:p-8 font-sans">
    //   <div className="max-w-6xl mx-auto">
    <div className="min-h-screen bg-gray-100 text-gray-800 p-0 md:p-0 font-sans">
      <div className="max-w-screen mx-auto">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Univariate Analysis
            </h1>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="mt-2 md:mt-0 flex items-center text-blue-600 hover:text-blue-800"
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
              {showHelp ? "Hide Help" : "Show Help"}
            </button>
          </div>

          {showHelp && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm border border-blue-100">
              <h2 className="font-semibold text-blue-800 text-lg mb-2">
                How to use Univariate Analysis:
              </h2>
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  Select a <strong>column</strong> from your dataset from the
                  column selector
                </li>
                <li>
                  Choose a <strong>plot type</strong> that best suits your data
                  and analysis needs
                </li>
                <li>
                  The plot will automatically render with interactive features
                </li>
                <li>Hover over chart elements for detailed information</li>
                <li>
                  Use plot controls to zoom, pan, and download the visualization
                </li>
              </ol>
              <h3 className="font-semibold text-blue-800 mt-4 mb-1">
                Plot types:
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {types.map((type) => (
                  <li key={type.id} className="flex items-start">
                    <span className="mr-2">{type.icon}</span>
                    <div>
                      <span className="font-medium">{type.label}:</span>{" "}
                      {type.numeric
                        ? "Best for numerical data"
                        : "Best for categorical data"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Column Selector */}
            <div className="col-span-1 md:col-span-1">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Columns
              </h2>
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search columns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {recentColumns.length > 0 && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    Recently Used
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {recentColumns.map((col) => (
                      <button
                        key={col}
                        onClick={() => selectColumn(col)}
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedCol === col
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        } border`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredColumns.length > 0 ? (
                <div className="max-h-96 overflow-y-auto pr-1 border rounded-lg bg-gray-50">
                  <div className="divide-y divide-gray-200">
                    {filteredColumns.map((col) => (
                      <button
                        key={col}
                        onClick={() => selectColumn(col)}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors ${
                          selectedCol === col ? "bg-blue-50 font-medium" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          {selectedCol === col && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-blue-600 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span
                            className={
                              selectedCol === col ? "text-blue-700" : ""
                            }
                          >
                            {col}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg bg-gray-50 p-4 text-center text-gray-500">
                  No columns match your search
                </div>
              )}
            </div>

            {/* Plot Type Selector and Visualization Area */}
            <div className="col-span-1 md:col-span-3">
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Plot Types
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => selectChart(type.id)}
                    className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                      selectedType === type.id
                        ? "bg-blue-50 border-blue-300 text-blue-800"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <span className="text-xs text-center font-medium">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Visualization Area */}
              <UnivariateChartRenderer
                column={selectedCol}
                plot={selectedType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Univariate;
