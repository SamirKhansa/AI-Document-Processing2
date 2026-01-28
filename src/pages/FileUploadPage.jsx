import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toast } from "primereact/toast";
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
  const touchTimerRef = useRef(null);
  const toast = useRef(null);

  const [showSamplesOnMobile, setShowSamplesOnMobile] = useState(false);
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
    // console.log("requiredDocuments", requiredDocuments);
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

  // Reset mobile samples overlay on window resize to avoid desktop glitches
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setShowSamplesOnMobile(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTouchStart = (e, fileName) => {
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    // Clear any existing timer just in case
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

    // Set a timer to start the drag after 500ms (the threshold)
    touchTimerRef.current = setTimeout(() => {
      setDraggedFile(fileName);
      setTouchPosition({ x: clientX, y: clientY });
      setIsDragging(true);
    }, 500); // 500ms threshold
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    if (!isDragging) {
      // If we move too much before the timer fires, cancel the drag (assume user is scrolling)
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
      return;
    }

    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    // Clear the timer if it hasn't fired yet
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

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

  const handleSampleClick = async (file) => {
    if (uploaderRef.current) {
      const status = await uploaderRef.current.addFileToUploader(file.path);

      if (status === "added") {
        toast.current?.show({
          severity: "success",
          summary: "File Added",
          detail: `${file.name} added to upload`,
          life: 2000,
        });
      } else if (status === "duplicate") {
        toast.current?.show({
          severity: "warn",
          summary: "Already Added",
          detail: `${file.name} is already in the list`,
          life: 2000,
        });
      } else if (status === "error") {
        toast.current?.show({
          severity: "error",
          summary: "Upload Error",
          detail: `Failed to add ${file.name}`,
          life: 3000,
        });
      }
    }
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
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-(--color-core-indigo)'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => handleSampleClick(file)}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-(--color-signal-red)" : "pi-image text-(--color-electric-blue)"} text-2xl`}
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
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-(--color-core-indigo)'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => handleSampleClick(file)}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-(--color-signal-red)" : "pi-image text-(--color-electric-blue)"} text-2xl`}
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
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-(--color-core-indigo)'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => handleSampleClick(file)}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-(--color-signal-red)" : "pi-image text-(--color-electric-blue)"} text-2xl`}
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
                className='p-3 mb-2 bg-white/5 rounded-lg cursor-grab hover:bg-gray-800 transition-colors border border-gray-700 hover:border-(--color-core-indigo)'
                draggable='true'
                style={{ touchAction: "none" }}
                onDragStart={(e) => {
                  console.log("Drag started:", file.path);
                  e.dataTransfer.setData("filename", file.path);
                }}
                onTouchStart={(e) => handleTouchStart(e, file.path)}
                onClick={() => handleSampleClick(file)}
              >
                <div className='flex items-center gap-3'>
                  <i
                    className={`pi ${file.name.endsWith(".pdf") ? "pi-file-pdf text-(--color-signal-red)" : "pi-image text-(--color-electric-blue)"} text-2xl`}
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
      className='flex flex-col sm:flex-row h-screen w-screen relative overflow-hidden'
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Toast ref={toast} position='bottom-center' />
      <div
        className={`flex flex-col border-indigo-500/30 transition-all duration-300 ${
          showSamplesOnMobile
            ? "fixed inset-0 z-50 bg-(--color-midnight-black) w-full h-full"
            : "hidden sm:flex sm:w-1/4 h-full sm:border-r"
        }`}
      >
        <div className='flex items-center justify-end p-4 sm:hidden'>
          <button
            onClick={() => setShowSamplesOnMobile(false)}
            className='text-white p-2 '
          >
            <i className='pi pi-times'></i>
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-4'>
          <h2 className='text-xl font-bold text-white mb-4'>Sample Files</h2>
          <div className='grid grid-cols-1 gap-4'>
            {requiredDocuments.map((docType, index) =>
              mapSampleFiles(docType.name, index),
            )}
          </div>
        </div>
        <div className='p-4 border-indigo-500/30 hidden sm:block'>
          <button
            onClick={() => navigate("/")}
            className='w-full py-3 px-4 bg-(--color-core-indigo) hover:bg-(--color-core-indigo)/75 text-white rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold'
          >
            <i className='pi pi-home'></i>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
      <div className='flex w-full sm:w-3/4 h-full overflow-y-auto pl-4 pr-4 sm:pl-5 sm:pr-5 pt-2 pb-2 flex-col relative'>
        {/* Mobile Toggle Button */}
        <div className='flex sm:hidden justify-between items-center p-4'>
          <button onClick={() => navigate("/")} className='p-2 text-white'>
            <i className='pi pi-chevron-left'></i>
          </button>
          <button
            onClick={() => setShowSamplesOnMobile(true)}
            className='px-4 py-2 bg-white/10 rounded-full text-xs font-semibold text-white border border-white/20'
          >
            <i className='pi pi-file mr-2'></i>
            Try Sample Files
          </button>
        </div>
        {/* Industry Indicator Section */}
        <div className='mb-2 pr-5 pt-5  rounded-xl border-transparent backdrop-blur'>
          <div className='flex items-center justify-end flex-wrap gap-4'>
            <div className='flex flex-wrap gap-2'>
              {requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className='flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-(--color-violet-blue)/50 transition-all'
                >
                  <i
                    className={`pi ${doc.icon} text-(--color-electric-blue)`}
                  ></i>
                  <span className='text-sm text-gray-300'>{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload Component */}
        <div className='flex-1'>
          <FileUploadComponent
            ref={uploaderRef}
            industry={industry}
            requiredDocuments={requiredDocuments}
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
