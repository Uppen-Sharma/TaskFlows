const fs = require("fs");
const path = require("path");
const LOG_FILE_PATH = path.join(__dirname, "..", "api_audit.jsonl");

// create log entry with timestamp
const logApiCall = (logData) => {
  const entry = {
    timestamp: new Date().toISOString(),
    ...logData,
  };

  // convert entry to json line
  const jsonLine = JSON.stringify(entry) + "\n";

  // append log line to file
  fs.appendFile(LOG_FILE_PATH, jsonLine, (err) => {
    if (err) {
      console.error("CRITICAL: Failed to write API audit log:", err);
    }
  });
};

module.exports = logApiCall;
