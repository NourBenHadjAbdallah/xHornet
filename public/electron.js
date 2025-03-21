const electron = require("electron");
const { ipcMain } = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");

const fs = require("fs");
const fsPromises = require("fs").promises;

const { dialog } = require("electron");
//console.log(app.getPath('userData'));
const PDFWindow = require("electron-pdf-window");
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




  //mainWindow.webContents.openDevTools();
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




function createFolder(id,specialty, Diploma, academicFullYear, checkLot) {

  if (!fs.existsSync("../../../../../../" + academicFullYear)) {
    fs.mkdirSync("../../../../../../" + academicFullYear, (err) => {
      //   if (err) {
          // const messageBoxOptions = {
          //   type: "error",
          //   title: "Error in Main process",
          //   message: 'Failed to create folder ' + err +"1"
          // };
          // dialog.showMessageBox(messageBoxOptions);
      // }

    
  });
  } 
if(Diploma!=="Architecture"){
 
  if(checkLot===true){
    if (!fs.existsSync( "../../../../../../" + academicFullYear + "/" +Diploma)) 
    {
      fs.mkdirSync(
        "../../../../../../" + academicFullYear + "/" + Diploma,
        (err) => {
      // if (err) {
      //       const messageBoxOptions = {
      //         type: "error",
      //         title: "Error in Main process",
      //         message: 'Failed to create folder ' + err +"4"
      //       };
      //       dialog.showMessageBox(messageBoxOptions);
      //     }
        } );}
    if (!fs.existsSync( "../../../../../../" + academicFullYear +"/" + Diploma + "/" + specialty)) 
        {
            fs.mkdirSync(
              "../../../../../../" +
                academicFullYear +
                "/" + Diploma + "/" +
                specialty
               ,
              (err) => {
                // if (err) {
                //   const messageBoxOptions = {
                //     type: "error",
                //     title: "Error in Main process",
                //     message: 'Failed to create folder ' + err +"5"
                //   };
                //   dialog.showMessageBox(messageBoxOptions);
                //  }
                // else {
                //   const messageBoxOptions = {
                //     type: "info",
                //     message: 'Created Folder '+academicFullYear+'/'+diplomeNameFolder+'/'+id
                //   };
                //   dialog.showMessageBox(messageBoxOptions);
                // }
              });}
    if ( !fs.existsSync("../../../../../../" +academicFullYear +"/" + Diploma + "/" +specialty +"/lot")) 
          { 
                  fs.mkdirSync(
                    "../../../../../../" +
                      academicFullYear +
                      "/" + Diploma + "/" +
                      specialty +
                      "/lot",
                    (err) => {
                      //   if (err) {
                      //   const messageBoxOptions = {
                      //     type: "error",
                      //     title: "Error in Main process",
                      //     message: 'Failed to create folder ' + err +"5"
                      //   };
                      //   dialog.showMessageBox(messageBoxOptions);
                      //  }
                      // else {
                      //   const messageBoxOptions = {
                      //     type: "info",
                      //     message: 'Created Folder '+academicFullYear+'/'+diplomeNameFolder+'/'+id
                      //   };
                      //   dialog.showMessageBox(messageBoxOptions);
                      // }
                    }
                  );
                }
              }
              else{
                if (!fs.existsSync( "../../../../../../" + academicFullYear + "/" +Diploma)) 
                {
                  fs.mkdirSync(
                    "../../../../../../" + academicFullYear + "/" + Diploma,
                    (err) => {
                  // if (err) {
                  //       const messageBoxOptions = {
                  //         type: "error",
                  //         title: "Error in Main process",
                  //         message: 'Failed to create folder ' + err +"4"
                  //       };
                  //       dialog.showMessageBox(messageBoxOptions);
                  //     }
                    } );}
                if (!fs.existsSync( "../../../../../../" + academicFullYear +"/" + Diploma + "/" +specialty )) 
                    {
                        fs.mkdirSync(
                          "../../../../../../" +
                            academicFullYear +
                            "/" + Diploma + "/" +
                            specialty
                           ,
                          (err) => {
                            // if (err) {
                            //   const messageBoxOptions = {
                            //     type: "error",
                            //     title: "Error in Main process",
                            //     message: 'Failed to create folder ' + err +"5"
                            //   };
                            //   dialog.showMessageBox(messageBoxOptions);
                            //  }
                            // else {
                            //   const messageBoxOptions = {
                            //     type: "info",
                            //     message: 'Created Folder '+academicFullYear+'/'+diplomeNameFolder+'/'+id
                            //   };
                            //   dialog.showMessageBox(messageBoxOptions);
                            // }
                          });}
                if ( !fs.existsSync("../../../../../../" +academicFullYear +"/" + Diploma + "/" +specialty +"/" +id)) 
                      { 
                              fs.mkdirSync(
                                "../../../../../../" +
                                  academicFullYear +
                                  "/" + Diploma + "/" +
                                  specialty +
                                  "/" +
                                  id,
                                (err) => {
                                  //   if (err) {
                                  //   const messageBoxOptions = {
                                  //     type: "error",
                                  //     title: "Error in Main process",
                                  //     message: 'Failed to create folder ' + err +"5"
                                  //   };
                                  //   dialog.showMessageBox(messageBoxOptions);
                                  //  }
                                  // else {
                                  //   const messageBoxOptions = {
                                  //     type: "info",
                                  //     message: 'Created Folder '+academicFullYear+'/'+diplomeNameFolder+'/'+id
                                  //   };
                                  //   dialog.showMessageBox(messageBoxOptions);
                                  // }
                                }
                              );
                            }            
                          }
              }
else{
  if (!fs.existsSync( "../../../../../../" + academicFullYear +"/" + Diploma )) 
                {
                    fs.mkdirSync(
                      "../../../../../../" +
                        academicFullYear +
                        "/" + Diploma + "/"
                       ,
                      (err) => {
                        // if (err) {
                        //   const messageBoxOptions = {
                        //     type: "error",
                        //     title: "Error in Main process",
                        //     message: 'Failed to create folder ' + err +"5"
                        //   };
                        //   dialog.showMessageBox(messageBoxOptions);
                        //  }
                        // else {
                        //   const messageBoxOptions = {
                        //     type: "info",
                        //     message: 'Created Folder '+academicFullYear+'/'+diplomeNameFolder+'/'+id
                        //   };
                        //   dialog.showMessageBox(messageBoxOptions);
                        // }
                      });}
  if ( !fs.existsSync("../../../../../../" +academicFullYear +"/" + Diploma + "/" +id)) 
                  { 
                          fs.mkdirSync(
                            "../../../../../../" +
                              academicFullYear +
                              "/" + Diploma + "/" +
                               id,
                            (err) => {
                              //   if (err) {
                              //   const messageBoxOptions = {
                              //     type: "error",
                              //     title: "Error in Main process",
                              //     message: 'Failed to create folder ' + err +"5"
                              //   };
                              //   dialog.showMessageBox(messageBoxOptions);
                              //  }
                              // else {
                              //   const messageBoxOptions = {
                              //     type: "info",
                              //     message: 'Created Folder '+academicFullYear+'/'+diplomeNameFolder+'/'+id
                              //   };
                              //   dialog.showMessageBox(messageBoxOptions);
                              // }
                            }
                          );
                        }
              }     
 }
