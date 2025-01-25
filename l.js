// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain,globalShortcut} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
//let mainWindow;

function createWindow() {
    const {screen} = require("electron");
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    // express server is started here when production build
    if (!isDev) {
        require(path.join(__dirname, 'build-server/server'));
    }
    // if (isDev) {
    //   require('electron-reload')(__dirname, {
    //     electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    //   })
    // }
    // Create the browser window.
   const mainWindow = new BrowserWindow({
        width:width,
        height: height,
        minWidth: 1280,
        minHeight: 720,
        autoHideMenuBar: true,
        webSecurity: false,
        useContentSize:true,
        //worldSafeExecuteJavaScript: true,
        show: false,
        icon: "favicon.ico",
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.js')

        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : url.format({
        pathname: path.join(__dirname, 'build/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    var splash = new BrowserWindow({
        width: 950, 
        height: 500, 
        transparent: true, 
        frame: false, 
        alwaysOnTop: true 
    });
    
  //   .loadURL(isDev ? 'http://localhost:3000' : url.format({
  //     pathname: path.join(__dirname, 'splash-resources/splash.html'),
  //     protocol: 'file:',
  //     slashes: true
  // }));
  splash.loadURL(`file://${path.join(__dirname, "splash-resources/splash.html")}`);
    //splash.loadFile('splash.html');
    splash.center();
    setTimeout(function () {
        splash.close();
        mainWindow.show();
    
      }, 5000);
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    // mainWindow.on('closed', function () {
    //     // Dereference the window object, usually you would store windows
    //     // in an array if your app supports multi windows, this is the time
    //     // when you should delete the corresponding element.
    //     mainWindow = null
    // })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);

// // Quit when all windows are closed.
// app.on('window-all-closed', function () {
//     // On macOS it is common for applications and their menu bar
//     // to stay active until the user quits explicitly with Cmd + Q
//     if (process.platform !== 'darwin') app.quit()
// });

// app.on('activate', function () {
//     // On macOS it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (mainWindow === null) createWindow()
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// ipcMain.on('notify', (_, message) => {
//   globalShortcut.register('Control+C', () => {
//       console.log('Electron loves global shortcuts!')
//     })
//   new Notification({title: 'Notify', body: message}).show();
// })
app.whenReady().then(() => {
    // globalShortcut.register('Control+C', () => {
    //   console.log('Electron loves global shortcuts!')
    // })
    createWindow()
  
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
  
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })