import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { FileUpload } from "primereact/fileupload";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import "./PrimeReactFileUpload.css";

dayjs.extend(customParseFormat);

function isExpired(dateStr) {
  const date = dayjs(dateStr, ["YYYY-MM-DD", "DD/MM/YYYY", "DD MM YYYY"], true); // true = strict

  if (!date.isValid()) return null;

  return date.endOf("day").isBefore(dayjs());
}

export default forwardRef(function FileUploadComponent(
  { industry, requiredDocuments },
  ref,
) {
  const navigate = useNavigate();
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [modelsResults, setModelsResults] = useState([]); // format [{'filename': <str>, fileType: [Driving License, Passport, Insurance, QID], 'results': <obj>}]
  const [resultsValidation, setResultsValidation] = useState([]); // format: [{filename: <str>, fileType: <str>, isValid: <bool>, errorMessage: <str>}]
  const BASE_URL = "https://di-poc-qc-01.cognitiveservices.azure.com/";
  const API_KEY = "f3f1da1c9c2d428088145f053599e763";

  const [isLoading, setIsLoading] = useState(false);
  const models = [
    "driving-license-model-01",
    "Passport-model01",
    "Insurance-model-01",
    "QID_model_01",
  ];
  const composite_model_url =
    "https://di-poc-qc-01.cognitiveservices.azure.com//formrecognizer/documentModels/Composed_Custom_Extraction_Classification_model_01:analyze?api-version=2023-07-31";
  // const modelsPerDoc = [
  //   { "20140113_N8D0917+copy.jpg": "Passport-model01" },
  //   { "234788_thumb.jpg": "QID_model_01" },
  //   { "ICT CC - 2024.pdf": "Insurance-model-01" }, // no appropriate model
  //   { "ICT CR ENGLISH.pdf": "QID_model_01" }, //no appropriate model
  //   { "Passport-Biodata-page.png": "Passport-model01" },
  //   { "Passport.jpg": "Passport-model01" },
  //   { "Tax Card Sample.jpg": "driving-license-model-01" },
  // ];
  const fileUploadRef = useRef(null);
  const industry_name = industry;
  /////////////
  // Helper parsing functions
  ////////////
  const parsePassport = (results) => {
    const fields = results?.valueArray?.[0]?.valueObject ?? null;
    if (!fields) return {};
    const output = {
      Name: fields.Name.valueString,
      "Date f=of Birth": fields.DateofBirth.valueString,
      "Date of Expiry": fields.ExpiryDate.valueString,
      "Date of Issue": fields.DateofIssue.valueString,
      Nationality: fields.Nationality.valueString,
      "Passport No.": fields.PassportNo.valueString,
    };

    return output;
  };

  const parseInsurance = (results) => {
    const fields = results?.valueArray?.[0]?.valueObject ?? null;
    if (!fields) return {};
    const output = {
      Name: fields.Name.valueString,
      //DOB: fields.DOB.valueString,
      "Date of Expiry": fields["Expiry Date"].valueString,
      //"Date of Issue": fields["Date of Issue"].valueString,
      //"ID No.": fields["ID No."].valueString,
      "Insurance No.": fields["Insurance No."]?.valueString ?? "",
    };

    return output;
  };

  const parseDrivingLicense = (results) => {
    const fields = results?.valueArray?.[0]?.valueObject ?? null;
    if (!fields) return {};
    const output = {
      Name: fields.Name.valueString,
      QID: fields.QID?.valueString ?? "",
      Nationality: fields.Nationality.valueString,
      "Date of Birth": fields.DateofBirth.valueString,
      "Date of Expiry": fields.ExpiryDate.valueString,
    };
    return output;
  };

  const parseQID = (results) => {
    const fields = results?.valueArray?.[0]?.valueObject ?? null;
    if (!fields) return {};
    const output = {
      QID: fields.QID?.valueString ?? "",
      Name: fields.Name.valueString,
      Nationality: fields.Nationality?.valueString ?? "",
      "Date of Birth": fields.DateofBirth.valueString,
      "Date of Expiry": fields.ExpiryDate.valueString,
      Occupation: fields.Occupation?.valueString ?? "",
    };
    return output;
  };
  /* 
  Sample fields:
*/

  ////////////
  // Get model from File name
  //////////
  const getModelIdFromFileName = (fileName) => {
    for (const entry of modelsPerDoc) {
      const [key] = Object.keys(entry);

      if (key === fileName) {
        return entry[key];
      }
    }

    return null; // or "default-model" if you prefer
  };

  ///////////////
  // Add file to uploader
  ///////////////
  const addFileToUploaderInternal = async (filename) => {
    if (!fileUploadRef.current) return;

    try {
      // 1. Fetch file from public/sampleFiles
      const response = await fetch(`/sampleFiles/${filename}`);

      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }

      // 2. Convert to Blob
      const blob = await response.blob();

      // 3. Create a real File object
      const file = new File([blob], filename, {
        type: blob.type || "application/octet-stream",
        lastModified: Date.now(),
      });

      // 4. Inject into PrimeReact FileUpload
      // Use getFiles() if available, or try to manage state safely.
      // Assuming setFiles supports a callback or we access current files.
      // PrimeReact FileUpload ref usually exposes getFiles() and setFiles().

      const currentFiles = fileUploadRef.current.getFiles
        ? fileUploadRef.current.getFiles()
        : [];
      const isDuplicate = currentFiles.some(
        (f) => f.name === file.name && f.size === file.size,
      );

      if (isDuplicate) {
        console.warn(`File ${filename} is already in the list.`);
        return "duplicate";
      }

      fileUploadRef.current.setFiles([...currentFiles, file]);
      return "added";
    } catch (err) {
      console.error("Error adding file to uploader:", err);
      return "error";
    }
  };

  //////////////
  // Poll the results from the model
  ////////////
  const pollAnalyzeResult = async (operationLocation) => {
    while (true) {
      const response = await axios.get(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": API_KEY,
        },
      });

      const { status } = response.data;

      if (status === "succeeded") {
        return response.data;
      }

      if (status === "failed") {
        throw new Error("Analysis failed");
      }

      // still running → wait and poll again
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  };

  ///////////////
  // Custom uploader
  ///////////////
  const customUploader = async (event) => {
    const files = event.files;
    if (!files) return;
    setIsLoading(true);

    const collectedResults = [];
    const validationResults = [];
    for (const file of files) {
      try {
        // const model = getModelIdFromFileName(file.name);
        // const url = `${BASE_URL}/formrecognizer/documentModels/${model}:analyze?api-version=2023-07-31`;
        const arrayBuffer = await file.arrayBuffer();
        const response = await axios.post(composite_model_url, arrayBuffer, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": API_KEY,
          },
          validateStatus: (status) => status === 202,
        });

        const operationLocation = response.headers["operation-location"];
        const get_results = await pollAnalyzeResult(operationLocation);
        const doc_type = get_results.analyzeResult.documents[0].docType;
        let parsedResult = null;
        let fileType = null;

        if (doc_type === "passport") {
          parsedResult = parsePassport(
            get_results.analyzeResult.documents[0].fields.Passport,
          );
          fileType = "Passport";
        } else if (doc_type === "Qatar ID") {
          parsedResult = parseQID(
            get_results.analyzeResult.documents[0].fields.QID,
          );
          fileType = "QID";
        } else if (doc_type === "Insurance Card") {
          parsedResult = parseInsurance(
            get_results.analyzeResult.documents[0].fields["Insurance Card"],
          );
          fileType = "Insurance";
        } else if (doc_type === "Driving License") {
          parsedResult = parseDrivingLicense(
            get_results.analyzeResult.documents[0].fields.DrivingLicense,
          );
          fileType = "Driving License";
        }

        collectedResults.push({
          file: file,
          filename: file.name,
          fileType,
          results: parsedResult,
        });

        if (isExpired(parsedResult["Date of Expiry"])) {
          validationResults.push({
            filename: file.name,
            fileType,
            isValid: false,
            isExpired: true,
            errorMessage: "Document is expired",
          });
        } else {
          validationResults.push({
            filename: file.name,
            fileType,
            isValid: true,
            isExpired: false,
            errorMessage: "",
          });
        }
      } catch (error) {
        console.error(
          `Failed to process ${file.name}`,
          error.response?.data || error.message,
        );
      }
    }

    collectedResults.forEach((item) => {
      if (
        item.results &&
        Object.keys(item.results).length === 0 &&
        item.results.constructor === Object
      ) {
        item.results = { Error: "undefined" };
      }
    });

    setModelsResults(collectedResults);
    setResultsValidation(validationResults);

    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }

    //////////////////
    // To Samir: Just change the page name to yours. the validationResults are already being passed.
    ////////////////
    setIsLoading(false);

    navigate("/Results", {
      state: {
        extractionResults: collectedResults,
        validationResults: validationResults,
        industry_name: industry_name,
        requiredDocuments: requiredDocuments,
      },
    });
  };

  // -------------------
  // Upload page component
  // -------------------
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("Drop event triggered"); // Debug log
    const filename = e.dataTransfer.getData("filename");
    // console.log("Dropped filename:", filename); // Debug log
    if (filename) {
      addFileToUploaderInternal(filename);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy"; // Explicitly state that this is a valid drop target
  };

  // Assign internal function to ref
  useImperativeHandle(ref, () => ({
    addFileToUploader: addFileToUploaderInternal,
  }));

  const uploadComponent = () => (
    <div
      id='drop-zone-container'
      className='flex flex-col w-full min-h-full justify-start sm:justify-center items-center p-4 sm:p-8 pt-10 sm:pt-8'
      onDropCapture={handleDrop}
      onDragOverCapture={handleDragOver}
    >
      <div className='flex flex-col items-center justify-center mb-6'>
        <h1 className='text-xl sm:text-3xl md:text-4xl font-bold mb-2 text-center'>
          <span className='text-3xl sm:text-5xl bg-gradient-to-r from-(--color-core-indigo) to-(--color-signal-red) bg-clip-text text-transparent'>
            {industry_name}
          </span>
        </h1>
        <p className='text-base text-[var(--color-text-secondary)] text-center max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl leading-relaxed'>
          Upload the required documents easily and extract Fields with precision
          using our advanced OCR technology powered by artificial intelligence.
        </p>
      </div>

      <div className='flex-1 w-full lg:w-3/4 h-full p-2'>
        <FileUpload
          ref={fileUploadRef}
          className='w-full h-full'
          name='files'
          mode='advanced'
          multiple
          accept='image/*,application/pdf'
          maxFileSize={50000000}
          customUpload
          uploadHandler={customUploader}
          itemTemplate={(file, props) => {
            // Get the file extension in lowercase
            const extension = file.name.split(".").pop()?.toLowerCase();

            // Decide icon class
            let iconClass = "pi pi-file"; // Default icon
            if (extension === "pdf") {
              iconClass = "pi pi-file-pdf"; // PDF icon
            } else if (
              ["png", "jpg", "jpeg", "gif", "bmp", "webp"].includes(extension)
            ) {
              iconClass = "pi pi-image"; // Image icon
            }

            return (
              <div className='flex flex-row justify-between items-center w-full'>
                <div className='flex flex-row justify-start items-center'>
                  {/* Icon */}
                  <i
                    className={`${iconClass} mr-3 text-[var(--color-electric-blue)]`}
                    style={{ fontSize: "20px" }}
                  ></i>

                  {/* File name */}
                  <div className='flex flex-col text-[var(--color-text-primary)] items-start justify-center'>
                    <p>{file.name.split("/").pop()}</p>
                    <p className='text-xs text-[var(--color-text-secondary)]'>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>

                {/* Remove button */}
                <div className='flex flex-row justify-end items-center'>
                  <Button
                    icon='pi pi-times'
                    className='p-button-text p-button-danger'
                    style={{
                      width: "100%",
                      height: "100%",
                      minWidth: "30px",
                      minHeight: "30px",
                      borderRadius: "100%",
                    }}
                    onClick={() => props.onRemove(file)}
                  />
                </div>
              </div>
            );
          }}
          /////////////
          // Empty Template
          //////////////
          emptyTemplate={
            <div
              className='flex flex-col h-full w-full md:min-h-[275px] items-center justify-center text-center relative overflow-hidden rounded-xl border-2 border-dashed border-[var(--color-violet-blue)] p-4'
              style={{
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
              }}
            >
              <div className='absolute top-2 right-2 mb-3 md:mb-0 bg-gradient-to-r from-[var(--color-core-indigo)] to-[var(--color-signal-red)] text-white px-3 py-1.5 rounded-lg text-xs font-semibold'>
                AI Powered
              </div>
              <i
                className='pi pi-upload font-bold text-4xl sm:text-5xl md:text-6xl mb-4 '
                style={{
                  fontSize: "28px",
                  background:
                    "linear-gradient(135deg, #370fdd 0%, #ff2a68 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              />
              <div className='text-lg font-semibold text-[var(--color-violet-blue)] mb-2'>
                Drag and drop files here to upload
              </div>
              <div className='text-base font-normal text-gray-500 mt-2'>
                Accepted formats: images and PDFs. Max size per file: 50MB.
              </div>
            </div>
          }
        />
      </div>
    </div>
  );

  return <>{isLoading ? <LoadingSpinner /> : uploadComponent()}</>;
});
