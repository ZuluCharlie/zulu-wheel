const { contextBridge, ipcRenderer, webUtils } = require("electron");
/*
This section provides an interface to read and write files to the user-data directory.
*/
contextBridge.exposeInMainWorld("electronAPI", {
    writeData: (data, fileName) => ipcRenderer.invoke("writeData", data, fileName),
    readData: (fileName) => ipcRenderer.invoke("readData", fileName),
    writeSetting: (setting, data) => ipcRenderer.invoke("writeSetting", setting, data),
    readSetting: (setting) => ipcRenderer.invoke("readSetting", setting),
    getFilesInDirectory: (folderPath) => ipcRenderer.invoke("getFilesInDirectory", folderPath),
    saveFile: (folderPath, file) => ipcRenderer.invoke("saveFile", folderPath, file),
    downloadFile: (url, filePath) => ipcRenderer.invoke("downloadFile", url, filePath),
    twitchAuthDeviceCode: (deviceCode) => ipcRenderer.invoke("twitchAuthDeviceCode", deviceCode),
    twitchAuth: (forceVerify) => ipcRenderer.invoke("twitchAuth", forceVerify),
    getTwitchAccessToken: () => ipcRenderer.invoke("getTwitchAccessToken"),
    reload: (url) => ipcRenderer.invoke("reload", url),
    importCsv: (file, headers) => ipcRenderer.invoke("importCsv", file, headers),
    exportCsv: (csv) => ipcRenderer.invoke("exportCsv", csv),
    watchFile: (path, file) => {
        if (!path) {
            path = webUtils.getPathForFile(file);
        }

        return ipcRenderer.invoke("watchFile", path);
    },
    unwatchFile: () => ipcRenderer.invoke("unwatchFile"),
    openWheelTemplate: () => ipcRenderer.invoke("openWheelTemplate"),
    openImportCsvTemplate: () => ipcRenderer.invoke("openImportCsvTemplate"),
    onTokenCollected: (cb => {
        ipcRenderer.on('token-collected', (event, customData) => cb(customData));
    }),
    onImportedCsv: (cb => {
        ipcRenderer.on('imported-csv', (event, customData) => cb(customData));
    }),
    onFileWatchChange: (cb => {
        ipcRenderer.on('file-watch-change', (event, customData) => cb(customData));
    }),
    onFileWatchError: (cb => {
        ipcRenderer.on('file-watch-error', (event) => cb());
    }),
    getAppVersionNumber: () => ipcRenderer.invoke("getAppVersionNumber"),
});