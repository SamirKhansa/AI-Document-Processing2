import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FileUploadComponent from "../components/FileUploadComponent";

// const sampleFiles = [
//   "20140113_N8D0917+copy.jpg",
//   "234788_thumb.jpg",
//   "ICT CC - 2024.pdf",
//   "ICT CR ENGLISH.pdf",
//   "Passport-Biodata-page.png",
//   "Passport.jpg",
//   "Tax Card Sample.jpg",
// ];

export default function FileUploadPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const uploaderRef = useRef(null);
  const [draggedFile, setDraggedFile] = useState(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [samplePassports, setSamplePassports] = useState([]);
  const [sampleQids, setSampleQids] = useState([]);
  const [sampleDrivingLicenses, setSampleDrivingLicenses] = useState([]);
  const [sampleInsuranceCards, setSampleInsuranceCards] = useState([]);

  // Extract industry from navigation state, default to "General"
  const industry = location.state?.industry || "General";

  // Define required documents for each industry
  const industryDocuments = {
    Healthcare: [
      { name: "QID", icon: "pi-id-card" },
      { name: "Insurance Card", icon: "pi-shield" },
    ],
    Finance: [
      { name: "QID", icon: "pi-id-card" },
      { name: "Passport", icon: "pi-book" },
    ],
    Transportation: [
      { name: "QID", icon: "pi-id-card" },
      { name: "Driving License", icon: "pi-car" },
    ],
    Hospitality: [
      { name: "Passport", icon: "pi-book" },
      { name: "QID", icon: "pi-id-card" },
      { name: "Driving License", icon: "pi-car" },
    ],
    General: [
      { name: "QID", icon: "pi-id-card" },
      { name: "Driving License", icon: "pi-car" },
      { name: "Passport", icon: "pi-book" },
      { name: "Insurance Card", icon: "pi-shield" },
    ],
  };

  const requiredDocuments =
    industryDocuments[industry] || industryDocuments.General;

  useEffect(() => {
    // Grab all files in public/sampleFiles
    const passports = import.meta.glob("/public/sampleFiles/passports/*");
    const qids = import.meta.glob("/public/sampleFiles/qid/*");
    const drivingLicenses = import.meta.glob(
      "/public/sampleFiles/drivingLicense/*",
    );
    const insuranceCards = import.meta.glob("/public/sampleFiles/insurance/*");

    // Extract file names with their subfolder paths
    const passportFiles = Object.keys(passports).map((path) => ({
      name: path.split("/").pop(),
      path: "passports/" + path.split("/").pop(),
    }));
    const qidFiles = Object.keys(qids).map((path) => ({
      name: path.split("/").pop(),
      path: "qid/" + path.split("/").pop(),
    }));
    const drivingLicenseFiles = Object.keys(drivingLicenses).map((path) => ({
      name: path.split("/").pop(),
      path: "drivingLicense/" + path.split("/").pop(),
    }));
    const insuranceCardFiles = Object.keys(insuranceCards).map((path) => ({
      name: path.split("/").pop(),
      path: "insurance/" + path.split("/").pop(),
    }));

    setSamplePassports(passportFiles);
    setSampleQids(qidFiles);
    setSampleDrivingLicenses(drivingLicenseFiles);
    setSampleInsuranceCards(insuranceCardFiles);
  }, []);

  const handleTouchStart = (e, fileName) => {
    const touch = e.touches[0];
    setDraggedFile(fileName);
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;

    // Check if dropped on designated drop zone
    const touch = e.changedTouches[0];
    const dropZone = document.getElementById("drop-zone-container");

    if (dropZone) {
      const rect = dropZone.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        if (uploaderRef.current) {
          uploaderRef.current.addFileToUploader(draggedFile);
        }
      }
    }

    setIsDragging(false);
    setDraggedFile(null);
  };

  const mapSampleFiles = (document_type, key) => {
    switch (document_type) {
      case "Passport":
        return (
          <div key={key}>
            <h2 className='text-lg font-bold text-(--color-text-secondary) mb-4'>
              Passports
            </h2>
            {samplePassports.map((file, index) => (
              <div
                key={index}
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-[var(--color-core-indigo)]'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => {
                  if (uploaderRef.current) {
                    uploaderRef.current.addFileToUploader(file.path);
                  }
                }}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-[var(--color-signal-red)]" : "pi-image text-[var(--color-electric-blue)]"} text-2xl`}
                  ></i>
                  <span
                    className='text-sm text-gray-200 truncate'
                    title={file.name}
                  >
                    {file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      case "QID":
        return (
          <div key={key}>
            <h2 className='text-lg font-bold text-(--color-text-secondary) mb-4'>
              QIDs
            </h2>
            {sampleQids.map((file, index) => (
              <div
                key={index}
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-[var(--color-core-indigo)]'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => {
                  if (uploaderRef.current) {
                    uploaderRef.current.addFileToUploader(file.path);
                  }
                }}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-[var(--color-signal-red)]" : "pi-image text-[var(--color-electric-blue)]"} text-2xl`}
                  ></i>
                  <span
                    className='text-sm text-gray-200 truncate'
                    title={file.name}
                  >
                    {file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      case "Driving License":
        return (
          <div key={key}>
            <h2 className='text-lg font-bold text-(--color-text-secondary) mb-4'>
              Driving Licenses
            </h2>
            {sampleDrivingLicenses.map((file, index) => (
              <div
                key={index}
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-[var(--color-core-indigo)]'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => {
                  if (uploaderRef.current) {
                    uploaderRef.current.addFileToUploader(file.path);
                  }
                }}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-[var(--color-signal-red)]" : "pi-image text-[var(--color-electric-blue)]"} text-2xl`}
                  ></i>
                  <span
                    className='text-sm text-gray-200 truncate'
                    title={file.name}
                  >
                    {file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      case "Insurance Card":
        return (
          <div key={key}>
            <h2 className='text-lg font-bold text-(--color-text-secondary) mb-4'>
              Insurance Cards
            </h2>
            {sampleInsuranceCards.map((file, index) => (
              <div
                key={index}
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-[var(--color-core-indigo)]'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => {
                  if (uploaderRef.current) {
                    uploaderRef.current.addFileToUploader(file.path);
                  }
                }}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-[var(--color-signal-red)]" : "pi-image text-[var(--color-electric-blue)]"} text-2xl`}
                  ></i>
                  <span
                    className='text-sm text-gray-200 truncate'
                    title={file.name}
                  >
                    {file.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return [];
    }
  };

  return (
    <div
      className='flex flex-row h-screen w-screen relative overflow-hidden'
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className='w-full sm:w-1/4 h-full border-r border-indigo-500/30 flex flex-col'>
        <div className='flex-1 overflow-y-auto p-4'>
          <h2 className='text-xl font-bold text-white mb-4'>Sample Files</h2>
          <div className='grid grid-cols-1 gap-4'>
            {requiredDocuments.map((docType, index) =>
              mapSampleFiles(docType.name, index),
            )}
          </div>
        </div>
        <div className='p-4 border-indigo-500/30'>
          <button
            onClick={() => navigate("/")}
            className='w-full py-3 px-4 bg-[var(--color-core-indigo)] hover:bg-[var(--color-violet-blue)] text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold'
          >
            <i className='pi pi-home'></i>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
      <div className='hidden sm:flex sm:w-3/4 h-full overflow-hidden pl-5 pr-5 pt-2 pb-2 flex-col'>
        {/* Industry Indicator Section */}
        <div className='mb-2 pr-5 pt-5  rounded-xl border-transparent backdrop-blur'>
          <div className='flex items-center justify-end flex-wrap gap-4'>
            <div className='flex flex-wrap gap-2'>
              {requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[var(--color-violet-blue)]/50 transition-all'
                >
                  <i
                    className={`pi ${doc.icon} text-[var(--color-electric-blue)]`}
                  ></i>
                  <span className='text-sm text-gray-300'>{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload Component */}
        <div className='flex-1 overflow-hidden'>
          <FileUploadComponent
            ref={uploaderRef}
            industry={industry}
            requiredDocuments={industryDocuments}
          />
        </div>
      </div>
      {isDragging && draggedFile && (
        <div
          style={{
            position: "fixed",
            left: touchPosition.x,
            top: touchPosition.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className='p-3 bg-gray-800/90 rounded-lg border border-indigo-500 shadow-xl'
        >
          <div className='flex items-center gap-3'>
            <i
              className={`pi ${draggedFile.endsWith(".pdf") ? "pi-file-pdf text-red-500" : "pi-image text-indigo-500"} text-2xl`}
            ></i>
            <span className='text-sm text-gray-200 font-medium'>
              {draggedFile}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
