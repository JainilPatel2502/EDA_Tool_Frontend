// import { useState, useRef, useEffect } from "react";
// import BivariateChartRenderer from "./assets/BivariateChartRenderer";

// function Bivariate({ cols }) {
//   const [xCol, setXCol] = useState("");
//   const [yCol, setYCol] = useState("");
//   const [sizeCol, setSizeCol] = useState("");
//   const [selectedType, setSelectedType] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showHelp, setShowHelp] = useState(false);
//   const [recentPairs, setRecentPairs] = useState([]);
//   const chartContainerRef = useRef(null);

//   const types = [
//     {
//       id: "scatter",
//       label: "Scatter Plot",
//       icon: "📊",
//       description: "Shows relationship between two numerical variables",
//     },
//     {
//       id: "line",
//       label: "Line Plot",
//       icon: "📈",
//       description: "Shows trends between ordered data points",
//     },

//     {
//       id: "grouped_bar",
//       label: "Grouped Bar",
//       icon: "📊",
//       description: "Compare categories with groups",
//     },
//     {
//       id: "stacked_bar",
//       label: "Stacked Bar",
//       icon: "📚",
//       description: "Shows composition within categories",
//     },
//     {
//       id: "hexbin",
//       label: "Hexbin",
//       icon: "🔷",
//       description: "Shows 2D data density using hexagons",
//     },
//     {
//       id: "bubble",
//       label: "Bubble",
//       icon: "⭕",
//       description: "Shows relationship with point size as third variable",
//     },
//     {
//       id: "mosaic",
//       label: "Mosaic",
//       icon: "🧩",
//       description: "Shows relationship between categorical variables",
//     },
//   ];

//   // Save recent selections
//   useEffect(() => {
//     if (xCol && yCol) {
//       const newPair = { x: xCol, y: yCol, type: selectedType };
//       setRecentPairs((prev) => {
//         // Check if pair already exists
//         const exists = prev.some((p) => p.x === xCol && p.y === yCol);
//         if (!exists) {
//           // Add to beginning, limit to 5 recent pairs
//           return [newPair, ...prev].slice(0, 5);
//         }
//         return prev;
//       });
//     }
//   }, [xCol, yCol, selectedType]);

//   // Filter columns if search term is provided
//   const filteredCols = searchTerm
//     ? cols.filter((col) => col.toLowerCase().includes(searchTerm.toLowerCase()))
//     : cols;

//   // Scroll to chart when creating a new one
//   useEffect(() => {
//     if (xCol && yCol && selectedType && chartContainerRef.current) {
//       chartContainerRef.current.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }
//   }, [xCol, yCol, selectedType]);

//   // Helper to check if current selection is valid for the selected chart type
//   const isValidSelection = () => {
//     if (!xCol || !yCol || !selectedType) return false;
//     if (selectedType === "bubble" && !sizeCol) return false;
//     return true;
//   };

//   // Clear all selections
//   const handleClearSelections = () => {
//     setXCol("");
//     setYCol("");
//     setSizeCol("");
//     setSelectedType("");
//   };

//   // Load a recent pair
//   const handleLoadRecentPair = (pair) => {
//     setXCol(pair.x);
//     setYCol(pair.y);
//     setSelectedType(pair.type || "scatter"); // Default to scatter if no type
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 text-gray-800 p-0 md:p-0 font-sans">
//       <div className="max-w-screen mx-auto">
//         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//             <h1 className="text-2xl font-bold text-gray-800 flex items-center">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-7 w-7 mr-2 text-blue-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
//                 />
//               </svg>
//               Bivariate Analysis
//             </h1>
//             <button
//               onClick={() => setShowHelp(!showHelp)}
//               className="mt-2 md:mt-0 flex items-center text-blue-600 hover:text-blue-800"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-1"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               {showHelp ? "Hide Help" : "Show Help"}
//             </button>
//           </div>

//           {showHelp && (
//             <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm">
//               <h2 className="font-semibold text-blue-800 text-lg mb-2">
//                 How to use Bivariate Analysis:
//               </h2>
//               <ol className="list-decimal ml-5 space-y-2">
//                 <li>
//                   Select an <strong>X column</strong> and a{" "}
//                   <strong>Y column</strong> from your dataset that you want to
//                   compare
//                 </li>
//                 <li>
//                   Choose a <strong>chart type</strong> that best suits your data
//                   and analysis needs
//                 </li>
//                 <li>
//                   For bubble charts, select a third <strong>Size column</strong>{" "}
//                   to determine the size of each point
//                 </li>
//                 <li>
//                   The visualization will automatically render with interactive
//                   features
//                 </li>
//                 <li>
//                   Hover over elements for detailed information and insights
//                 </li>
//               </ol>
//               <h3 className="font-semibold text-blue-800 mt-4 mb-1">
//                 Chart types:
//               </h3>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
//                 {types.map((type) => (
//                   <div key={type.id} className="flex items-center">
//                     <span className="mr-2">{type.icon}</span>
//                     <div>
//                       <span className="font-medium">{type.label}:</span>{" "}
//                       {type.description}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Recent pairs section */}
//           {recentPairs.length > 0 && (
//             <div className="mb-6">
//               <h2 className="font-semibold mb-2 flex items-center text-gray-700">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5 mr-1"
//                   viewBox="0 0 20 20"
//                   fill="currentColor"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//                 Recent Analyses
//               </h2>
//               <div className="flex flex-wrap gap-2">
//                 {recentPairs.map((pair, index) => (
//                   <button
//                     key={index}
//                     onClick={() => handleLoadRecentPair(pair)}
//                     className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full flex items-center"
//                   >
//                     <span className="font-mono">{pair.x}</span>
//                     <span className="mx-1">vs</span>
//                     <span className="font-mono">{pair.y}</span>
//                     <span className="ml-1 text-gray-500">
//                       ({pair.type.replace("_", " ")})
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Column Selection */}
//             <div className="col-span-1 md:col-span-2">
//               <div className="mb-4">
//                 <label className="block mb-1 font-medium">
//                   Search Columns:
//                 </label>
//                 <input
//                   type="text"
//                   className="w-full p-2 border rounded-md"
//                   placeholder="Type to filter columns..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block mb-1 font-medium">X Column:</label>
//                   <select
//                     className="w-full p-2 border rounded-md bg-white"
//                     value={xCol}
//                     onChange={(e) => setXCol(e.target.value)}
//                   >
//                     <option value="">-- Select X Column --</option>
//                     {filteredCols.map((col) => (
//                       <option key={col} value={col}>
//                         {col}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block mb-1 font-medium">Y Column:</label>
//                   <select
//                     className="w-full p-2 border rounded-md bg-white"
//                     value={yCol}
//                     onChange={(e) => setYCol(e.target.value)}
//                   >
//                     <option value="">-- Select Y Column --</option>
//                     {filteredCols.map((col) => (
//                       <option key={col} value={col}>
//                         {col}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Size column for bubble charts */}
//               {selectedType === "bubble" && (
//                 <div className="mt-4">
//                   <label className="block mb-1 font-medium">
//                     Size Column (for bubble chart):
//                   </label>
//                   <select
//                     className="w-full p-2 border rounded-md bg-white"
//                     value={sizeCol}
//                     onChange={(e) => setSizeCol(e.target.value)}
//                   >
//                     <option value="">-- Select Size Column --</option>
//                     {filteredCols.map((col) => (
//                       <option key={col} value={col}>
//                         {col}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}

//               <div className="mt-4 flex justify-end">
//                 <button
//                   onClick={handleClearSelections}
//                   className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-4 w-4 mr-1"
//                     viewBox="0 0 20 20"
//                     fill="currentColor"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                   Clear Selections
//                 </button>
//               </div>
//             </div>

//             {/* Chart Type Selection */}
//             <div className="col-span-1">
//               <label className="block mb-1 font-medium">Chart Type:</label>
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
//                 {types.map((type) => (
//                   <button
//                     key={type.id}
//                     onClick={() => setSelectedType(type.id)}
//                     className={`flex items-center p-2 rounded-md transition-colors ${
//                       selectedType === type.id
//                         ? "bg-blue-100 text-blue-800 border-blue-300 border"
//                         : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
//                     }`}
//                   >
//                     <span className="text-xl mr-2">{type.icon}</span>
//                     <div className="text-left">
//                       <div className="font-medium text-sm">{type.label}</div>
//                       <div className="text-xs text-gray-600 truncate">
//                         {type.description}
//                       </div>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Chart display area */}
//           <div ref={chartContainerRef} className="mt-8">
//             {isValidSelection() ? (
//               <BivariateChartRenderer
//                 xCol={xCol}
//                 yCol={yCol}
//                 sizeCol={sizeCol}
//                 chartType={selectedType}
//               />
//             ) : (
//               <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-12 w-12 mx-auto text-gray-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
//                   />
//                 </svg>
//                 <h3 className="mt-4 text-lg font-medium text-gray-600">
//                   Select columns and a chart type to begin
//                 </h3>
//                 <p className="mt-2 text-gray-500">
//                   Your visualization will appear here
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Bivariate;
import { useState, useRef, useEffect } from "react";
import BivariateChartRenderer from "./assets/BivariateChartRenderer";

