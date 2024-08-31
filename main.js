const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const net = require('net');
const fs = require('fs');
const port = 3000;
const serverURL = `http://localhost:${port}`;

function createWindow() {
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;
	const preloadPath = path.join(__dirname, 'src', 'preload.js');
	console.log('Preload habib ', preloadPath);
	const mainWindow = new BrowserWindow({
		width: width,
		height: height,
		webPreferences: {
			nodeIntegration: false, // Ensure this is false for security
			contextIsolation: true, // Enable context isolation for security
			preload: preloadPath, // Correct path to preload.js
		},
	});

	// Function to load URL once server is ready
	const loadURLWhenReady = () => {
		const socket = new net.Socket();

		socket.on('connect', () => {
			socket.end();
			mainWindow.loadURL(serverURL);
			// Uncomment to open DevTools by default
			mainWindow.webContents.openDevTools();
		});

		socket.on('error', () => {
			setTimeout(loadURLWhenReady, 1000);
		});

		socket.connect(port, 'localhost');
	};

	loadURLWhenReady();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// Listen for save image event
ipcMain.on('save-image', async (event, dataURL) => {
	const win = BrowserWindow.getFocusedWindow();
	const options = {
		title: 'Save Resized Image',
		defaultPath: path.join(app.getPath('pictures'), 'resized-image.png'),
		buttonLabel: 'Save',
		filters: [{ name: 'Images', extensions: ['png'] }],
	};

	try {
		const { filePath } = await dialog.showSaveDialog(win, options);

		if (filePath) {
			const base64Data = dataURL.replace(/^data:image\/png;base64,/, '');

			fs.writeFile(filePath, base64Data, 'base64', (err) => {
				if (err) {
					console.error('Error saving file:', err);
				} else {
					event.sender.send('save-image-progress', { status: 'completed' });
				}
			});
			event.sender.send('save-image-progress', {
				status: 'saving',
				progress: 0,
			});
		}
	} catch (error) {
		console.error('Error handling save image:', error);
		event.sender.send('save-image-progress', {
			status: 'error',
			message: error.message,
		});
	}
});
