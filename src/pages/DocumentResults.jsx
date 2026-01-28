import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "primeicons/primeicons.css";

// --- You can copy the component starting from here ---

const DocumentResults = ({ onOpenViewer }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const validationResults = location.state?.validationResults || [];
  const extractionResults = location.state?.extractionResults || [];
  const industry_name = location.state?.industry_name || "";

  console.log(extractionResults);

  const industies = {
    Healthcare: ["QID", "Insurance"],
    Finance: ["QID", "Passport"],
    Transportation: ["QID", "Driving License"],
    Hospitality: ["QID", "Passport", "Driving License"],
  };

  const [resultsTitle, setResultsTitle] = React.useState("");
  const [allDocsValid, setAllDocsValid] = React.useState(null);
  // Mock data for standalone testing
  const sampleValidationResults = [];

  const resultsToDisplay =
    validationResults.length > 0 ? validationResults : sampleValidationResults;

  const requiredDocs = industies[industry_name] || [];

  const filteredResults = extractionResults
    .filter((doc) => requiredDocs.includes(doc.fileType))
    .map((doc) => {
      const validation = validationResults.find(
        (v) => v.filename === doc.filename,
      );
      return {
        ...doc,
        isValid: validation?.isValid ?? true,
        errorMessage: validation?.errorMessage ?? "",
      };
    });

  useEffect(() => {
    if (!industry_name) return;

    const requiredDocs = industies[industry_name] || [];

    // 1️⃣ Check missing documents (from extractionResults)
    const uploadedDocTypes = extractionResults.map((doc) => doc.fileType);

    const missingDocs = requiredDocs.filter(
      (reqDoc) => !uploadedDocTypes.includes(reqDoc),
    );

    if (missingDocs.length > 0) {
      setAllDocsValid(false);
      setResultsTitle(`Missing required documents: ${missingDocs.join(", ")}`);
      return;
    }

    // 2️⃣ Check invalid documents (from validationResults)
    const invalidDocs = validationResults.filter(
      (doc) => doc.isValid === false,
    );

    if (invalidDocs.length > 0) {
      setAllDocsValid(false);
      setResultsTitle(
        "Some documents were uploaded but failed validation. Please review and re-upload.",
      );
      return;
    }

    // 3️⃣ All good ✅
    setAllDocsValid(true);

    switch (industry_name) {
      case "Healthcare":
        setResultsTitle("Patient file has been successfully created.");
        break;
      case "Finance":
        setResultsTitle("User bank account has been successfully created.");
        break;
      case "Transportation":
        setResultsTitle("Car rental account has been successfully created.");
        break;
      case "Hospitality":
        setResultsTitle("Customer account has been successfully created.");
        break;
      default:
        setResultsTitle("All required documents are present.");
    }
  }, [industry_name, extractionResults, validationResults]);

  const handleCardClick = (doc, index) => {
    onOpenViewer({
      extractionResults: filteredResults,
      ClickedIndex: index,
    });
  };
  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToResults = () => {
    onOpenViewer({
      extractionResults: filteredResults,
      ClickedIndex: 0,
    });
  };

  const styles = {
    container: {
      position: "relative", // Needed for absolute positioning of the home button
      backgroundColor: "var(--color-midnight-black)",
      color: "#e0e0e0",
      minHeight: "100vh",
      padding: "40px",
      fontFamily: "Arial, sans-serif",
    },
    // --- Button is now positioned on the right ---
    homeButton: {
      position: "absolute",
      top: "40px",
      right: "40px", // Changed from 'left' to 'right'
      backgroundColor: "transparent",
      color: "#c0c0e0",
      border: "1px solid #5a5a8a",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    header: {
      textAlign: "center",
      // Padding ensures title doesn't overlap with the button
      paddingTop: "50px",
      marginBottom: "50px",
    },
    mainTitle: {
      fontSize: "3rem",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    titleHighlight: {
      background: "linear-gradient(to right, #ff8a00, #e52e71)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    subtitle: {
      fontSize: "1.2rem",
      color: "#b0b0b0",
    },
    resultsGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: "25px",
      justifyContent: "center", // keeps cards centered
      alignItems: "flex-start",
      width: "90%",
      maxWidth: "1600px",
      margin: "0 auto",
    },
    documentCard: {
      borderRadius: "12px",
      padding: "25px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      cursor: "pointer",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      minWidth: "350px", // <-- keeps the original card width
      maxWidth: "350px", // <-- optional: make all cards same width
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "20px",
    },
    filename: {
      fontSize: "1.2rem",
      fontWeight: "600",
      wordBreak: "break-word",
      marginRight: "15px",
    },
    statusIcon: {
      fontSize: "1.8rem",
      flexShrink: 0,
    },
    errorMessage: {
      // color: "#f3a9a9",
      fontSize: "0.95rem",
      marginTop: "15px",
      // backgroundColor: "rgba(255, 100, 100, 0.1)",
      padding: "10px",
      borderRadius: "6px",
    },
  };

  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const [isHomeButtonHovered, setIsHomeButtonHovered] = React.useState(false);

  const getCardStyle = (index) => {
    const style = { ...styles.documentCard };
    if (index === hoveredIndex) {
      style.transform = "translateY(-5px)";
      style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.4)";
    }
    return style;
  };

  const getHomeButtonStyle = () => {
    const style = { ...styles.homeButton };
    if (isHomeButtonHovered) {
      style.backgroundColor = "#3d3d5c";
      style.color = "#ffffff";
    }
    return style;
  };

  const StatusIcon = ({ isValid }) => (
    <span
      style={{ ...styles.statusIcon, color: isValid ? "#33d6a2" : "#ff6b6b" }}
    >
      {isValid ? <i className='pi pi-check'></i> : ""}
    </span>
  );

  return (
    <div style={styles.container}>
      {/* --- Home Page Button (Right Side) --- */}
      {/* <button
        style={getHomeButtonStyle()}
        onClick={handleGoHome}
        onMouseEnter={() => setIsHomeButtonHovered(true)}
        onMouseLeave={() => setIsHomeButtonHovered(false)}
      >
        Home Page
      </button> */}

      {/* homeButton: {
      position: "absolute",
      top: "40px",
      right: "40px", // Changed from 'left' to 'right'
      backgroundColor: "transparent",
      color: "#c0c0e0",
      border: "1px solid #5a5a8a",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "0.9rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "background-color 0.3s ease, color 0.3s ease",
    }, */}

      <header style={styles.header}>
        <h1 style={styles.mainTitle}>
          AI Document{" "}
          <span className='bg-gradient-to-r from-[var(--color-core-indigo)] to-[var(--color-signal-red)] bg-clip-text text-transparent'>
            Processing Results
          </span>
        </h1>
        <p style={styles.subtitle}>
          {/* Review the validation status of your uploaded documents below. */}
          {resultsTitle}
        </p>
      </header>

      <div style={styles.resultsGrid}>
        {filteredResults.map((doc, index) => (
          <div
            key={index}
            style={getCardStyle(index)}
            className='bg-white/5 border-white/10'
            onClick={() => handleCardClick(doc, index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* --- Card Header with filename and status icon --- */}
            <div
              style={{
                ...styles.cardHeader,
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <p style={styles.filename}>
                  {doc.fileType.split(/[/\\]/).pop()}
                </p>
                <StatusIcon isValid={doc.isValid} />
              </div>

              {/* --- Error message under filename if invalid --- */}
              {!doc.isValid && doc.errorMessage && (
                <p
                  style={styles.errorMessage}
                  className='bg-amber-700/50 text-white/70'
                >
                  <strong>Warning:</strong> {doc.errorMessage}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='flex justify-center mt-10 gap-6'>
        <button
          className='bg-transparent rounded-2xl p-6 text-[#c0c0e0] hover:text-white hover:bg-white/10 transition-all duration-300'
          style={{ border: "1px solid #FFFFFF33" }}
          onClick={handleGoHome}
        >
          Home Page
        </button>

        <button
          className='bg-(--color-core-indigo) rounded-2xl p-6 text-(--color-text-primary) hover:text-white hover:bg-(--color-core-indigo)/75 transition-all duration-300'
          onClick={handleGoToResults}
        >
          View Results
        </button>
      </div>
    </div>
  );
};

export default DocumentResults;
