import React, { useState, useEffect } from "react";
import DocumentViewer from "../components/DocumentView/DocumentViewer";
import { Navigate } from "react-router-dom";

const ResultsUseStates = ({ externalState, onOpenViewer }) => {
  const extractionResults = externalState?.extractionResults;
  const ClickedIndex = externalState?.ClickedIndex;
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(ClickedIndex);

  // Guard
  if (!extractionResults) {
    return <Navigate to="/" replace />;
  }

  const setExtractedResults = (extractionResultsList) => {
    const docs = extractionResultsList.map((item) => ({
      file: item.file, // must be a File object
      filename: item.filename,
      extractedData: item.results || {},
      isProcessing: false,
      invalidDocumentError: false,
    }));

    setUploadedDocs(docs);
  };

  useEffect(() => {
    if (Array.isArray(extractionResults)) {
      setExtractedResults(extractionResults);
    }
  }, [extractionResults]);

  return (
    <DocumentViewer
      uploadedDocs={uploadedDocs}
      currentIndex={currentIndex}
      onOpenViewer={onOpenViewer}
      setCurrentIndex={setCurrentIndex}
      showPrev={currentIndex > 0}
      showNext={currentIndex < uploadedDocs.length - 1}
    />
  );
};

export default ResultsUseStates;
