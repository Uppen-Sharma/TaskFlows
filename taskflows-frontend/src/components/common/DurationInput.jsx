import React from "react";

const DurationInput = ({
  days,
  hours,
  minutes,
  setDays,
  setHours,
  setMinutes,
  error,
}) => {
  const handleFocus = (e) => e.target.select(); // select text on focus

  // base input styling
  const inputBaseClass =
    "w-full bg-transparent text-center font-mono text-3xl font-black text-white placeholder-white/10 focus:outline-none focus:text-cyan-400 transition-colors p-2";

  // label styling
  const labelClass =
    "text-[9px] font-bold text-white/30 uppercase tracking-widest text-center block -mt-1 pb-2";

  // separator styling
  const colonClass = "text-2xl text-white/20 font-black pb-6 select-none";

  return (
    <div
      className={`flex items-center justify-center bg-black/40 border rounded-2xl transition-all ${
        error
          ? "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          : "border-white/10 focus-within:border-cyan-500/50 focus-within:bg-black/60 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
      }`}
    >
      {/* days input */}
      <div className="flex-1">
        <input
          type="number"
          min="0"
          placeholder="00"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          onFocus={handleFocus}
          className={inputBaseClass}
        />
        <span className={labelClass}>Days</span>
      </div>

      <span className={colonClass}>:</span>

      {/* hours input */}
      <div className="flex-1">
        <input
          type="number"
          min="0"
          max="23"
          placeholder="00"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          onFocus={handleFocus}
          className={inputBaseClass}
        />
        <span className={labelClass}>Hrs</span>
      </div>

      <span className={colonClass}>:</span>

      {/* minutes input */}
      <div className="flex-1">
        <input
          type="number"
          min="0"
          max="59"
          placeholder="00"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          onFocus={handleFocus}
          className={inputBaseClass}
        />
        <span className={labelClass}>Mins</span>
      </div>
    </div>
  );
};

export default DurationInput;
