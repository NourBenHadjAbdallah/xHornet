const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("geminiAPI", {
  ask: async (message) => {
    return await ipcRenderer.invoke("chat-to-gemini", message);
  },
});
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  })
// const { ipcRenderer, contextBridge , globalShortcut} = require('electron');

// contextBridge.exposeInMainWorld('electron', {
//   notificationApi: {
//     sendNotification(message) {
//       ipcRenderer.send('notify', message);
//     }
//   }
  
// })  