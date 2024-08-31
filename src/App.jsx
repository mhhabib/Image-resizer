// src/App.jsx
import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload.jsx';

const App = () => {
	const [imageData, setImageData] = useState(null);
	const [resizeDimensions, setResizeDimensions] = useState(null);
	const [resizedImage, setResizedImage] = useState(null);
	const [savingStatus, setSavingStatus] = useState(null);
	const [progress, setProgress] = useState(0);
	const [resizingStatus, setResizingStatus] = useState(null); // New state for resizing

	useEffect(() => {
		const handleSaveImageProgress = (data) => {
			if (data.status === 'completed') {
				setSavingStatus('Save completed!');
				setProgress(100);
				setTimeout(() => {
					setSavingStatus(null);
					setProgress(0);
				}, 3000);
			} else if (data.status === 'saving') {
				setSavingStatus('Saving...');
				setProgress(data.progress || 0);
			} else if (data.status === 'error') {
				setSavingStatus(`Error: ${data.message}`);
				setProgress(0);
				setTimeout(() => {
					setSavingStatus(null);
				}, 3000);
			}
		};

		window.api.onSaveImageProgress(handleSaveImageProgress);
		return () => {
			window.api.onSaveImageProgress(() => {});
		};
	}, []);

	const handleImageUpload = (data) => {
		setImageData(data);
		setResizedImage(null);
		setResizeDimensions(data);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setResizeDimensions((prev) => ({ ...prev, [name]: value }));
	};

	const handleResize = () => {
		setResizingStatus('Resizing...');
		setProgress(0);

		let progressValue = 0;
		const interval = setInterval(() => {
			progressValue += 5;
			setProgress(progressValue);

			if (progressValue >= 100) {
				clearInterval(interval);
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				canvas.width = resizeDimensions.width;
				canvas.height = resizeDimensions.height;
				const img = new Image();
				img.src = imageData.src;
				img.onload = () => {
					ctx.drawImage(
						img,
						0,
						0,
						resizeDimensions.width,
						resizeDimensions.height
					);
					const dataURL = canvas.toDataURL();
					setResizedImage(dataURL);
					setResizingStatus('Resize completed!');

					setTimeout(() => {
						setResizingStatus(null);
						setProgress(0);
					}, 3000);
				};
			}
		}, 100); // Update every 300ms
	};

	const handleSaveToFile = () => {
		window.api.saveImage(resizedImage);
	};

	return (
		<div className="flex flex-col justify-start items-center h-screen bg-gray-900 p-4 space-y-6">
			<div className="w-full">
				<h1 className="text-4xl font-bold text-blue-500 mt-4 mb-4 text-center uppercase">
					Image Resizer
				</h1>
				<hr className="w-[50%] mx-auto my-4" />
				<ImageUpload onImageUpload={handleImageUpload} />
				{imageData && (
					<p className="text-center py-4 text-white">
						Name: {resizeDimensions.name}, Width: {resizeDimensions.width},
						Height: {resizeDimensions.height}
					</p>
				)}
				{imageData && (
					<div className="flex w-full items-center justify-center space-x-4 mb-4">
						<input
							type="number"
							name="width"
							value={resizeDimensions.width}
							onChange={handleInputChange}
							className="p-2 rounded border border-gray-300"
							placeholder="Width"
						/>
						<input
							type="number"
							name="height"
							value={resizeDimensions.height}
							onChange={handleInputChange}
							className="p-2 rounded border border-gray-300"
							placeholder="Height"
						/>
						<button
							onClick={handleResize}
							className="p-2 bg-blue-500 text-white rounded"
						>
							Resize
						</button>
						{resizedImage && (
							<button
								onClick={handleSaveToFile}
								className="p-2 bg-green-500 text-white rounded"
							>
								Save Image to PC
							</button>
						)}
					</div>
				)}
				{resizingStatus && (
					<div className="text-center py-4 text-white">
						<p>{resizingStatus}</p>
						{progress > 0 && progress < 100 && (
							<div className="w-[50%] mx-auto bg-gray-700 rounded-full h-2.5">
								<div
									className="bg-blue-500 h-2.5 rounded-full"
									style={{ width: `${progress}%` }}
								></div>
							</div>
						)}
					</div>
				)}
				{savingStatus && (
					<div className="text-center py-4 text-white">
						<p>{savingStatus}</p>
						{progress > 0 && progress < 100 && (
							<div className="w-full bg-gray-700 rounded-full h-2.5">
								<div
									className="bg-blue-500 h-2.5 rounded-full"
									style={{ width: `${progress}%` }}
								></div>
							</div>
						)}
					</div>
				)}
				{imageData && (
					<div className="mt-4 flex flex-col w-full items-center justify-center">
						<img
							src={resizedImage ? resizedImage : imageData.src}
							alt="uploaded"
							className="h-96 border border-yellow-300 rounded"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
