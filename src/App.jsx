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
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectFile, setNewProjectFile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(null);
  // New state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pro = await fetch(`https://eda-tool.onrender.com/get_projects`);
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

  const fetchCols = async (projName) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://eda-tool.onrender.com/load_project/?path=Projects/${projName}/data.csv`,
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

  // Handle project creation form submission
  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      setError("Please enter a project name");
      return;
    }

    if (!newProjectFile) {
      setError("Please select a CSV file");
      return;
    }

    setIsCreating(true);
    setError(null);
    setCreateSuccess(null);

    try {
      const formData = new FormData();
      formData.append("name", newProjectName);
      formData.append("file", newProjectFile);

      const response = await fetch(
        "https://eda-tool.onrender.com/create_project/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 200) {
        setCreateSuccess(data.message);
        setNewProjectName("");
        setNewProjectFile(null);
        // Reset the file input
        document.getElementById("file-upload").value = "";
        // Refresh the projects list
        fetchProjects();
        // Close the modal after a delay
        setTimeout(() => {
          setShowNewProjectModal(false);
          setCreateSuccess(null);
        }, 2000);
      } else {
        setError(data.message || "Failed to create project");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setNewProjectFile(e.target.files[0]);
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (projectName) => {
    setProjectToDelete(projectName);
    setShowDeleteModal(true);
    setError(null);
    setDeleteSuccess(null);
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `https://eda-tool.onrender.com/delete_project/?name=${encodeURIComponent(
          projectToDelete
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok && data.status === 200) {
        setDeleteSuccess(data.message);

        // If the deleted project was selected, clear the selection
        if (selectedProject === projectToDelete) {
          setSelectedProject(null);
          setCols([]);
        }

        // Refresh the projects list
        fetchProjects();

        // Close the modal after a short delay
        setTimeout(() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
          setDeleteSuccess(null);
        }, 2000);
      } else {
        setError(data.message || "Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
              <h2 className="text-xl font-bold text-indigo-600">
                Data Insider
              </h2>
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
              <div className="flex justify-between items-center mb-3">
                {isSidebarOpen && (
                  <h3 className="text-sm uppercase text-slate-500 font-medium">
                    Projects
                  </h3>
                )}
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className={`p-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors ${
                    isSidebarOpen ? "" : "mx-auto"
                  }`}
                  title="Create new project"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

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
                      <div className="flex items-center">
                        <button
                          onClick={() => fetchCols(proj)}
                          className={`flex-grow text-left rounded-md transition-all ${
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
                        {isSidebarOpen && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(proj);
                            }}
                            className="ml-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                            title="Delete project"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
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
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Project
              </button>
            </div>
          ) : cols.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading project data...</p>
              </div>
            </div>
          ) : (
            <div className="p-4 h-full">
              {activeTab === "univariate" && <Univariate cols={cols} />}
              {activeTab === "bivariate" && <Bivariate cols={cols} />}
              {activeTab === "multivariate" && <Multivariate cols={cols} />}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 py-2 px-4 text-center text-xs text-slate-400">
          Data Analytics Platform © {new Date().getFullYear()}
        </footer>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Create New Project
              </h3>
            </div>
            <form onSubmit={handleCreateProject} className="px-6 py-4">
              <div className="mb-4">
                <label
                  htmlFor="project-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Upload CSV File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV files only</p>
                    {newProjectFile && (
                      <p className="text-sm text-indigo-600">
                        Selected: {newProjectFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {createSuccess && (
                <div className="mb-4 p-2 bg-green-50 text-green-800 rounded">
                  {createSuccess}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setNewProjectName("");
                    setNewProjectFile(null);
                    setError(null);
                    setCreateSuccess(null);
                  }}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`px-4 py-2 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isCreating ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isCreating ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Delete Project
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {error ? (
                <div className="mb-4 p-3 bg-rose-50 text-rose-800 rounded-md">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-rose-600 mr-2"
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
                    <span>{error}</span>
                  </div>
                </div>
              ) : deleteSuccess ? (
                <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-green-600 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{deleteSuccess}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center text-amber-600 mb-4">
                    <svg
                      className="h-10 w-10 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-lg font-medium">Are you sure?</p>
                  </div>
                  <p className="text-gray-600 mb-4">
                    You are about to delete project{" "}
                    <span className="font-semibold">{projectToDelete}</span>.
                    This action cannot be undone and all data related to this
                    project will be permanently removed.
                  </p>
                </>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                {!deleteSuccess && (
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className={`px-4 py-2 rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 ${
                      isDeleting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isDeleting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      "Delete Project"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
