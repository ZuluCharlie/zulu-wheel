const { app, BrowserWindow, ipcMain, shell, webUtils, dialog } = require('electron')
const url = require("url");
const path = require("path");
const fs = require("fs");
const settings = require("electron-settings");
const { Duplex } = require('stream');
const csv = require('csv-parser');
const http = require('http');

if (require('electron-squirrel-startup')) app.quit();

let mainWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, '/preload.js'),
            spellcheck: false,
        },
        icon: path.join(__dirname, 'public/favicon.ico'),
    });

    mainWindow.maximize();

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'dist/zulu-wheel/browser/index.html'),
            protocol: "file:",
            slashes: true
        })
    );

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    mainWindow.setMenuBarVisibility(false);

    var server1, server2;
    server1 = http.createServer(function (req, res) {
        res.write('<script>window.location = "http://localhost:6912/" + window.location.hash.substring(14,44)</script>');
        res.end();
    }).listen(4448);

    server2 = http.createServer(function (req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });

        if (req.url === '/') {
            mainWindow.webContents.send('token-collected', null);
            res.write('There was a problem authenticating your Twitch login. Please close this window and try again.');
        }
        else if (req.url.startsWith('/') && req.url !== '/favicon.ico') {
            const twitchAuthToken = req.url.slice(1);
            mainWindow.webContents.send('token-collected', twitchAuthToken);
            res.write('Your Twitch login has been authenticated successfully. You may now close this window.');
        }
        res.end();
    }).listen(6912);
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})

ipcMain.handle("writeData", async (event, data, fileName) => {
    try {
        fs.writeFileSync(fileName, data);
    } catch (error) {
        console.error("Error writing data", error);
    }
})

ipcMain.handle("readData", async (event, fileName) => {
    try {
        const data = fs.readFileSync(fileName, "utf-8");
        return data.toString();
    } catch (error) {
        console.error("Error retrieving user data", error);
    }
})

ipcMain.handle("writeSetting", (event, setting, data) => {
    try {
        settings.setSync(setting, data)
    } catch (error) {
        console.error("Error writing data", error);
    }
})

ipcMain.handle("readSetting", (event, setting) => {
    try {
        return settings.getSync(setting);
    } catch (error) {
        console.error("Error retrieving user data", error);
    }
})

ipcMain.handle("getFilesInDirectory", async (event, folderPath) => {
    try {
        const fullFolderPath = path.join(app.getPath('appData'), app.name, folderPath);

        if (!fs.existsSync(fullFolderPath)) {
            fs.mkdirSync(fullFolderPath, { recursive: true });
        }

        const defaultFiles = fs.readdirSync(path.join(__dirname, 'dist/zulu-wheel/browser', folderPath));
        const userFiles = fs.readdirSync(fullFolderPath);

        return [
            ...defaultFiles.map(f => path.join(__dirname, 'dist/zulu-wheel/browser', folderPath, f).replaceAll('\\', '/')),
            ...userFiles.map(f => path.join(fullFolderPath, f).replaceAll('\\', '/'))];
    } catch (error) {
        console.error("Error retrieving user data", error);
    }
})

ipcMain.handle("saveFile", async (event, filePath, file) => {
    try {
        const folderPath = path.join(app.getPath('appData'), app.name, path.dirname(filePath));
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        
        const fileName = path.join(app.getPath('appData'), app.name, filePath);
        fs.writeFileSync(fileName, Buffer.from(file));
        return fileName.replaceAll('\\', '/');
    } catch (error) {
        console.error("Error retrieving user data", error);
    }
})

ipcMain.handle("twitchAuthDeviceCode", async (event, deviceCode) => {
    shell.openExternal(`https://www.twitch.tv/activate?public=true&device-code=${deviceCode}`);
})

ipcMain.handle("twitchAuth", async (event, forceVerify) => {
    try {
        const clientId = '7sfz2braoxwi5lsjniilwefr2fpdrg';
        const state = getGuid();
        var authUrl =
            `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=http://localhost:4448&scope=user%3Aread%3Achat&state=${state}&force_verify=${forceVerify}`;

        shell.openExternal(authUrl);
    } catch (error) {
        console.error("Error retrieving user data", error);
    }
})

ipcMain.handle("getTwitchAccessToken", async (event) => {
    return twitchAuthToken;
})

ipcMain.handle("reload", async (event, refreshUrl) => {
    if (mainWindow) {
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, 'dist/zulu-wheel/browser/index.html'),
                protocol: "file:",
                slashes: true,
                hash: refreshUrl.replace('/', '')
            })
        );
    }
})

ipcMain.handle("importCsv", async (event, file, headers) => {
    const results = [];
    bufferToStream(Buffer.from(file))
        .pipe(csv({
            headers,
            skipLines: 1
        }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            mainWindow.webContents.send('imported-csv', results);
        });
})

ipcMain.handle("exportCsv", async (event, csv) => {
    dialog.showSaveDialog({
        title: 'Select the File Path to save',
        buttonLabel: 'Save',
        filters: [
            {
                name: 'CSV Files',
                extensions: ['csv']
            },]
    }).then(file => {
        if (!file.canceled) {
            fs.writeFileSync(file.filePath.toString(), csv);
        }
    })
})

let watcher;
ipcMain.handle("watchFile", async (event, path) => {
    try {
        watcher = fs.watch(path, null, () => {
            const data = fs.readFileSync(path, "utf-8");
            mainWindow.webContents.send('file-watch-change', data);
        });

        const data = fs.readFileSync(path, "utf-8");
        mainWindow.webContents.send('file-watch-change', data);

        return path;
    }
    catch (e) {
        console.log(e);
        mainWindow.webContents.send('file-watch-error');
        return null;
    }
})

ipcMain.handle("unwatchFile", async (event) => {
    if (!watcher) {
        return;
    }

    watcher.close();
})

ipcMain.handle("openWheelTemplate", async (event) => {
    var templateWindow = new BrowserWindow({
        width: 800,
        height: 600,
        'node-integration': false,
        'web-security': false
    });

    templateWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'dist/zulu-wheel/browser/assets/templates/Wheel Template.png'),
            protocol: "file:",
            slashes: true
        })
    );
})

ipcMain.handle("openImportCsvTemplate", async (event) => {
    var templateWindow = new BrowserWindow({
        width: 800,
        height: 600,
        'node-integration': false,
        'web-security': false
    });

    templateWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'dist/zulu-wheel/browser/assets/templates/Giveaway Import Template.csv'),
            protocol: "file:",
            slashes: true
        })
    );
})

function getGuid() {
    return 'xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getAccessTokenFromTwitchRedirect(newUrl) {
    const url = new URL(newUrl);
    const parsedHash = new URLSearchParams(
        url.hash.substring(1)
    );

    return parsedHash.get('access_token');
}

function bufferToStream(myBuffer) {
    let tmp = new Duplex();
    tmp.push(myBuffer);
    tmp.push(null);
    return tmp;
}