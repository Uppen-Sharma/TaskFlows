// Converts total minutes into a readable duration string
export const formatMinutesToTime = (totalMinutes) => {
  if (totalMinutes === null || totalMinutes === undefined) return "0m";

  // Check for negative duration and get absolute value
  const isNegative = totalMinutes < 0;
  const absoluteMinutes = Math.abs(totalMinutes);

  // Calculate days, hours, and remaining minutes
  const days = Math.floor(absoluteMinutes / 1440);
  const hours = Math.floor((absoluteMinutes % 1440) / 60);
  const minutes = absoluteMinutes % 60;

  // string parts (day, hour, minute)
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  // Return the final formatted string, including negative sign
  return (isNegative ? "- " : "") + parts.join(" ");
};

// Converts days, hours, minutes input fields to total minutes
export const durationToMinutes = (d, h, m) => {
  // Parse inputs ensuring they default to zero
  const days = parseInt(d) || 0;
  const hours = parseInt(h) || 0;
  const minutes = parseInt(m) || 0;
  // Calculate and return the total minutes for storage
  return days * 1440 + hours * 60 + minutes;
};

// Splits total minutes back into day, hour, minute object
export const minutesToDurationObject = (totalMinutes) => {
  // Return empty object for null or zero input
  if (!totalMinutes) return { d: "", h: "", m: "" };

  // Calculate days, hours, and minutes from totalMinutes
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  // Return object with duration components for form fields
  return {
    d: days > 0 ? days : "",
    h: hours > 0 ? hours : "",
    m: minutes > 0 ? minutes : "",
  };
};
