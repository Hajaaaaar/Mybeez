import React from 'react';
import { SpinnerGap, PaperPlaneTilt, Star, FileVideo } from '@phosphor-icons/react';
import {ToastContainer} from "react-toastify";

const Publish = ({ formData, isSubmitting, onSubmit, onBack, isEditMode }) => {

  return (
    <div className="animate-fade-in max-w-3xl">
      <h2 className="text-3xl font-bold text-gray-900">Review & Publish</h2>
      <p className="text-md text-gray-600 mt-2">
        Review all your experience details below. When you're ready, submit for approval.
      </p>

      <div className="mt-8 space-y-8 p-6 border rounded-xl bg-gray-50">

        {/* --- Basics Section --- */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            The Basics
          </h3>
          <div className="space-y-1 text-gray-700">
            <p><strong>Title:</strong> {formData.basics.title || 'Not set'}</p>
            <p><strong>Category:</strong> {formData.basics.category.name || 'Not set'}</p>
          </div>
        </div>

        {/* --- Itinerary Section --- */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            Itinerary
          </h3>
          <div className="space-y-1 text-gray-700">
            <p><strong>Location:</strong> {formData.itinerary.location || 'Not set'}</p>
            <p><strong>Duration:</strong> {formData.itinerary.duration ? `${formData.itinerary.duration} hours` : 'Not set'}</p>
            <div className="mt-2">
              <p><strong>Description:</strong></p>
              <p className="whitespace-pre-wrap text-sm text-gray-600">{formData.itinerary.description || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* --- Photos & Videos Section --- */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            Photos & Videos
          </h3>
          <div className="flex gap-3 flex-wrap mt-2">
            {formData.photos.length > 0 ? formData.photos.map((item, idx) => {
              const isFile = item instanceof File;
              const imageUrl = isFile ? URL.createObjectURL(item) : item.url;
              const itemKey = isFile ? `${item.name}-${idx}` : item.publicId;

              return (
                <div key={itemKey} className="relative">
                  <img
                    src={imageUrl}
                    alt="upload-preview"
                    className="w-28 h-28 object-cover rounded-md border"
                  />
                  {idx === 0 && (
                    <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={12} weight="fill" />
                      Cover
                    </div>
                  )}
                </div>
              );
            }) : <p className="text-sm text-gray-500">No media added.</p>}
          </div>
        </div>

        {/* --- Pricing Section --- */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            Pricing
          </h3>
          <div className="space-y-1 text-gray-700">
            <p><strong>Session Types:</strong> {formData.pricing.sessionTypes.join(', ') || 'None selected'}</p>
            {formData.pricing.sessionTypes.includes('GROUP') && (
              <>
                <p><strong>Group Price:</strong> £{formData.pricing.groupPricePerPerson} / person</p>
              </>
            )}
            {formData.pricing.sessionTypes.includes('PRIVATE') && (
              <p><strong>Private Price:</strong> £{formData.pricing.privatePrice} / session</p>
            )}
          </div>
        </div>

        {/* --- Availability Section --- */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
            Availability
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {formData.pricing.availabilitySlots.length > 0 ? formData.pricing.availabilitySlots.map((slot, index) => (
              <li key={index}>
                {new Date(slot.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} | {slot.startTime} - {slot.endTime} | Capacity: {slot.capacity}
              </li>
            )) : <li>No time slots added.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <button onClick={onBack} disabled={isSubmitting}
                className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg text-sm">
          Back
        </button>
        <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-sm flex items-center justify-center disabled:bg-blue-400"
        >
          {isSubmitting ? (
              <>
                <SpinnerGap size={20} className="animate-spin mr-2"/>
                {isEditMode ? 'Updating...' : 'Submitting...'}
              </>
          ) : (
              <>
                <PaperPlaneTilt size={20} className="mr-2"/>
                {isEditMode ? 'Update Experience' : 'Submit Experience'}
              </>
          )}
        </button>
      </div>
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{
            zIndex: 9999,
            position: 'fixed',
            top: '20px',
            right: '20px'
          }}
          toastClassName="!z-[9999]"
          bodyClassName="!z-[9999]"
      />

    </div>
  );
};

export default Publish;