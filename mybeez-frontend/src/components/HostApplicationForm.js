import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProgressBar = ({ currentStep, steps }) => {
    return (
        <div className="w-full mb-12">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center text-center w-1/4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index + 1 <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {index + 1}
                            </div>
                            <p className={`mt-2 text-sm ${index + 1 <= currentStep ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 ${index + 1 < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const HostApplicationForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        companyName: '',
        bio: '',
        agreedToTerms: false,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({}); // State to hold validation errors
    const [isSuccess, setIsSuccess] = useState(false);

    const steps = ["Details", "Verification", "Requirements", "Review"];

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrors({});

        const payload = { ...formData };

        axios.post('http://localhost:8080/api/host-onboarding/submit-application', payload)
            .then(response => {
                setMessage("Thank you! Your application is under review. You will be notified by email once it's approved.");
                setIsSuccess(true);
                setLoading(false);
            })
            .catch(error => {
                // --- THIS IS THE FIX ---
                if (error.response && error.response.status === 400) {
                    const backendErrors = {};
                    // Spring's default validation error response is an object, not an array.
                    // We need to check for the 'errors' property on the response data.
                    if (error.response.data && Array.isArray(error.response.data.errors)) {
                        error.response.data.errors.forEach(err => {
                            backendErrors[err.field] = err.defaultMessage;
                        });
                    } else if (typeof error.response.data === 'object') {
                        // Handle cases where the error response might be a simple map
                        for (const [key, value] of Object.entries(error.response.data)) {
                            if (key !== 'status' && key !== 'error' && key !== 'path') {
                                backendErrors[key] = value;
                            }
                        }
                    }
                    setErrors(backendErrors);
                    setMessage("Please fix the errors below and try again.");
                    setStep(1); // Go back to the first step to show the errors
                } else {
                    const resMessage = (error.response?.data?.message) || "An unexpected error occurred.";
                    setMessage(resMessage);
                }
                // --- END OF FIX ---
                setIsSuccess(false);
                setLoading(false);
            });
    };

    if (isSuccess) {
        return (
            <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-lg bg-white p-12 rounded-xl shadow-lg text-center">
                    <h2 className="text-3xl font-bold text-green-600 mb-4">Application Submitted!</h2>
                    <p className="text-gray-700">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            <div className="w-1/3 bg-indigo-700 text-white p-12 flex flex-col justify-center">
                <h1 className="text-4xl font-bold mb-4">Become a Mybeez Host</h1>
                <p className="text-lg text-indigo-200">Let's get you ready to host. It's simple—just follow our step-by-step guide.</p>
            </div>
            <div className="w-2/3 bg-gray-50 p-12 flex flex-col justify-center">
                <div className="w-full max-w-lg mx-auto">
                    <ProgressBar currentStep={step} steps={steps} />
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Host Details</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2" />
                                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2" />
                                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2" />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2" />
                                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                                </div>
                                <div className="mt-4">
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">About Me / Bio</label>
                                    <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} required className="mt-1 w-full border rounded-md p-2"></textarea>
                                    {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
                                </div>
                                <div className="flex justify-end mt-8"><button type="button" onClick={handleNext} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md">Next</button></div>
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">Identity Verification</h2>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg"><p className="text-sm text-yellow-800">Please upload a clear photo of your government-issued ID. This is for internal verification only.</p></div>
                                <div className="mb-8"><label htmlFor="idDocument" className="block text-sm font-medium text-gray-700">Upload ID Document</label><input type="file" name="idDocument" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"/></div>
                                <div className="flex justify-between"><button type="button" onClick={handleBack} className="bg-gray-200 font-bold py-2 px-6 rounded-md">Back</button><button type="button" onClick={handleNext} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md">Next</button></div>
                            </div>
                        )}
                        {step === 3 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">Host Requirements</h2>
                                <div className="space-y-4"><label className="flex items-start p-4 border rounded-lg"><input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} className="h-5 w-5 mt-1" /><div className="ml-3"><span className="font-medium">I will comply with all local laws and regulations.</span></div></label>
                                    {errors.agreedToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreedToTerms}</p>}
                                </div>
                                <div className="flex justify-between mt-8"><button type="button" onClick={handleBack} className="bg-gray-200 font-bold py-2 px-6 rounded-md">Back</button><button type="button" onClick={handleNext} className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md">Next</button></div>
                            </div>
                        )}
                        {step === 4 && (
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">Review Your Application</h2>
                                {message && <div className="mb-4 p-3 text-center text-sm text-red-800 bg-red-100 rounded-md">{message}</div>}
                                <div className="bg-white p-6 rounded-lg border space-y-4">
                                    <div><span className="font-semibold text-gray-500">Name:</span><p>{formData.firstName} {formData.lastName}</p></div>
                                    <hr/>
                                    <div><span className="font-semibold text-gray-500">Contact:</span><p>{formData.email} / {formData.phoneNumber}</p></div>
                                    <hr/>
                                    <div><span className="font-semibold text-gray-500">Agreed to Terms:</span><p className="text-green-600 font-semibold">{formData.agreedToTerms ? 'Yes' : 'No'}</p></div>
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button type="button" onClick={handleBack} className="bg-gray-200 font-bold py-2 px-6 rounded-md">Back</button>
                                    <button type="submit" disabled={loading} className="bg-green-600 text-white font-bold py-2 px-6 rounded-md">{loading ? 'Submitting...' : 'Agree and Submit'}</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HostApplicationForm;
