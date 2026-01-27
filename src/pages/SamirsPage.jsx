import { useLocation, Navigate } from "react-router-dom";

const SamirsPage = () => {
  const location = useLocation();
  const extractionResults = location.state?.extractionResults;

  // Optional guard (prevents direct URL access)
  if (!extractionResults) {
    return <Navigate to='/' replace />;
  }

  console.log("Results:", extractionResults);

  return (
    <div className='p-4 text-white'>
      <h2 className='text-xl font-semibold mb-4'>Extraction Results</h2>

      {extractionResults.map((result, index) => (
        <pre key={index} className=' p-2 mb-2 text-white'>
          {JSON.stringify(result, null, 2)}
        </pre>
      ))}
    </div>
  );
};

export default SamirsPage;
