import React from 'react';
import { CheckCircleIcon } from '@phosphor-icons/react';

const steps = [
  { number: 1, text: 'The Basics' },
  { number: 2, text: 'Itinerary' },
  { number: 3, text: 'Photos & Video' },
  { number: 4, text: 'Pricing & Availability' },
  { number: 5, text: 'Publish' },
];

const FormStepper = ({ currentStep }) => {
  return (
    <aside className="w-80 bg-gray-50 p-8 border-r border-gray-200 h-full">
      <h2 className="text-2xl font-bold text-gray-800">Create an experience</h2>

      <nav className="mt-10 space-y-6">
        {steps.map(step => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${isCompleted ? 'bg-blue-600 border-blue-600' : ''}
                  ${isActive ? 'border-blue-600' : 'border-gray-300'}
                  ${!isCompleted && !isActive ? 'bg-white' : ''}
                `}
              >
                {isCompleted ? (
                  <CheckCircleIcon className="w-5 h-5 text-white" weight="bold" />
                ) : (
                  <span className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.number}
                  </span>
                )}
              </div>
              <span className={`ml-4 font-medium ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                {step.text}
              </span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default FormStepper;