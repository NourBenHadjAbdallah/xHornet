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

function getDiplomeName(Diploma) {
  let diplomeNameFolder;
  switch (Diploma) {
    case "20":
      diplomeNameFolder = "Génie Informatique";
      break;
    case "21":
      diplomeNameFolder = " Génie Informatique de Gestion";
      break;
    case "22":
      diplomeNameFolder = "Génie Télécommunications et Réseaux";
      break;
    case "23":
      diplomeNameFolder = "Génie Electrique et Automatique";
      break;
    case "24":
      diplomeNameFolder = "Génie Electromécanique";
      break;
    case "25":
      diplomeNameFolder = "Génie Mécanique";
      break;
    case "26":
      diplomeNameFolder = "Génie Biotechnologique";
      break;
    case "27":
      diplomeNameFolder = "Génie Civil";
      break;
    case "10":
      diplomeNameFolder = "Génie Logiciel et système d'information";
      break;
    case "11":
      diplomeNameFolder = "Business Intelligence";
      break;
  }
  return diplomeNameFolder;
}
function createFolder(id,section, Diploma, academicFullYear, checkLot) {
  let diplomeNameFolder = getDiplomeName(Diploma);
  if (!fs.existsSync("../../../../../../" + academicFullYear)) {
    fs.mkdir("../../../../../../" + academicFullYear, (err) => {
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
if(Diploma!=="architecture"){
 
  if(checkLot===true){
    if (!fs.existsSync( "../../../../../../" + academicFullYear + "/" +section)) 
    {
      fs.mkdir(
        "../../../../../../" + academicFullYear + "/" + section,
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
    if (!fs.existsSync( "../../../../../../" + academicFullYear +"/" + section + "/" +diplomeNameFolder )) 
        {
            fs.mkdir(
              "../../../../../../" +
                academicFullYear +
                "/" + section + "/" +
                diplomeNameFolder
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
    if ( !fs.existsSync("../../../../../../" +academicFullYear +"/" + section + "/" +diplomeNameFolder +"/lot")) 
          { 
                  fs.mkdir(
                    "../../../../../../" +
                      academicFullYear +
                      "/" + section + "/" +
                      diplomeNameFolder +
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
                if (!fs.existsSync( "../../../../../../" + academicFullYear + "/" +section)) 
                {
                  fs.mkdir(
                    "../../../../../../" + academicFullYear + "/" + section,
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
                if (!fs.existsSync( "../../../../../../" + academicFullYear +"/" + section + "/" +diplomeNameFolder )) 
                    {
                        fs.mkdir(
                          "../../../../../../" +
                            academicFullYear +
                            "/" + section + "/" +
                            diplomeNameFolder
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
                if ( !fs.existsSync("../../../../../../" +academicFullYear +"/" + section + "/" +diplomeNameFolder +"/" +id)) 
                      { 
                              fs.mkdir(
                                "../../../../../../" +
                                  academicFullYear +
                                  "/" + section + "/" +
                                  diplomeNameFolder +
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
  if (!fs.existsSync( "../../../../../../" + academicFullYear +"/" + section )) 
                {
                    fs.mkdir(
                      "../../../../../../" +
                        academicFullYear +
                        "/" + section + "/"
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
  if ( !fs.existsSync("../../../../../../" +academicFullYear +"/" + section + "/" +id)) 
                  { 
                          fs.mkdir(
                            "../../../../../../" +
                              academicFullYear +
                              "/" + section + "/" +
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
ipcMain.on("createFolder", (event, id, section,Diploma, academicFullYear, checkLot) => {

  createFolder(id, section,Diploma, academicFullYear, checkLot);
});

ipcMain.on(
  "downloadPDF",
  (event, id,section, Diploma, checkedDuplicata, academicFullYear, blobURL, checkLot) => {
    let diplomeNameFolder = getDiplomeName(Diploma);
    let pdfName = checkedDuplicata ? id + "_duplicata.pdf" : id + ".pdf";
    Diploma!=="architecture"?checkLot===true?fs.writeFile(
      "../../../../../../" +
        academicFullYear +
        "/" +
        section +
        "/" +
        diplomeNameFolder +
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
        section +
        "/" +
        diplomeNameFolder +
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
              section +
              "\\" +
              diplomeNameFolder +
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
                  section +
                  "/" +
                  diplomeNameFolder +
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
        section +
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
              section +
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
                section +
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

ipcMain.on("downloadImage", (event, id,section, Diploma, academicFullYear, blobURL) => {
  
  let diplomeNameFolder = getDiplomeName(Diploma);

  var base64Data = blobURL.replace(/^data:image\/png;base64,/, "");
  Diploma!=="architecture"?fs.writeFile(
    "../../../../../../" +
      academicFullYear +
      "/" +
      section +
      "/" +
      diplomeNameFolder +
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
            section + 
            "\\" +
            diplomeNameFolder + 
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
      section +
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
            section + 
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
    let diplome = Diploma==="architecture"?"architecture":getDiplomeName(Diploma);
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