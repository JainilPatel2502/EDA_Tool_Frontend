import { useEffect, useState } from "react";
import Chart from "./assets/UnivariateChartRenderer";
import Univariate from "./Univariate";
import Bivariate from "./Bivariate";
import BivariatePlotsDataFetcher from "./utils/BivariatePlotsDataFetcher";
import Multivariate from "./Multivariate";
function App() {
  const [cols, setCols] = useState([]);
  const [projs, setProjs] = useState([]);
  useEffect(() => {
    const fetchProjects = async () => {
      const pro = await fetch(`http://127.0.0.1:8000/get_projects`);
      const re = await pro.json();
      setProjs(re.projects || []);
    };
    fetchProjects();
  }, []);

  const fetchCols = async (projName) => {
    const res = await fetch(
      `http://127.0.0.1:8000/load_project/?path=Projects/${projName}/data.csv`,
      { method: "POST" }
    );
    const data = await res.json();
    setCols(data.columns);
  };
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-center">📁 Project Loader</h1>

      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {projs.map((pr, i) => (
          <button
            key={i}
            onClick={() => fetchCols(pr)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 active:bg-blue-800 transition-all"
          >
            {pr}
          </button>
        ))}
      </div>
      {/* <Univariate cols={cols} /> */}
      <Bivariate cols={cols} />
      {/* <Multivariate cols={cols} /> */}
    </>
  );
}

export default App;