ipcMain.on("createFolder", (event, id, specialty,Diploma, academicFullYear, checkLot) => {

  createFolder(id, specialty,Diploma, academicFullYear, checkLot);
});

ipcMain.on(
  "downloadPDF",
  (event, id,specialty, Diploma, checkedDuplicata, academicFullYear, blobURL, checkLot) => {

    let pdfName = checkedDuplicata ? id + "_duplicata.pdf" : id + ".pdf";
    Diploma!=="architecture"?checkLot===true?fs.writeFile(
      "../../../../../../" +
        academicFullYear +
        "/" +
        Diploma +
        "/" +
        specialty +
        "/lot/" +
        pdfName,
      blobURL,
      function (err) {
        if (err) {
          const messageBoxOptions = {
            type: "error",
            // title: "Error in Main process",
            message: "Impossible d'enregistrer le pdf" + err,
          };
          dialog.showMessageBox(messageBoxOptions);
        } 
       
        
      }
      
    ):fs.writeFile(
      "../../../../../../" +
        academicFullYear +
        "/" +
        Diploma +
        "/" +
        specialty +
        "/" +
        id +
        "/" +
        pdfName,
      blobURL,
      function (err) {
        if (err) {
          const messageBoxOptions = {
            type: "error",
            // title: "Error in Main process",
            message: "Impossible d'enregistrer le pdf" + err,
          };
          dialog.showMessageBox(messageBoxOptions);
        } else {
          
        
         // if(checkLot==false) {
           
            const messageBoxOptions = {
            type: "info",
            message:
              "PDF enregistré sous le nom : " +
              "C:\\" +
              academicFullYear +
              "\\" +
              Diploma +
              "\\" +
              specialty +
              "\\" +
              id +
              "\\" +
              pdfName,
          };
            dialog.showMessageBox(messageBoxOptions);
            const { screen } = require("electron");
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width, height } = primaryDisplay.workAreaSize;
            const win = new PDFWindow({
              width: width,
              height: height,
            });
              win.loadURL(
                "file:/../../../../../../" +
                  academicFullYear +
                  "/" +
                  Diploma +
                  "/" +
                  specialty +
                  "/" +
                  id +
                  "/" +
                  pdfName
              )
          //  } 
   
          }
      }
      
    ):fs.writeFile(
      "../../../../../../" +
        academicFullYear +
        "/" +
        Diploma +
        "/" +
        id +
        "/" +
        pdfName,
      blobURL,
      function (err) {
        if (err) {
          const messageBoxOptions = {
            type: "error",
            // title: "Error in Main process",
            message: "Impossible d'enregistrer le pdf" + err,
          };
          dialog.showMessageBox(messageBoxOptions);
        } else {
         
        
          if(checkLot==false)
          {  const messageBoxOptions = {
            type: "info",
            message:
              "PDF enregistré sous le nom : " +
              "C:\\" +
              academicFullYear +
              "\\" +
              Diploma +
              "\\" +
              id +
              "\\" +
              pdfName,
          };
            dialog.showMessageBox(messageBoxOptions);
            const { screen } = require("electron");
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width, height } = primaryDisplay.workAreaSize;
            const win = new PDFWindow({
              // width: 800,
              // height: 600,
              width: width,
              height: height,
            });
       
            win.loadURL(
              "file:/../../../../../../" +
                academicFullYear +
                "/" +
                Diploma +
                "/" +
                id +
                "/" +
                pdfName
            );
          }
        }
      }
    );
    


  }
);

