// import { useEffect, useState } from "react";
// import Chart from "./assets/UnivariateChartRenderer";
// import Univariate from "./Univariate";
// import Bivariate from "./Bivariate";
// import BivariatePlotsDataFetcher from "./utils/BivariatePlotsDataFetcher";
// import Multivariate from "./Multivariate";
// function App() {
//   const [cols, setCols] = useState([]);
//   const [projs, setProjs] = useState([]);
//   useEffect(() => {
//     const fetchProjects = async () => {
//       const pro = await fetch(`http://127.0.0.1:8000/get_projects`);
//       const re = await pro.json();
//       setProjs(re.projects || []);
//     };
//     fetchProjects();
//   }, []);

//   const fetchCols = async (projName) => {
//     const res = await fetch(
//       `http://127.0.0.1:8000/load_project/?path=Projects/${projName}/data.csv`,
//       { method: "POST" }
//     );
//     const data = await res.json();
//     setCols(data.columns);
//   };
//   return (
//     <>
//       <h1 className="text-3xl font-bold mb-6 text-center">📁 Project Loader</h1>

//       <div className="flex flex-wrap gap-4 justify-center mb-8">
//         {projs.map((pr, i) => (
//           <button
//             key={i}
//             onClick={() => fetchCols(pr)}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 active:bg-blue-800 transition-all"
//           >
//             {pr}
//           </button>
//         ))}
//       </div>
//       {/* <Univariate cols={cols} /> */}
//       <Bivariate cols={cols} />
//       {/* <Multivariate cols={cols} /> */}
//     </>
//   );
// }

// export default App;

import { useEffect, useState } from "react";
import Univariate from "./Univariate";
import Bivariate from "./Bivariate";
import Multivariate from "./Multivariate";

function App() {
  const [cols, setCols] = useState([]);
  const [projs, setProjs] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("univariate");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const pro = await fetch(`http://127.0.0.1:8000/get_projects`);
        if (!pro.ok) {
          throw new Error("Failed to fetch projects");
        }
        const re = await pro.json();
        setProjs(re.projects || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const fetchCols = async (projName) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/load_project/?path=Projects/${projName}/data.csv`,
        { method: "POST" }
      );
      if (!res.ok) {
        throw new Error("Failed to load project");
      }
      const data = await res.json();
      setCols(data.columns);
      setSelectedProject(projName);
    } catch (err) {
      console.error("Error loading project:", err);
      setError(`Failed to load project ${projName}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle sidebar on small screens
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-md transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-0 md:w-16"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            {isSidebarOpen && (
              <h2 className="text-xl font-bold text-indigo-600">DataViz</h2>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md hover:bg-slate-100 focus:outline-none"
            >
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Project List */}
          <div className="flex-grow overflow-y-auto">
            <div className={isSidebarOpen ? "p-4" : "p-2"}>
              {isSidebarOpen && (
                <h3 className="text-sm uppercase text-slate-500 font-medium mb-3">
                  Projects
                </h3>
              )}
              {isLoading && !projs.length ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500"></div>
                </div>
              ) : error && !projs.length ? (
                <div className="text-rose-500 text-sm p-2 bg-rose-50 rounded">
                  {error}
                </div>
              ) : (
                <ul className="space-y-1">
                  {projs.map((proj, i) => (
                    <li key={i}>
                      <button
                        onClick={() => fetchCols(proj)}
                        className={`w-full text-left rounded-md transition-all ${
                          selectedProject === proj
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "hover:bg-slate-50 text-slate-700"
                        } ${isSidebarOpen ? "px-3 py-2" : "p-2"}`}
                      >
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`${
                              isSidebarOpen ? "mr-3" : "mx-auto"
                            } h-5 w-5 ${
                              selectedProject === proj
                                ? "text-indigo-600"
                                : "text-slate-500"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={selectedProject === proj ? 2 : 1.5}
                              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                          </svg>
                          {isSidebarOpen && (
                            <span className="truncate">{proj}</span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          {isSidebarOpen && (
            <div className="p-4 border-t border-slate-100">
              <div className="text-xs text-slate-400">
                <p>Data Analysis Dashboard</p>
                <p>Version 1.0.0</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-4 md:hidden p-1 rounded-md hover:bg-slate-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Data Analysis Dashboard
                </h1>
                {selectedProject && (
                  <p className="text-sm text-slate-500">
                    Project:{" "}
                    <span className="font-medium">{selectedProject}</span>
                  </p>
                )}
              </div>
            </div>
            {isLoading && (
              <div className="flex items-center text-indigo-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-indigo-500 mr-2"></div>
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          {selectedProject && cols.length > 0 && (
            <div className="border-t border-slate-100">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("univariate")}
                  className={`px-5 py-3 whitespace-nowrap transition-colors ${
                    activeTab === "univariate"
                      ? "text-indigo-600 border-b-2 border-indigo-500 font-semibold"
                      : "text-slate-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-200"
                  }`}
                >
                  Univariate Analysis
                </button>
                <button
                  onClick={() => setActiveTab("bivariate")}
                  className={`px-5 py-3 whitespace-nowrap transition-colors ${
                    activeTab === "bivariate"
                      ? "text-indigo-600 border-b-2 border-indigo-500 font-semibold"
                      : "text-slate-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-200"
                  }`}
                >
                  Bivariate Analysis
                </button>
                <button
                  onClick={() => setActiveTab("multivariate")}
                  className={`px-5 py-3 whitespace-nowrap transition-colors ${
                    activeTab === "multivariate"
                      ? "text-indigo-600 border-b-2 border-indigo-500 font-semibold"
                      : "text-slate-600 hover:text-indigo-600 hover:border-b-2 hover:border-indigo-200"
                  }`}
                >
                  Multivariate Analysis
                </button>
              </nav>
            </div>
          )}
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {error ? (
            <div className="bg-rose-50 text-rose-800 p-4 m-4 rounded-lg shadow-sm">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 mt-0.5 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-semibold">Error</h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          ) : !selectedProject ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
              <h2 className="text-xl font-medium mb-2 text-slate-700">
                Select a Project
              </h2>
              <p className="max-w-md text-center">
                Choose a project from the sidebar to begin analyzing your data.
                You'll be able to perform univariate, bivariate, and
                multivariate analyses.
              </p>
            </div>
          ) : cols.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading project data...</p>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {activeTab === "univariate" && <Univariate cols={cols} />}
              {activeTab === "bivariate" && <Bivariate cols={cols} />}
              {activeTab === "multivariate" && <Multivariate cols={cols} />}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-2 px-4 text-center text-xs text-slate-400">
          DataViz Analytics Platform © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

export default App;
