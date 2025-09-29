const electron = require("electron");
const { ipcMain } = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");

const fs = require("fs");
const fsPromises = require("fs").promises;

const { dialog } = require("electron");

const { sendEmail } = require(path.join(__dirname, '../src/components/EmailHandler')); 

let mainWindow;

//Create main window
function createWindow() {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    // width:1280,
    // height: 720,
    minWidth: 1280,
    minHeight: 720,
    autoHideMenuBar: true,
    //webSecurity: false,
    // resizable: false,
    useContentSize: true,
    show: false,
    icon: "favicon.ico",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  mainWindow.webContents.openDevTools();
  var splash = new BrowserWindow({
    width: 950,
    height: 500,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  splash.loadURL(
    `file://${path.join(__dirname, "/splash-resources/splash.html")}`
  );

  splash.center();
  setTimeout(function () {
    splash.close();
    mainWindow.show();
  }, 5000);
}

function createFolder(id, specialty, Diploma, academicFullYear, checkLot) {
  const baseDir = 'C:\\';
  let targetPath;

  if (Diploma !== "Architecture") {
    if (checkLot === true) {
      targetPath = path.join(baseDir, academicFullYear, Diploma, specialty, "lot");
    } else {
      targetPath = path.join(baseDir, academicFullYear, Diploma, specialty, id);
    }
  } else {
    targetPath = path.join(baseDir, academicFullYear, Diploma, id);
  }

  try {
    fs.mkdirSync(targetPath, { recursive: true });
    console.log(`Folder created successfully at: ${targetPath}`);
  } catch (err) {
    console.error('Folder creation error:', err);
    dialog.showErrorBox("Error Creating Folder", `Failed to create folder ${targetPath}: ${err.message}. Run as admin if targeting C:\\.`);
  }
}

ipcMain.on("createFolder", (event, id, specialty, Diploma, academicFullYear, checkLot) => {
  createFolder(id, specialty, Diploma, academicFullYear, checkLot);
});

ipcMain.on(
  "downloadPDF",
  (event, id, specialty, Diploma, checkedDuplicata, academicFullYear, blobURL, checkLot) => {

    let pdfName = checkedDuplicata ? id + "_duplicata.pdf" : id + ".pdf";
    let fullPath;

    // Use a consistent base directory for both dev and production
    const baseDir = 'C:\\';

    if (Diploma !== "Architecture") {
      if (checkLot === true) {
        fullPath = path.join(baseDir, academicFullYear, Diploma, specialty, "lot", pdfName);
      } else {
        fullPath = path.join(baseDir, academicFullYear, Diploma, specialty, id, pdfName);
      }
    } else {
      fullPath = path.join(baseDir, academicFullYear, Diploma, id, pdfName);
    }

    // Ensure directory exists before writing file
    const dirPath = path.dirname(fullPath);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
      dialog.showErrorBox("Directory Error", `Failed to create directory: ${err.message}`);
      return;
    }

    fs.writeFile(fullPath, blobURL, function (err) {
      if (err) {
        dialog.showMessageBox({
          type: "error",
          message: "Impossible d'enregistrer le pdf: " + err.message,
        });
      } else {
        if (checkLot === false) {
          dialog.showMessageBox({
            type: "info",
            message: "PDF enregistré sous le nom : " + fullPath,
          });
        }
      }
    });
  }
);

ipcMain.on("downloadImage", (event, id, specialty, Diploma, academicFullYear, blobURL) => {
  const baseDir = 'C:\\';
  var base64Data = blobURL.replace(/^data:image\/png;base64,/, "");
  
  let fullPath;
  let displayPath;

  if (Diploma !== "Architecture") {
    fullPath = path.join(baseDir, academicFullYear, Diploma, specialty, id, id + ".png");
    displayPath = path.join("C:", academicFullYear, Diploma, specialty, id, id + ".png");
  } else {
    fullPath = path.join(baseDir, academicFullYear, Diploma, id, id + ".png");
    displayPath = path.join("C:", academicFullYear, Diploma, id, id + ".png");
  }

  const dirPath = path.dirname(fullPath);
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }

  fs.writeFile(
    fullPath,
    base64Data,
    "base64",
    function (err) {
      if (err) {
        const messageBoxOptions = {
          type: "error",
          message: "Impossible d'enregistrer l'image: " + err.message,
        };
        dialog.showMessageBox(messageBoxOptions);
      } else {
        const messageBoxOptions = {
          type: "info",
          message: "Image enregistrée sous le nom : " + displayPath.replace(/\//g, "\\"),
        };
        dialog.showMessageBox(messageBoxOptions);
      }
    }
  );
});

//Log File
ipcMain.on(
  "logFile",
  async (event, id, Diploma, academicFullYear, checkedDuplicata) => {
    const baseDir = 'C:\\';
    let diplome = Diploma === "Architecture" ? "architecture" : Diploma;
    let duplicata = checkedDuplicata ? "Diplôme duplicata" : "Diplôme original";

    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hour = date_ob.getHours();
    let minute = date_ob.getMinutes();
    let second = date_ob.getSeconds();

    let dataWrite = `${year}-${month}-${date} ${hour}:${minute}:${second}#admin#${diplome}#${id}#${duplicata}`;
    
    let pathLogFile = path.join(baseDir, academicFullYear, "logs.bat");

    try {
      const dirPath = path.dirname(pathLogFile);
      fs.mkdirSync(dirPath, { recursive: true });

      let data = '';
      let lineNumber = 1;
      if (fs.existsSync(pathLogFile)) {
        data = await fsPromises.readFile(pathLogFile, 'utf8');
        const lines = data.trim().split('\n');
        lineNumber = lines.length + 1;
      }
      const newLine = `${lineNumber}. ${dataWrite}\n`;
      await fsPromises.appendFile(pathLogFile, newLine);
    } catch (err) {
      console.error('Log file error:', err);
      dialog.showErrorBox("Error Logging", `Failed to write log: ${err.message}`);
    }
  }
);

ipcMain.on('send-email-ipc', async (event, emailData) => {
  try {
    if (!sendEmail) {
      throw new Error('EmailHandler not available');
    }
    const result = await sendEmail(emailData);
    event.reply('send-email-ipc-reply', result);
  } catch (error) {
    console.error('Error sending email from main process:', error);
    event.reply('send-email-ipc-reply', { success: false, error: error.message });
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});