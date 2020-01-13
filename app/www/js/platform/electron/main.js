const electron = require('electron');
const path = require('path');
const url = require('url');
const controller = require('./Controller');
const PeriscopeWebClientModule = require('../../ViewModel/PeriscopeWebClient');

// SET ENV
process.env.NODE_ENV = 'development'; // production

const { app, BrowserWindow, ipcMain } = electron;
const { CreateMainWindow } = controller;
const { PeriscopeWebClient } = PeriscopeWebClientModule;

let mainWindow;

// Listen for app to be ready
app.on('ready', function () {
        // Create new window
        mainWindow = CreateMainWindow();

        // listen to device ready
        document.addEventListener('deviceready', function() {
                console.log('Received Event: deviceready');
                PeriscopeWebClient.CreateMainWindow();
        }, false);
});
