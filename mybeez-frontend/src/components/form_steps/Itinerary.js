import React, { useState } from 'react';

const Itinerary = ({ formData, handleChange, onNext, onBack }) => {
  // Manages the validation error message for this form step.
  const [error, setError] = useState('');

  // Validates the form fields before proceeding to the next step.
  const handleContinue = () => {
    // Validates that the description field is not empty.
    if (!formData.description || formData.description.trim() === '') {
      setError('Please provide a description for the itinerary.');
      return;
    }
    // Validates that the location field is not empty.
    if (!formData.location || formData.location.trim() === '') {
      setError('Please provide a location.');
      return;
    }
    // Validates that the duration is a number greater than 0.
    const duration = parseFloat(formData.duration);
    if (isNaN(duration) || duration <= 0) {
      setError('Please enter a valid duration greater than 0 hours.');
      return;
    }

    // Clears any existing error messages if validation passes.
    setError('');
    console.log('Step 2 Data:', formData);
    // Calls the onNext prop to move to the next step in the parent component.
    onNext();
  };

  return (
      <div className="animate-fade-in max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-900">Itinerary</h2>
        <p className="text-md text-gray-600 mt-2">Describe what guests will do and where they'll be going.</p>

        <div className="mt-8">
          <label htmlFor="description" className="text-lg font-semibold text-gray-700">
            What you'll be doing
          </label>
          <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Describe the activities from start to finish..."
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => handleChange(e)}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className="text-lg font-semibold text-gray-700">Location</label>
            <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g., Central Park, NYC"
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.location}
                onChange={(e) => handleChange(e)}
            />
          </div>
          <div>
            <label htmlFor="duration" className="text-lg font-semibold text-gray-700">Duration (in hours)</label>
            <input
                type="number"
                id="duration"
                name="duration"
                placeholder="e.g., 3"
                min="0.5"
                step="0.5"
                className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.duration}
                onChange={(e) => handleChange(e)}
            />
          </div>
        </div>

        {error && <p className="text-red-500 mt-6 text-sm text-center font-semibold">{error}</p>}

        <div className="mt-12 flex justify-between">
          <button
              onClick={onBack}
              className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg text-sm hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
          <button
              onClick={handleContinue}
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Save and Continue
          </button>
        </div>
      </div>
  );
};

export default Itinerary;