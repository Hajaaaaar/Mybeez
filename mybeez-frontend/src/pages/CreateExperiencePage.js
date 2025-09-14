import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormStepper from '../components/FormStepper';
import Basics from '../components/form_steps/Basics';
import Itinerary from '../components/form_steps/Itinerary';
import Photos from '../components/form_steps/Photos';
import PricingAndAvailability from '../components/form_steps/PricingAndAvailability';
import Publish from '../components/form_steps/Publish';
import ExperienceService from '../services/experience.service';
// Imports the arrayMove utility for reordering.
import { arrayMove } from '@dnd-kit/sortable';
import {toast} from "react-toastify";

const CreateExperiencePage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const navigate = useNavigate();
  const mainContentRef = useRef(null);

  const [masterFormData, setMasterFormData] = useState({
    basics: { title: '', category: { id: null, name: '' }, tags: [] },
    itinerary: { description: '', location: '', duration: '1' },
    photos: [],
    pricing: { sessionTypes: [], groupPricePerPerson: '', privatePrice: '', availabilitySlots: [] },
  });

  // Effect to scroll the main content area to the top on step change.
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [currentStep]);

  // Effect to fetch existing experience data when in edit mode.
  useEffect(() => {
    if (isEditMode) {
      ExperienceService.getExperienceForEdit(id)
          .then(response => {
            const exp = response.data;
            setMasterFormData({
              basics: { title: exp.title, category: exp.category, tags: exp.tags || [] },
              itinerary: {
                description: exp.description,
                location: exp.location?.address || '',
                duration: (exp.durationInMinutes / 60).toString(),
              },
              photos: exp.images || [],
              pricing: {
                sessionTypes: exp.sessionTypes || [],
                groupPricePerPerson: exp.groupPricePerPerson || '',
                privatePrice: exp.privatePrice || '',
                availabilitySlots: exp.availability?.map(a => ({
                  id: a.id,
                  date: a.date,
                  startTime: a.startTime,
                  endTime: a.endTime,
                  capacity: a.capacity
                })) || [],
              },
            });
            setIsLoading(false);
          })
          .catch(error => {
            console.error("Failed to fetch experience for editing:", error);
            setIsLoading(false);
            navigate('/host/dashboard');
          });
    }
  }, [id, isEditMode, navigate]);

  const handleNext = () => currentStep < 5 && setCurrentStep(prev => prev + 1);
  const handleBack = () => currentStep > 1 && setCurrentStep(prev => prev - 1);

  const handleMasterChange = (stepName, event) => {
    const { name, value } = event.target;
    setMasterFormData(prev => ({
      ...prev,
      [stepName]: { ...prev[stepName], [name]: value },
    }));
  };

  const handleCategorySelect = (categoryObject) => {
    setMasterFormData(prev => ({
      ...prev,
      basics: { ...prev.basics, category: categoryObject },
    }));
  };

  // This handler is now simplified to only perform the array move,
  // making it independent of the child component's internal logic.
  const handlePhotoReorder = (oldIndex, newIndex) => {
    setMasterFormData((prev) => ({
      ...prev,
      photos: arrayMove(prev.photos, oldIndex, newIndex),
    }));
  };

  const addMediaItem = (itemData) => {
    setMasterFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...Array.from(itemData)]
    }));
  };

  // This handler correctly removes an item from the photos array by its index.
  const deleteMediaItem = (indexToRemove) => {
    setMasterFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSessionTypeChange = (sessionType) => {
    setMasterFormData(prev => {
      const currentTypes = prev.pricing.sessionTypes;
      const newTypes = currentTypes.includes(sessionType)
          ? currentTypes.filter(type => type !== sessionType)
          : [...currentTypes, sessionType];
      return { ...prev, pricing: { ...prev.pricing, sessionTypes: newTypes } };
    });
  };

  const addAvailabilitySlot = (slot) => {
    setMasterFormData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, availabilitySlots: [...prev.pricing.availabilitySlots, slot] },
    }));
  };

  const deleteAvailabilitySlot = (indexToRemove) => {
    setMasterFormData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, availabilitySlots: prev.pricing.availabilitySlots.filter((_, i) => i !== indexToRemove) },
    }));
  };

  const handleUpdateSlot = (indexToUpdate, field, value) => {
    setMasterFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        availabilitySlots: prev.pricing.availabilitySlots.map((slot, i) =>
            i === indexToUpdate ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let successMessage = '';
      if (isEditMode) {
        await ExperienceService.updateExperience(id, masterFormData);
        successMessage = 'Experience updated successfully!';
      } else {
        await ExperienceService.createExperience(masterFormData);
        successMessage = 'Experience submitted for approval!';
      }

      toast.success(successMessage);

      // Delays navigation to allow the user to see the success toast.
      setTimeout(() => {
        navigate('/host/experiences/pending');
      }, 4000); // 2000 milliseconds = 2 seconds

    } catch (err) {
      console.error("Submission failed:", err);
      const errorMessage = err.response?.data?.message || 'Something went wrong during submission.';
      toast.error(errorMessage);
    } finally {
      // Delays resetting the submitting state to prevent button re-enabling during the redirect delay.
      setTimeout(() => {
        setIsSubmitting(false);
      }, 4000);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Basics formData={masterFormData.basics} handleChange={(e) => handleMasterChange('basics', e)} handleCategorySelect={handleCategorySelect} onNext={handleNext} />;
      case 2:
        return <Itinerary formData={masterFormData.itinerary} handleChange={(e) => handleMasterChange('itinerary', e)} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Photos
            mediaItems={masterFormData.photos}
            onFileUpload={addMediaItem}
            onFileRemove={deleteMediaItem}
            onPhotoReorder={handlePhotoReorder}
            onNext={handleNext}
            onBack={handleBack}
        />;
      case 4:
        return <PricingAndAvailability formData={masterFormData.pricing} durationInHours={masterFormData.itinerary.duration} handleChange={(e) => handleMasterChange('pricing', e)} handleSessionTypeChange={handleSessionTypeChange} addAvailabilitySlot={addAvailabilitySlot} deleteAvailabilitySlot={deleteAvailabilitySlot} handleUpdateSlot={handleUpdateSlot} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <Publish formData={masterFormData} isSubmitting={isSubmitting} onSubmit={handleFinalSubmit} onBack={handleBack} isEditMode={isEditMode} />;
      default:
        return <Basics formData={masterFormData.basics} handleChange={(e) => handleMasterChange('basics', e)} handleCategorySelect={handleCategorySelect} onNext={handleNext} />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading experience data...</p></div>;
  }

  const totalSteps = 5;

  return (
      <div className="flex h-[90vh] bg-white">
        <FormStepper currentStep={currentStep} totalSteps={totalSteps} />
        <main ref={mainContentRef} className="flex-1 sm:p-12 overflow-y-auto">
          {renderCurrentStep()}
        </main>
      </div>
  );
};

export default CreateExperiencePage;