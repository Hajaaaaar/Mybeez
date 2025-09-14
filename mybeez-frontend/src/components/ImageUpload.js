import React, { useRef, useState } from "react";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";

const ImageUpload = ({ selectedFiles = [], onFileChange, onFileRemove }) => {
  const fileInputRef = useRef();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const handleFileSelect = (e) => {
    if (e.target.files) {
      onFileChange(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const openPreviewModal = (file) => {
    setPreviewImageUrl(URL.createObjectURL(file));
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsModalOpen(false);
    setPreviewImageUrl("");
  };

  return (
    <div>
      {isModalOpen && (
        <div
        className="fixed inset-0 backdrop-blur-[2px] flex justify-center items-center z-50"
        onClick={closePreviewModal}
      >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <img src={previewImageUrl} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
      <div
        onClick={triggerFileSelect}
        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
      >
        <ArrowUpTrayIcon className="mx-auto h-8 w-8 text-indigo-600" />
        <p className="mt-2 text-sm text-gray-500">
          <span className="text-indigo-600 font-medium">Upload files</span> or drag and drop
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="flex gap-3 flex-wrap mt-4">
        {selectedFiles.map((file, idx) => (
          <div key={idx} className="relative group">
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${idx}`}
              className="w-24 h-24 object-cover rounded-md border cursor-pointer"
              onClick={() => openPreviewModal(file)}
            />
            <button
              onClick={() => onFileRemove(idx)}
              type="button"
              className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload;