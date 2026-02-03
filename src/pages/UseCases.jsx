import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BrainCircuit,
  ShieldCheck,
  UserCircle,
  Bot,
} from "lucide-react";

/**
 * UseCases Page - Displays 3 core business use cases with interactive cards.
 */
const UseCases = () => {
  const navigate = useNavigate();

  // Helper functions for each card's redirection logic
  const handleDocIQClick = () => {
    console.log("Navigating to DocIQ App...");
    // window.open(
    //   "https://api-frontend-qc-01-b5hcdkguawepeecs.qatarcentral-01.azurewebsites.net/",
    //   "_blank",
    //   "noopener,noreferrer",
    // );
    navigate("/doc-iq");
  };

  // const handleAIAnalysisClick = () => {
  //   console.log("Navigating to AI Analysis App...");
  //   window.open(
  //     "https://api-frontend-qc-01-b5hcdkguawepeecs.qatarcentral-01.azurewebsites.net/",
  //     "_blank",
  //     "noopener,noreferrer",
  //   );
  // };

  const handleSalesAvatarClick = () => {
    console.log("Navigating to Sales Avatar App...");
    window.location.href =
      "https://as-ict-avatar-sw-bmfrenfja4bpa3a9.swedencentral-01.azurewebsites.net/";

    // navigate("/doc-iq");
  };

  const handleInSightClick = () => {
    console.log("Navigating to (In)Sight App...");
    window.location.href =
      "https://websitewebsummit.blob.core.windows.net/demos/(In)Sight%20Product%20Overview%20Video.mp4";

    // navigate("/doc-iq");
  };

  const useCaseCards = [
    {
      title: "DocIQ",
      description:
        "Automate the extraction of data from passports, IDs, and other documents with high accuracy.",
      icon: <FileText className='w-8 h-8' />,
      onClick: handleDocIQClick,
      // Using project theme colors for distinct hover effects
      hoverStyles:
        "hover:bg-[var(--color-electric-blue)]/20 hover:border-[var(--color-electric-blue)]/50",
      accentColor: "text-[var(--color-electric-blue)]",
      iconBg: "bg-[var(--color-electric-blue)]/10",
    },
    {
      title: "Sales Avatar",
      description:
        "Automate customer conversations, qualify leads, and drive sales with an intelligent AI sales avatar.",
      icon: <Bot className='w-8 h-8' />,
      onClick: handleSalesAvatarClick,
      hoverStyles:
        "hover:bg-[var(--color-violet-blue)]/20 hover:border-[var(--color-violet-blue)]/50",
      accentColor: "text-[var(--color-violet-blue)]",
      iconBg: "bg-[var(--color-violet-blue)]/10",
    },
    {
      title: "(In)Sight",
      description:
        "AI-Powered executive product that improves the quality and speed of organization decision making before during and after meetings",
      icon: <BrainCircuit className='w-8 h-8' />,
      onClick: handleInSightClick,
      hoverStyles:
        "hover:bg-[var(--color-magenta)]/20 hover:border-[var(--color-magenta)]/50",
      accentColor: "text-[var(--color-magenta)]",
      iconBg: "bg-[var(--color-magenta)]/10",
    },
  ];

  return (
    <div className='min-h-screen bg-(--color-midnight-black) text-white relative overflow-hidden flex flex-col justify-center items-center px-6 py-20'>
      {/* Dynamic background glow effects */}
      <div className='absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-(--color-core-indigo)/10 blur-[120px] rounded-full' />
      <div className='absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-(--color-magenta)/10 blur-[120px] rounded-full' />

      <div className='relative z-10 max-w-6xl w-full'>
        <div className='text-center mb-16'>
          <h1
            className=' font-bold mb-6 tracking-tight'
            style={{ fontSize: "3rem" }}
          >
            Precision{" "}
            <span className='bg-[linear-gradient(90deg,var(--color-electric-blue),var(--color-violet-blue),var(--color-magenta),var(--color-digital-orange))] bg-clip-text text-transparent'>
              AI Solutions
            </span>
          </h1>
          <p className='text-(--color-text-secondary) text-lg md:text-xl max-w-2xl mx-auto'>
            Explore the power of AI in transforming manual workflows into
            automated excellence across multiple domains.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 '>
          {useCaseCards.map((card, index) => (
            <div
              key={index}
              onClick={card.onClick}
              className={`
                group cursor-pointer relative p-8 rounded-3xl
                bg-white/5 backdrop-blur-xl border border-white/10
                transition-all duration-500 ease-out flex flex-col items-start
                transform hover:-translate-y-4 hover:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.6)]
                ${card.hoverStyles}
              `}
            >
              {/* Icon Container */}
              <div
                className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-8 
                transition-all duration-500 group-hover:scale-110 
                ${card.iconBg} ${card.accentColor}
              `}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h3 className='text-2xl font-bold mb-4 transition-colors duration-300 group-hover:text-white'>
                {card.title}
              </h3>

              {/* Description */}
              <p className='text-gray-400 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed mb-8'>
                {card.description}
              </p>

              {/* Action Link */}
              <div
                className={`mt-auto flex items-center gap-2 font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0 ${card.accentColor}`}
              >
                Get Started <span className='text-xl'>→</span>
              </div>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 h-[1px] bg-linear-to-r from-transparent via-current to-transparent w-full scale-x-0 group-hover:scale-x-75 transition-transform duration-700 ${card.accentColor}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UseCases;
