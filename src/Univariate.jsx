import { useState } from "react";
import UnivariateChartRenderer from "./assets/UnivariateChartRenderer";
function Univariate({ cols }) {
  const [selectedCol, setSelectedCol] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const types = [
    "histogram",
    "bar_chart",
    "box",
    "pie",
    "density",
    "dot",
    "pareto",
    "violin",
    "stem",
  ];
  function selectcolumn(col) {
    setSelectedCol(col);
  }
  function selectchart(ty) {
    setSelectedType(ty);
  }
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">🧾 Columns:</h2>
        {cols.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1">
            {cols.map((col) => (
              <button
                key={col}
                onClick={() => selectcolumn(col)}
                className="text-gray-700"
              >
                {col}
              </button>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">
            Select a project to view its columns
          </p>
        )}
        {types.map((col) => (
          <button
            key={col}
            onClick={() => selectchart(col)}
            className="text-gray-700"
          >
            {col}
          </button>
        ))}

        <UnivariateChartRenderer column={selectedCol} plot={selectedType} />
      </div>
    </div>
  );
}
export default Univariate;
