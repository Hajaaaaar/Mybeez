import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Trash } from '@phosphor-icons/react';

export const SortablePhotoItem = ({ id, index, previewUrl, onFileRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Increase z-index during drag to ensure proper layering
        zIndex: isDragging ? 1000 : 1,
    };

    // Completely prevent drag and delete interference
    const handleDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();
        // Add small delay to ensure event system is clear
        setTimeout(() => {
            onFileRemove(index);
        }, 0);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group"
        >
            {/* Separate drag handle from delete button */}
            <div
                {...attributes}
                {...listeners}
                className="cursor-move w-full h-full"
            >
                <img
                    src={previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-md border shadow-sm pointer-events-none"
                />

                {/* Cover photo indicator - automatically assigned to first item (index 0) */}
                {index === 0 && (
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                        <Star size={12} weight="fill" />
                        Cover
                    </div>
                )}
            </div>

            {/* Delete button - completely separated from drag handlers */}
            <button
                onClick={handleDelete}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                type="button"
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-50"
            >
                <Trash size={14} />
            </button>

            {/* Drag handle indicator */}
            <div className="absolute inset-0 rounded-md border-2 border-transparent group-hover:border-blue-300 transition-colors pointer-events-none" />
        </div>
    );
};