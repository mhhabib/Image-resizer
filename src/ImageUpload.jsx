import React, { useState } from 'react';
import logo from './images/logo.svg';

const ImageUpload = ({ onImageUpload }) => {
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				const img = new Image();
				img.src = reader.result;
				img.onload = () => {
					onImageUpload({
						src: reader.result,
						width: img.width,
						height: img.height,
						name: file.name,
					});
				};
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="flex flex-col w-full items-center justify-center bg-grey-lighter">
			<label className="w-64 flex flex-col text-sm items-center px-4 py-4 bg-white text-gray-500 rounded-lg shadow-lg tracking-wide border border-blue cursor-pointer hover:text-teal-800">
				<img src={logo} width="32" alt="uploader" />
				<span className="mt-2 leading-normal">Select an image to resize</span>
				<input
					type="file"
					accept="image/*"
					onChange={handleImageChange}
					hidden
				/>
			</label>
		</div>
	);
};

export default ImageUpload;
