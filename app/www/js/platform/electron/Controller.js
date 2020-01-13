
const path = require('path');
const url = require('url');

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

let mainWindow;

function LoadPage(page_file)
{
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '..', '..', '..', page_file),
        protocol: 'file:',
        slashes: true
      }));
}

function RegisterIpcCallbacks()
{
    ipcMain.on('main:feedback:happy', function (e, item) {
        console.log("I'm happy")
        LoadPage('complement.html');
      });
}

module.exports = {
    CreateMainWindow: function() {
        // Create new window
        mainWindow = new BrowserWindow({
            frame: true,
            nodeIntegration: true,
            resizable: true
        });

        LoadPage('index.html');

        // Quit app when closed
        mainWindow.on('closed', function () {
            app.quit();
        });

        RegisterIpcCallbacks()

        return mainWindow;
    }
}
  