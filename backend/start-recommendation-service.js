const { spawn } = require("child_process");
const path = require("path");
const { setTimeout } = require("timers/promises");
const os = require("os");

console.log("🚀 Starting recommendation service...");

// Determine Python executable path based on platform
const isWindows = os.platform() === "win32";
const pythonPath = isWindows
  ? path.join(__dirname, "../recommendation-service/venv/Scripts/python.exe")
  : path.join(__dirname, "../recommendation-service/venv/bin/python");

const pythonService = spawn(pythonPath, ["main.py"], {
  cwd: path.join(__dirname, "../recommendation-service"),
  stdio: "inherit",
});

pythonService.on("error", (err) => {
  console.error("❌ Failed to start recommendation service:", err);
});

pythonService.on("close", (code) => {
  console.log(`❌ Recommendation service exited with code ${code}`);
});

console.log("⏳ Waiting for recommendation service to start...");
setTimeout(5000).then(() => {
  console.log("✅ Recommendation service should be ready");
});

process.stdin.resume();
