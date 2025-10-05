const electron = require("electron");
const { app, BrowserWindow, ipcMain } = electron;
const path = require("path");
const isDev = require("electron-is-dev");

const { GoogleGenerativeAI } = require("@google/generative-ai");


let mainWindow;
let chatHistory = []; // Stores chat context memory

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyAVkU9DdyLEUCksVqWUNJDW-0_adOpT8Wk");

// -------------------------
// 🪟 CREATE MAIN WINDOW
// -------------------------
function createWindow() {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1280,
    minHeight: 720,
    autoHideMenuBar: true,
    useContentSize: true,
    show: false,
    icon: "favicon.ico",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  if (isDev) mainWindow.webContents.openDevTools();

  // Splash screen
  const splash = new BrowserWindow({
    width: 950,
    height: 500,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  splash.loadURL(`file://${path.join(__dirname, "/splash-resources/splash.html")}`);
  splash.center();

  setTimeout(() => {
    splash.close();
    mainWindow.show();
  }, 5000);
}

// -------------------------
// 🤖 GEMINI CHAT HANDLER
// -------------------------
ipcMain.handle("chat-to-gemini", async (event, userMessage) => {
  try {
    // Add message to chat history for context
    chatHistory.push({ role: "user", content: userMessage });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const context = chatHistory.map((m) => `${m.role}: ${m.content}`).join("\n");

    const result = await model.generateContent(context);
    const reply = result.response.text();

    // Store assistant reply
    chatHistory.push({ role: "assistant", content: reply });

    return reply;
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return "Désolé 😔, je rencontre un problème technique pour le moment.";
  }
});

// -------------------------
// ⚡ APP READY
// -------------------------
app.whenReady().then(() => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// -------------------------
// ❌ CLOSE EVENT
// -------------------------
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
