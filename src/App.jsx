import FileUploadPage from "./pages/FileUploadPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import ResultsUseStates from "./pages/ResultsUseStates";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DocumentResults from "./pages/DocumentResults";
import ResultsSwitcher from "./pages/ResultsSwitcher";
import UseCases from "./pages/UseCases";
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<UseCases />} />
        <Route path='/doc-iq' element={<HomePage />} />
        <Route path='/file-upload' element={<FileUploadPage />} />
        <Route path='/Results' element={<ResultsSwitcher />} />
      </Routes>
    </Router>
  );
}

export default App;
