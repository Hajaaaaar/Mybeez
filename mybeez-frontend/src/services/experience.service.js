import axios from 'axios';
import api from './api';

// Create experience with image upload
const createExperience = async (masterFormData) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;

  // Upload all images to Cloudinary
  const uploadPromises = masterFormData.photos.map(async (file) => {
    const { data: signData } = await api.post('/cloudinary/sign');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', signData.timestamp);
    formData.append('signature', signData.signature);
    formData.append('transformation', 'w_1920,q_auto,f_auto');

    // Direct axios call to Cloudinary (no auth headers)
    const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData);
    return { url: response.data.secure_url, publicId: response.data.public_id };
  });

  const uploadedImages = await Promise.all(uploadPromises);

  // Prepare payload for backend
  const finalPayload = {
    title: masterFormData.basics.title,
    description: masterFormData.itinerary.description,
    locationRequest: {
      address: masterFormData.itinerary.location,
      city: 'Default City',
      postcode: 'Default Postcode',
    },
    durationInMinutes: parseInt(masterFormData.itinerary.duration, 10) * 60,
    categoryId: masterFormData.basics.category.id,
    sessionTypes: masterFormData.pricing.sessionTypes,
    groupPricePerPerson: masterFormData.pricing.groupPricePerPerson || null,
    privatePrice: masterFormData.pricing.privatePrice || null,
    images: uploadedImages,
    availableSlots: masterFormData.pricing.availabilitySlots,
    tags: masterFormData.basics.tags || [],
  };

  return api.post('/experiences', finalPayload);
};

const getHostExperiencesByStatus = (status) => {
  return api.get('/experiences/host-experiences', {
    params: { status }
  });
};

const getAllExperiences = () => {
  return api.get('/experiences');
};

const getExperienceById = (id) => {
  return api.get(`/experiences/${id}`);
};

const getExperienceForEdit = (id) => {
  return api.get(`/experiences/host/${id}`);
};

// Update experience with full image management
const updateExperience = async (id, masterFormData) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.REACT_APP_CLOUDINARY_API_KEY;

  // Get original images to compare what was removed
  const originalResponse = await api.get(`/experiences/host/${id}`);
  const originalImages = originalResponse.data.images || [];

  // Identify current vs original image URLs
  const currentImageUrls = masterFormData.photos
      .filter(item => !(item instanceof File))
      .map(item => typeof item === 'string' ? item : item.url);

  const originalImageUrls = originalImages.map(img => img.url);

  // Find images that were removed
  const removedImages = originalImages.filter(
      originalImg => !currentImageUrls.includes(originalImg.url)
  );

  // Delete removed images from Cloudinary
  if (removedImages.length > 0) {
    for (const removedImg of removedImages) {
      if (removedImg.publicId) {
        try {
          const { data: deleteSignData } = await api.post('/cloudinary/delete-sign', {
            publicId: removedImg.publicId
          });

          const deleteFormData = new FormData();
          deleteFormData.append('public_id', removedImg.publicId);
          deleteFormData.append('api_key', apiKey);
          deleteFormData.append('timestamp', deleteSignData.timestamp);
          deleteFormData.append('signature', deleteSignData.signature);

          // Direct axios call to Cloudinary (no auth headers)
          await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, deleteFormData);
        } catch (error) {
          console.error('Failed to delete from Cloudinary:', removedImg.publicId, error);
        }
      }
    }
  }

  // Process current images in order
  const processedImages = [];

  for (const item of masterFormData.photos) {
    if (item instanceof File) {
      // Upload new file to Cloudinary
      try {
        const { data: signData } = await api.post('/cloudinary/sign');

        const formData = new FormData();
        formData.append('file', item);
        formData.append('api_key', apiKey);
        formData.append('timestamp', signData.timestamp);
        formData.append('signature', signData.signature);
        formData.append('transformation', 'w_1920,q_auto,f_auto');

        // Direct axios call to Cloudinary (no auth headers)
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData);

        processedImages.push({
          url: response.data.secure_url,
          publicId: response.data.public_id
        });
      } catch (error) {
        console.error('Failed to upload:', item.name, error);
        throw new Error(`Failed to upload ${item.name}`);
      }
    } else {
      // Keep existing image
      const existingImage = typeof item === 'string'
          ? { url: item, publicId: null }
          : { url: item.url, publicId: item.publicId || null };

      processedImages.push(existingImage);
    }
  }

  const payload = {
    title: masterFormData.basics.title,
    description: masterFormData.itinerary.description,
    locationRequest: {
      address: masterFormData.itinerary.location || "",
      city: null,
      postcode: null,
    },
    durationInMinutes: parseInt(masterFormData.itinerary.duration, 10) * 60,
    categoryId: masterFormData.basics.category.id,
    sessionTypes: masterFormData.pricing.sessionTypes,
    groupPricePerPerson: masterFormData.pricing.groupPricePerPerson || null,
    privatePrice: masterFormData.pricing.privatePrice || null,
    tags: masterFormData.basics.tags || [],
    images: processedImages,
    availableSlots: masterFormData.pricing.availabilitySlots,
  };

  return api.put(`/experiences/host/${id}`, payload);
};

const ExperienceService = {
  createExperience,
  getHostExperiencesByStatus,
  getAllExperiences,
  getExperienceById,
  getExperienceForEdit,
  updateExperience,
};

export default ExperienceService;