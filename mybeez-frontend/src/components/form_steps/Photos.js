import React, { useState, useEffect, useRef } from 'react';
import { CloudArrowUp, Trash, Star } from '@phosphor-icons/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortablePhotoItem } from './SortablePhotoItem';

const Photos = ({ mediaItems = [], onFileUpload, onFileRemove, onPhotoReorder, onNext, onBack }) => {
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Effect to generate local blob URLs for previewing new file uploads.
  useEffect(() => {
    const newPreviews = mediaItems.map(item => {
      if (item instanceof File) return URL.createObjectURL(item);
      if (item.url) return item.url;
      return '';
    });
    setPreviews(newPreviews);
    // Cleanup function to revoke object URLs and prevent memory leaks.
    return () => {
      newPreviews.forEach((url, index) => {
        if (mediaItems[index] instanceof File) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mediaItems]);

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;
    onFileUpload(files);
  };

  const handleContinue = () => {
    if (mediaItems.length < 5) {
      setError('Please upload at least 5 photos to continue.');
      return;
    }
    setError('');
    onNext();
  };

  const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
  );

  // A helper function to generate a stable, unique ID for each item,
  // required by dnd-kit for both new files and existing images.
  const getItemId = (item, index) => item.id || `new-file-${index}`;

  // This handler now determines the array indices from the drag event
  // and passes only those indices to the parent's onPhotoReorder callback.
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = mediaItems.findIndex((item, index) => getItemId(item, index) === active.id);
      const newIndex = mediaItems.findIndex((item, index) => getItemId(item, index) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onPhotoReorder(oldIndex, newIndex);
      }
    }
  };

  return (
      <div className="animate-fade-in max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-900">Photos</h2>
        <p className="text-md text-gray-600 mt-2">Add at least 5 photos. The first photo in the list will be your cover photo. Drag to reorder.</p>

        <div onClick={() => fileInputRef.current.click()} className="mt-8 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
          <CloudArrowUp className="mx-auto h-8 w-8 text-blue-600" />
          <p className="mt-2 text-sm text-gray-500">
            <span className="text-blue-600 font-medium">Click to upload files</span> or drag and drop
          </p>
          <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
          />
        </div>

        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
          <SortableContext items={mediaItems.map(getItemId)} strategy={rectSortingStrategy}>
            <div className="flex gap-3 flex-wrap mt-4 min-h-[100px]">
              {mediaItems.map((item, idx) => (
                  <SortablePhotoItem
                      key={getItemId(item, idx)}
                      id={getItemId(item, idx)}
                      index={idx}
                      previewUrl={previews[idx]}
                      onFileRemove={onFileRemove}
                  />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {error && <p className="text-red-500 mt-4 text-sm font-semibold">{error}</p>}

        <div className="mt-12 flex justify-between">
          <button onClick={onBack} className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg text-sm">Back</button>
          <button onClick={handleContinue} className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-sm">Save and Continue</button>
        </div>
      </div>
  );
};

export default Photos;