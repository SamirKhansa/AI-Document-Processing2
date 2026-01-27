import React, { useEffect, useState, useRef } from "react";

const FilePreview = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Create object URL or read text content
  useEffect(() => {
    if (!file) return;

    const type = file.type;

    if (type.startsWith("image/") || type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (type.startsWith("text/") || type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => setTextContent(e.target.result);
      reader.readAsText(file);
      return;
    }

    setPreviewUrl(null);
  }, [file]);

  if (!file) return <p className="text-gray-500">No file to preview.</p>;

  const type = file.type;
  const containerHeight = "calc(100vh - 120px)"; // full viewport minus header/footer

  // --------------------------
  // IMAGE PREVIEW
  // --------------------------
  if (type.startsWith("image/")) {
    const handleDoubleClick = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      if (!zoomed) {
        const originX = (clickX / rect.width) * 100;
        const originY = (clickY / rect.height) * 100;
        imgRef.current.style.transformOrigin = `${originX}% ${originY}%`;
        setZoomed(true);
      } else {
        setZoomed(false);
        setPosition({ x: 0, y: 0 });
      }
    };

    const handleMouseDown = (e) => {
      if (!zoomed) return;
      setDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
      if (!zoomed || !dragging) return;
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    };

    const handleMouseUp = () => setDragging(false);

    return (
      <div
        ref={containerRef}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: containerHeight }}
      >
        <img
          ref={imgRef}
          src={previewUrl}
          alt="preview"
          className="w-full h-full object-contain select-none pointer-events-none transition-transform duration-200"
          style={{
            transform: zoomed
              ? `scale(2) translate(${position.x / 2}px, ${position.y / 2}px)`
              : "scale(1) translate(0,0)",
          }}
        />
      </div>
    );
  }

  // --------------------------
  // PDF PREVIEW
  // --------------------------
  if (type === "application/pdf") {
    return (
      <div
        className="w-full overflow-hidden border border-gray-300"
        style={{ height: containerHeight }}
      >
        <iframe
          src={previewUrl}
          title="PDF Preview"
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // --------------------------
  // TEXT PREVIEW
  // --------------------------
  if (type.startsWith("text/") || type === "application/json") {
    return (
      <div
        className="w-full overflow-auto p-4 border border-gray-300 bg-gray-100 whitespace-pre-wrap"
        style={{ height: containerHeight }}
      >
        {textContent}
      </div>
    );
  }

  // --------------------------
  // FALLBACK / DOWNLOAD
  // --------------------------
  if (previewUrl) {
    return (
      <div className="text-gray-700">
        <p>Preview not supported. You can download the file:</p>
        <a
          href={previewUrl}
          download={file.name}
          className="text-blue-600 underline"
        >
          Download {file.name}
        </a>
      </div>
    );
  }

  return (
    <p className="text-gray-500">Preview not available for this file type.</p>
  );
};

export default FilePreview;
