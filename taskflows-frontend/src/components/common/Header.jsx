import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);

  // handle user logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  if (!currentUser) return null;

  return (
    <header
      className="flex justify-between items-center py-4 px-6 md:px-12 
					w-full sticky top-0 z-30 
					text-white backdrop-blur-lg border-b border-white/10 
					bg-linear-to-r from-gray-700/20 via-gray-600/10 to-gray-700/20 
					shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300"
    >
      {/* left section */}
      <div className="flex items-center gap-6">
        <span
          onClick={() => navigate("/")}
          className="relative text-2xl md:text-3xl font-extrabold tracking-wide 
					bg-linear-to-r from-gray-600 via-gray-400 to-white 
					bg-clip-text text-transparent 
					drop-shadow-[0_0_8px_rgba(100,100,100,0.4)] 
					hover:drop-shadow-[0_0_12px_rgba(150,150,150,0.6)]
					transition-all duration-500 cursor-pointer select-none"
        >
          Task<span className="text-white/80">Flows</span>
        </span>
        <div className="hidden md:block h-6 w-px bg-white/20"></div>
        {/* greeting text */}
        <div
          className="text-sm md:text-base font-medium text-white/90 
						tracking-wide animate-fadeIn"
        >
          Welcome,&nbsp;
          <span className="font-semibold text-gray-300">
            {currentUser.name}
          </span>
          &nbsp;
          <span className="text-white/70 text-sm">({currentUser.role})</span>
        </div>
      </div>
      {/* right section logout button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 
					bg-red-500/50 hover:bg-linear-to-r hover:from-red-600 hover:to-red-700 
					text-white font-semibold py-2 px-4 rounded-xl 
					transition-all duration-300 shadow-md hover:shadow-lg 
					hover:scale-105 active:scale-95 text-sm border border-red-400/30"
        >
          <FaSignOutAlt className="text-sm" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