function Bivariate({ cols }) {
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [sizeCol, setSizeCol] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [recentPairs, setRecentPairs] = useState([]);
  const chartContainerRef = useRef(null);

  const types = [
    {
      id: "scatter",
      label: "Scatter Plot",
      icon: "",
      description: "",
    },
    {
      id: "line",
      label: "Line Plot",
      icon: "",
      description: "",
    },

    {
      id: "grouped_bar",
      label: "Grouped Bar",
      icon: "",
      description: "",
    },
    {
      id: "stacked_bar",
      label: "Stacked Bar",
      icon: "",
      description: "",
    },
    {
      id: "hexbin",
      label: "Hexbin",
      icon: "",
      description: "",
    },
    {
      id: "bubble",
      label: "Bubble",
      icon: "",
      description: "",
    },
    {
      id: "mosaic",
      label: "Mosaic",
      icon: "",
      description: "",
    },
  ];

  // Save recent selections
  useEffect(() => {
    if (xCol && yCol) {
      const newPair = { x: xCol, y: yCol, type: selectedType };
      setRecentPairs((prev) => {
        // Check if pair already exists
        const exists = prev.some((p) => p.x === xCol && p.y === yCol);
        if (!exists) {
          // Add to beginning, limit to 5 recent pairs
          return [newPair, ...prev].slice(0, 5);
        }
        return prev;
      });
    }
  }, [xCol, yCol, selectedType]);

  // Filter columns if search term is provided
  const filteredCols = searchTerm
    ? cols.filter((col) => col.toLowerCase().includes(searchTerm.toLowerCase()))
    : cols;

  // Scroll to chart when creating a new one
  useEffect(() => {
    if (xCol && yCol && selectedType && chartContainerRef.current) {
      chartContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [xCol, yCol, selectedType]);

  // Helper to check if current selection is valid for the selected chart type
  const isValidSelection = () => {
    if (!xCol || !yCol || !selectedType) return false;
    if (selectedType === "bubble" && !sizeCol) return false;
    return true;
  };

  // Clear all selections
  const handleClearSelections = () => {
    setXCol("");
    setYCol("");
    setSizeCol("");
    setSelectedType("");
  };

  // Load a recent pair
  const handleLoadRecentPair = (pair) => {
    setXCol(pair.x);
    setYCol(pair.y);
    setSelectedType(pair.type || "scatter"); // Default to scatter if no type
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-0 md:p-0 font-sans">
      <div className="max-w-screen mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
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
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              Bivariate Analysis
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
            <div className="mb-6 p-4 bg-blue-50 rounded-lg text-sm">
              <h2 className="font-semibold text-blue-800 text-lg mb-2">
                How to use Bivariate Analysis:
              </h2>
              <ol className="list-decimal ml-5 space-y-2">
                <li>
                  Select an <strong>X column</strong> and a{" "}
                  <strong>Y column</strong> from your dataset that you want to
                  compare
                </li>
                <li>
                  Choose a <strong>chart type</strong> that best suits your data
                  and analysis needs
                </li>
                <li>
                  For bubble charts, select a third <strong>Size column</strong>{" "}
                  to determine the size of each point
                </li>
                <li>
                  The visualization will automatically render with interactive
                  features
                </li>
                <li>
                  Hover over elements for detailed information and insights
                </li>
              </ol>
              <h3 className="font-semibold text-blue-800 mt-4 mb-1">
                Chart types:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {types.map((type) => (
                  <div key={type.id} className="flex items-center">
                    <span className="mr-2">{type.icon}</span>
                    <div>
                      <span className="font-medium">{type.label}:</span>{" "}
                      {type.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent pairs section */}
          {recentPairs.length > 0 && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2 flex items-center text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Recent Analyses
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentPairs.map((pair, index) => (
                  <button
                    key={index}
                    onClick={() => handleLoadRecentPair(pair)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full flex items-center"
                  >
                    <span className="font-mono">{pair.x}</span>
                    <span className="mx-1">vs</span>
                    <span className="font-mono">{pair.y}</span>
                    <span className="ml-1 text-gray-500">
                      ({pair.type.replace("_", " ")})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Column Selection and Chart Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Column Selection and Type Selection */}
            <div className="lg:col-span-1">
              {/* <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Search Columns:
                </label>
                <input
                  type="text"
                  placeholder="Search columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div> */}
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

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-medium">X Column:</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={xCol}
                    onChange={(e) => setXCol(e.target.value)}
                  >
                    <option value="">-- Select X Column --</option>
                    {filteredCols.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Y Column:</label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={yCol}
                    onChange={(e) => setYCol(e.target.value)}
                  >
                    <option value="">-- Select Y Column --</option>
                    {filteredCols.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Size column for bubble charts */}
              {selectedType === "bubble" && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">
                    Size Column (for bubble chart):
                  </label>
                  <select
                    className="w-full p-2 border rounded-md bg-white"
                    value={sizeCol}
                    onChange={(e) => setSizeCol(e.target.value)}
                  >
                    <option value="">-- Select Size Column --</option>
                    {filteredCols.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Chart Type Selection */}
              <div className="mt-4">
                <label className="block mb-1 font-medium">Chart Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  {types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center p-2 rounded-md transition-colors ${
                        selectedType === type.id
                          ? "bg-blue-100 text-blue-800 border-blue-300 border"
                          : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <span className="text-xl mr-2">{type.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-gray-600 truncate">
                          {type.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClearSelections}
                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Clear Selections
                </button>
              </div>
            </div>

            {/* Right Side - Chart display area */}
            <div ref={chartContainerRef} className="lg:col-span-2">
              {isValidSelection() ? (
                <BivariateChartRenderer
                  xCol={xCol}
                  yCol={yCol}
                  sizeCol={sizeCol}
                  chartType={selectedType}
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 h-full flex items-center justify-center">
                  <div className="text-center">
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-600">
                      Select columns and a chart type to begin
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Your visualization will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bivariate;
