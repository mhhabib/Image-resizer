// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	saveImage: (dataURL) => ipcRenderer.send('save-image', dataURL),
	onSaveImageProgress: (callback) =>
		ipcRenderer.on('save-image-progress', (event, data) => callback(data)),
});
