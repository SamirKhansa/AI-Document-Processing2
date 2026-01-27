import { useEffect, useState } from "react";

export default function LoadingSpinner() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        const next = prev + Math.random() * 15;
        return Math.min(next, 90);
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center gap-12 p-12 bg-transparent relative overflow-hidden">
      {/* Background Glow */}

      {/* AI Brain Animation */}

      {/* AI Processing Text */}
      <div className="flex flex-col gap-6 w-full max-w-sm text-center relative z-10">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white tracking-tight">
            AI Document Extraction
          </h3>
          <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">
            Processing Data Stream
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-4">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-4 flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              System Load: Optimized
            </span>
            <span className="text-xs font-black text-white tracking-tighter">
              {Math.round(progress)}%{" "}
              <span className="text-slate-500">COMPLETE</span>
            </span>
          </div>
        </div>

        {/* Processing Steps */}
        <div className="grid grid-cols-1 gap-3 mt-8 text-left">
          {[
            { threshold: 15, label: "Extracting Data" },
            { threshold: 35, label: "Structural Pattern Mapping" },
            { threshold: 65, label: "Deep Textual Extraction" },
            { threshold: 90, label: "Finalizing Integrity Check" },
          ].map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-700 ${
                progress > step.threshold
                  ? "bg-white/5 border-white/10 opacity-100 translate-x-0"
                  : "bg-transparent border-transparent opacity-20 -translate-x-4"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${
                  progress > step.threshold
                    ? "bg-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                    : "bg-white/5 text-slate-600"
                }`}
              >
                <i
                  className={`pi ${progress > step.threshold ? "pi-check" : "pi-spin pi-spinner"}`}
                ></i>
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${
                  progress > step.threshold
                    ? "text-slate-200"
                    : "text-slate-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
