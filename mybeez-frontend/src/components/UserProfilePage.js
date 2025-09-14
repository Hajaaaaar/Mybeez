import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserService from '../services/user.service';
import axios from 'axios';
import authHeader from '../services/auth-header';

const UserProfilePage = () => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [profile, setProfile] = useState(null);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({});
    const firstNameInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = UserService.getProfile();
        const fetchBookings = axios.get('/api/bookings/my-bookings', { headers: authHeader() });

        Promise.all([fetchProfile, fetchBookings])
            .then(([profileResponse, bookingsResponse]) => {
                setProfile(profileResponse.data);
                setMyBookings(bookingsResponse.data);
            })
            .catch(err => {
                console.error("Failed to load profile or bookings", err);
                setError('Failed to load your data. Please try refreshing.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (profile) {
            setFormData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                ...(profile.userProfile || {})
            });
        }
    }, [profile]);

    useEffect(() => {
        if (isEditMode && firstNameInputRef.current) {
            firstNameInputRef.current.focus();
        }
    }, [isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const { firstName, lastName, ...profileData } = formData;
        UserService.updateProfile(profileData)
            .then(response => {
                setProfile(prev => ({ ...prev, userProfile: response.data }));
                setIsEditMode(false);
            })
            .catch(err => {
                console.error("Failed to save profile", err);
            });
    };

    if (loading) return <div className="p-8 text-center">Loading profile and bookings...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!profile) return null;

    return (
        <div className="bg-gray-50 p-4 sm:p-8">
            {isEditMode ? (
                <EditProfileView
                    formData={formData}
                    handleChange={handleChange}
                    handleSave={handleSave}
                    setIsEditMode={setIsEditMode}
                    firstInputRef={firstNameInputRef}
                />
            ) : (
                <ViewProfileView profile={profile} bookings={myBookings} setIsEditMode={setIsEditMode} />
            )}
        </div>
    );
};

