import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Barbell,
  Palette,
  Heartbeat,
  BowlSteam,
  Tree,
  Ticket,
  GraduationCap,
  Question
} from '@phosphor-icons/react';

// Maps category names from the API to specific icon components.
const iconMap = {
  'Food & Drink': BowlSteam,
  'Arts & Culture': Palette,
  'Nature & Outdoors': Tree,
  'Sports & Fitness': Barbell,
  'Fitness & Wellness': Heartbeat,
  'Entertainment': Ticket,
  'Workshops & Skills': GraduationCap,
};

const Basics = ({ formData, handleChange, handleCategorySelect, onNext }) => {
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetches experience categories from the backend on component mount.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/experiences/categories");
        setCategories(response.data);
      } catch (err) {
        setFetchError("Could not load categories. Please try again later.");
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Validates required fields before proceeding to the next step.
  const handleContinue = () => {
    setError(''); // Reset error before validation.

    if (!formData.title || !formData.title.trim()) {
      setError('Please enter a title for your experience.');
      return;
    }
    // Check if a category with a valid ID has been selected.
    if (!formData.category || formData.category.id === null) {
      setError('Please select a category for your experience.');
      return;
    }

    console.log('Step 1 Data:', formData);
    onNext();
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading categories...</p>;
  }

  if (fetchError) {
    return <p className="text-red-500 font-semibold">{fetchError}</p>;
  }

  return (
      <div className="animate-fade-in max-w-3xl">
        <h2 className="text-3xl font-bold text-gray-900">The Basics</h2>
        <p className="text-md text-gray-600 mt-2">Let's start with the name and category of your experience.</p>

        <div className="mt-8">
          <label htmlFor="title" className="text-lg font-semibold text-gray-700">Title</label>
          <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g. Authentic Neapolitan Pizza Making"
              className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={(e) => handleChange(e)}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-700">Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {categories.map((category) => {
              const IconComponent = iconMap[category.name] || Question;

              return (
                  <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all h-full flex flex-col items-center justify-center text-center
                  ${formData.category?.id === category.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}
                `}
                  >
                    <IconComponent
                        size={36}
                        className="text-blue-600 mb-3"
                        weight="duotone"
                    />
                    <p className="font-semibold text-base mt-2">{category.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                  </div>
              );
            })}
          </div>
        </div>

        {error && <p className="text-red-500 mt-6 text-sm text-center font-semibold">{error}</p>}

        <div className="mt-12 flex justify-end">
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

export default Basics;