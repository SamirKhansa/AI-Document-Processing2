import React, { useState } from "react";
import DocumentResults from "./DocumentResults";
import ResultsUseStates from "./ResultsUseStates";
import LoadingSpinner from "../components/LoadingSpinner";

const ResultsSwitcher = () => {
  const [showViewer, setShowViewer] = useState(false);
  const [viewerState, setViewerState] = useState(null);

  const handleOpenViewer = (stateFromResults) => {
    if (!stateFromResults) {
      setShowViewer(false);
      return;
    }

    setViewerState(stateFromResults);
    setShowViewer(true);
  };

  return (
    <>
      {!showViewer ? (
        <DocumentResults onOpenViewer={handleOpenViewer} />
      ) : (
        <ResultsUseStates
          externalState={viewerState}
          onOpenViewer={handleOpenViewer}
        />
      )}
    </>
  );
};

export default ResultsSwitcher;
