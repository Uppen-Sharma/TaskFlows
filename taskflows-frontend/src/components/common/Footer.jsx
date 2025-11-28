import React, { useState, useEffect } from "react";
import { FaRegCopyright, FaClock, FaHeart, FaLaptopCode } from "react-icons/fa";

const Footer = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // update time every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  // formatted time string
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // current year value
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="flex flex-col sm:flex-row justify-between items-center py-3 px-6 md:px-12 
			bg-linear-to-r from-gray-700/20 via-gray-600/10 to-gray-700/20
			text-white/90 
            shadow-[0_-4px_20px_rgba(0,0,0,0.25)] 
			w-full z-20 transition-all duration-300 space-y-3 sm:space-y-0 
			backdrop-blur-lg border-t border-white/10"
    >
      {/* left section content */}
      <div className="flex flex-col sm:flex-row items-center gap-3 text-xs md:text-sm">
        <span className="flex items-center font-medium text-white/70">
          <FaRegCopyright className="mr-1.5 w-3 h-3 text-white/50" />
          {currentYear} TaskFlows
        </span>

        <span className="hidden sm:inline text-white/30 text-xs">|</span>

        <span className="flex items-center font-medium text-white/80">
          <FaLaptopCode className="mr-1.5 w-3 h-3 text-gray-400" />
          <span className="hidden md:inline">Built with Care</span>
          <span className="inline md:hidden">v1.0.0</span>
        </span>

        {/* small info badge */}
        <span
          className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full 
						bg-white/10 
						border border-white/10 text-xs font-medium text-white/80 
						shadow-sm backdrop-blur-sm transition-all duration-300"
        >
          <FaHeart className="w-3.5 h-3.5 text-gray-400" />
          <span className="italic tracking-wide">
            Built with <span className="text-gray-300 font-semibold">Care</span>{" "}
            & Clean Code
          </span>
        </span>
      </div>

      {/* live time section */}
      <div
        className="flex items-center font-mono text-sm bg-white/10 px-4 py-2 rounded-lg 
						border border-white/20 shadow-inner"
      >
        <FaClock className="mr-2 w-4 h-4 text-gray-300" />
        <span className="font-semibold">{formattedTime}</span>
      </div>
    </footer>
  );
};

export default Footer;