const ViewProfileView = ({ profile, bookings, setIsEditMode }) => {
    const userProfile = profile.userProfile || {};

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            <aside className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="text-center">
                        <img className="h-28 w-28 rounded-full object-cover mx-auto" src={userProfile.profilePictureUrl || 'https://placehold.co/128x128/EFEFEF/AAAAAA?text=User'} alt={`Profile of ${profile.firstName}`} />
                        <h1 className="text-2xl font-bold text-gray-800 mt-4">{profile.firstName} {profile.lastName}</h1>
                        <p className="text-sm text-gray-500">{userProfile.location || 'Location not set'}</p>
                        <button onClick={() => setIsEditMode(true)} className="w-full mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                            Edit Profile
                        </button>
                    </div>
                    <hr className="my-6 border-gray-200" />
                    <section aria-labelledby="about-me-heading">
                        <h2 id="about-me-heading" className="text-lg font-semibold text-gray-800">About Me</h2>
                        <p className="text-sm text-gray-600 mt-2">{userProfile.aboutMe || 'No bio provided.'}</p>
                    </section>
                    <hr className="my-6 border-gray-200" />
                    <section aria-labelledby="social-connections-heading">
                        <h2 id="social-connections-heading" className="text-lg font-semibold text-gray-800">Social Connections</h2>
                        <ul className="mt-2 space-y-2">
                            <li><a href={userProfile.linkedinProfileUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline block">LinkedIn Profile</a></li>
                            <li><a href={userProfile.instagramProfileUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline block">Instagram Profile</a></li>
                        </ul>
                    </section>
                </div>
            </aside>

            <main className="lg:col-span-2 space-y-8">
                {userProfile.idVerificationStatus !== 'VERIFIED' && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex items-center gap-3">
                        <svg aria-hidden="true" className="h-6 w-6 text-yellow-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-sm text-yellow-800">
                            Increase trust within the Mybeez community by verifying your identity.
                            <Link to="/verify-identity" className="font-bold hover:underline ml-1">Verify Your Identity.</Link>
                        </p>
                    </div>
                )}
                <section aria-labelledby="personal-details-heading" className="bg-white rounded-xl shadow-md p-6">
                    <h2 id="personal-details-heading" className="text-xl font-bold text-gray-800 mb-4">Personal Details</h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                        <div><dt className="text-gray-500">Email Address</dt><dd className="text-gray-800 font-medium">{profile.email}</dd></div>
                        <div><dt className="text-gray-500">Mobile Number</dt><dd className="text-gray-800 font-medium">{userProfile.mobileNumber || 'Not provided'}</dd></div>
                        <div><dt className="text-gray-500">Address</dt><dd className="text-gray-800 font-medium">{userProfile.address || 'Not provided'}</dd></div>
                        <div><dt className="text-gray-500">Date of Birth</dt><dd className="text-gray-800 font-medium">{userProfile.dateOfBirth || 'Not provided'}</dd></div>
                    </dl>
                </section>
                <section aria-labelledby="my-bookings-heading" className="bg-white rounded-xl shadow-md p-6">
                    <h2 id="my-bookings-heading" className="text-xl font-bold text-gray-800 mb-4">My Bookings</h2>
                    {bookings && bookings.length > 0 ? (
                        <ul className="space-y-4">
                            {bookings.map((booking) => (
                                <li key={booking.bookingId} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                                    <img
                                        className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                                        src={booking.experience.images?.[0] || 'https://placehold.co/150x150/EFEFEF/AAAAAA?text=Experience'}
                                        alt={`Image for ${booking.experience.title}`}
                                    />
                                    <div className="flex-grow">
                                        <Link to={`/experience/${booking.experience.id}`} className="font-semibold text-gray-800 hover:text-indigo-600 hover:underline">
                                            {booking.experience.title}
                                        </Link>
                                        <p className="text-sm text-gray-500">Hosted by {booking.experience.host.firstName}</p>
                                        <p className="text-sm text-gray-600 font-medium">{booking.bookingDate} at {booking.bookingTime}</p>
                                        <p className="text-sm text-gray-500">Guests: {booking.numberOfGuests}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">You have no upcoming bookings. <Link to="/experience" className="text-indigo-600 font-semibold hover:underline">Time to explore!</Link></p>
                    )}
                </section>
            </main>
        </div>
    );
};

const EditProfileView = ({ formData, handleChange, handleSave, setIsEditMode, firstInputRef }) => {
    const [isSaving, setIsSaving] = useState(false);

    const onSave = (e) => {
        setIsSaving(true);
        handleSave(e);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <form onSubmit={onSave} className="bg-white rounded-xl shadow-md p-8 space-y-6">
                <h1 className="text-2xl font-bold text-gray-800">Edit Your Profile</h1>
                <div className="text-center">
                    <img className="h-28 w-28 rounded-full object-cover mx-auto" src={formData.profilePictureUrl || 'https://placehold.co/128x128/EFEFEF/AAAAAA?text=User'} alt="Profile" />
                    <button type="button" className="mt-2 text-sm font-medium text-indigo-600 hover:underline">Change Picture</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label><input type="text" id="firstName" name="firstName" ref={firstInputRef} value={formData.firstName} disabled className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" /></div>
                    <div><label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label><input type="text" id="lastName" name="lastName" value={formData.lastName} disabled className="mt-1 w-full border border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed" /></div>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" id="location" name="location" value={formData.location || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="e.g., Cardiff, UK" />
                </div>
                <div><label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label><input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" /></div>
                <div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label><input type="text" id="address" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" /></div>
                <div><label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label><input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" /></div>
                <div><label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700">About Me</label><textarea id="aboutMe" name="aboutMe" rows="4" value={formData.aboutMe || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2"></textarea></div>
                <div><label htmlFor="linkedinProfileUrl" className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label><input type="url" id="linkedinProfileUrl" name="linkedinProfileUrl" value={formData.linkedinProfileUrl || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="https://www.linkedin.com/in/..." /></div>
                <div><label htmlFor="instagramProfileUrl" className="block text-sm font-medium text-gray-700">Instagram Profile URL</label><input type="url" id="instagramProfileUrl" name="instagramProfileUrl" value={formData.instagramProfileUrl || ''} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md p-2" placeholder="https://www.instagram.com/..." /></div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsEditMode(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default UserProfilePage;