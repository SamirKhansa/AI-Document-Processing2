import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-full text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="relative flex justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b border-white/10">
        {/* Subtle background blurs */}
        <div className="pointer-events-none absolute top-[-60%] right-[-20%] w-[300px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute bottom-[-60%] left-[-20%] w-[300px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full" />

        {/* Title */}
        <h1 className="relative z-10 flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
          <span className="text-white">Smart</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            Document Hub
          </span>
        </h1>
      </header>

      {/* Main content */}
      <main className="relative flex-1 min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;
