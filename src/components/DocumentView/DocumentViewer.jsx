import React, { useState } from "react";
import FilePreview from "../FilePreview";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Database,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";

const DocumentViewer = ({
  uploadedDocs,
  currentIndex,
  onOpenViewer,
  setCurrentIndex,
  showPrev = true,
  showNext = true,
}) => {
  const currentDoc = uploadedDocs?.[currentIndex];
  const navigate = useNavigate();

  if (!uploadedDocs || uploadedDocs.length === 0) {
    return (
      <div className='flex items-center justify-center h-full bg-[var(--color-midnight-black)]'>
        <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl'>
          <FileText className='w-16 h-16 text-white/30 mx-auto mb-4' />
          <h2 className='text-xl font-semibold text-white'>
            No documents available
          </h2>
          <p className='text-white/60 mt-2'>Upload a document to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen bg-[var(--color-midnight-black)] text-white'>
      {/* HEADER */}
      <header className='px-4 sm:px-6 py-4 border-b border-white/10 backdrop-blur-xl'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
          <div className='truncate'>
            <h1 className='text-lg sm:text-xl font-bold truncate py-1'>
              {currentDoc?.filename || "Untitled"}
              <span className='text-(--color-violet-blue) ml-2'>
                #{currentIndex + 1}
              </span>
              <span className='text-(--color-text-secondary) text-sm ml-2'>
                / {uploadedDocs.length}
              </span>
            </h1>
          </div>

          <div className='flex gap-2'>
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              disabled={!showPrev}
              className='p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40'
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={!showNext}
              className='p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40'
            >
              <ChevronRight />
            </button>
            <button
              onClick={() => onOpenViewer?.(null)}
              className='px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2'
            >
              <FileText size={16} />
              Results
            </button>
            <button
              onClick={() => navigate("/")}
              className='ml-2 px-4 py-2 rounded-xl bg-(--color-core-indigo) hover:bg-(--color-core-indigo)/75 flex items-center gap-2'
            >
              <i className='pi pi-home'></i>
              Home Page
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className='flex flex-col lg:flex-row flex-1 gap-4 p-4 sm:p-6 overflow-hidden'>
        {/* PREVIEW */}
        <div className='flex flex-col flex-1 border border-white/10 rounded-3xl shadow-xl overflow-hidden'>
          <div className='flex-1 flex items-center justify-center p-4 overflow-hidden'>
            {currentDoc?.file ? (
              <FilePreview file={currentDoc.file} />
            ) : (
              <p className='text-white/40'>No preview available</p>
            )}
          </div>
        </div>

        {/* DATA PANEL */}
        <div className='w-full lg:w-[420px] border border-white/10 rounded-3xl shadow-xl overflow-hidden flex flex-col'>
          <div className='px-4 py-3 border-b border-white/10 flex items-center gap-2 text-white/70'>
            <Database size={18} />
            AI Extraction
          </div>

          <div className='p-4 overflow-y-auto flex-1'>
            {currentDoc?.isProcessing ? (
              <div className='flex flex-col items-center justify-center h-full gap-3'>
                <Loader2
                  className='animate-spin text-[var(--color-electric-blue)]'
                  size={28}
                />
                <p className='text-white/60'>Processing document…</p>
              </div>
            ) : currentDoc?.invalidDocumentError ? (
              <div className='text-center space-y-3'>
                <AlertCircle
                  className='mx-auto text-[var(--color-signal-red)]'
                  size={36}
                />
                <h3 className='font-semibold'>Invalid Document</h3>
                <p className='text-white/60 text-sm'>
                  Structural inconsistencies detected.
                </p>
              </div>
            ) : currentDoc?.extractedData ? (
              <div className='space-y-3'>
                {Object.entries(currentDoc.extractedData).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className='bg-white/10 rounded-xl p-4 hover:bg-white/15 transition break-words'
                    >
                      <p className='text-xs text-white/50'>{key}</p>
                      <p className='font-semibold'>{String(value)}</p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center h-full text-white/40'>
                <Database size={28} />
                Awaiting data…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