ipcMain.on("downloadImage", (event, id,specialty, Diploma, academicFullYear, blobURL) => {
  


  var base64Data = blobURL.replace(/^data:image\/png;base64,/, "");
  Diploma!=="Architecture"?fs.writeFile(
    "../../../../../../" +
      academicFullYear +
      "/" +
      Diploma +
      "/" +
      specialty +
      "/" +
      id +
      "/" +
      id +
      ".png",
    base64Data,
    "base64",
    function (err) {
      if (err) {
        const messageBoxOptions = {
          type: "error",
          //title: "Error in Main process",
          message: "Impossible d'enregistrer l'image " + err,
        };
        dialog.showMessageBox(messageBoxOptions);
      } else {
        const messageBoxOptions = {
          type: "info",
          message:
            "Image enregistrée sous le nom :  " +
            "C:\\" +
            academicFullYear +
            "\\" +
            Diploma + 
            "\\" +
            specialty + 
            "\\" +
            id +
            "\\" +
            id +
            ".png",
        };
        dialog.showMessageBox(messageBoxOptions);
      }
    }
  ):fs.writeFile(
    "../../../../../../" +
      academicFullYear +
      "/" +
      Diploma +
      "/" +
      id +
      "/" +
      id +
      ".png",
    base64Data,
    "base64",
    function (err) {
      if (err) {
        const messageBoxOptions = {
          type: "error",
          //title: "Error in Main process",
          message: "Impossible d'enregistrer l'image " + err,
        };
        dialog.showMessageBox(messageBoxOptions);
      } else {
        const messageBoxOptions = {
          type: "info",
          message:
            "Image enregistrée sous le nom :  " +
            "C:\\" +
            academicFullYear +
            "\\" +
            Diploma + 
            "\\" +
            id +
            "\\" +
            id +
            ".png",
        };
        dialog.showMessageBox(messageBoxOptions);
      }
    }
  )
});
//Log File
ipcMain.on(
  "logFile",
  (event, id, Diploma, academicFullYear, checkedDuplicata) => {
    let diplome = Diploma==="architecture"?"architecture":Diploma;
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
    let pathLogFile = "../../../../../../" + academicFullYear + "/logs.bat"

    try {
      // Read the contents of the file
      if (
        fs.existsSync(pathLogFile)
      ) {
        fs.readFile(
          pathLogFile,
          "utf8",
          (err, data) => {
            if (err) throw err;

            // Split the contents into individual lines
            const lines = data.split("\n");

            // Add a line number to the last line
            const lineNumber = lines.length;
            const newLastLine = `${lineNumber}. ${dataWrite}`;
            // event.reply("logFile", lineNumber);

            fs.appendFileSync(
              pathLogFile,
              newLastLine + "\n"
            );
          }
        );
      } else {
        fs.appendFileSync(
          pathLogFile,
          "1. " + dataWrite + "\n"
        );
        // event.reply("logFile", 1);
      }

    } catch (err) {
      console.error(err);
    }
 
   

  }
);

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