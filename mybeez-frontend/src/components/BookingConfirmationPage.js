import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import AuthService from '../services/auth.service';

// --- Helper Icon Component ---
const StarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-yellow-500"><path d="M8 1.75a.75.75 0 01.692.462l1.41 3.393 3.663.413a.75.75 0 01.416 1.298l-2.734 2.392.733 3.59a.75.75 0 01-1.1.805L8 11.616l-3.28 1.96a.75.75 0 01-1.1-.805l.732-3.59-2.734-2.392a.75.75 0 01.416-1.298l3.663-.413 1.41-3.393A.75.75 0 018 1.75z" /></svg>);

// --- Combined Login/Signup Form Component ---
const AuthForm = ({ onLoginSuccess, onAuthChange }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (activeTab === 'login') {
            AuthService.login(email, password)
                .then(() => {
                    onAuthChange(); // Notify App.js of the change
                    onLoginSuccess();
                })
                .catch(err => {
                    setError("Login failed. Please check your credentials.");
                    setIsLoading(false);
                });
        } else { // Signup logic
            AuthService.signup(firstName, lastName, email, password)
                .then(() => {
                    AuthService.login(email, password)
                        .then(() => {
                            onAuthChange(); // Notify App.js of the change
                            onLoginSuccess();
                        });
                })
                .catch(err => {
                    setError(err.response?.data?.message || "Registration failed. Please try again.");
                    setIsLoading(false);
                });
        }
    };

    return (
        <div className="border rounded-2xl p-6">
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('login')}
                    className={`w-1/2 pb-3 font-semibold transition-colors ${activeTab === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}
                >
                    Log in
                </button>
                <button
                    onClick={() => setActiveTab('signup')}
                    className={`w-1/2 pb-3 font-semibold transition-colors ${activeTab === 'signup' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}
                >
                    Sign up
                </button>
            </div>
            <h2 className="text-xl font-bold mb-4">
                {activeTab === 'login' ? 'Log in to continue' : 'Create an account to book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'signup' && (
                    <>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" required className="w-full p-3 border rounded-lg" />
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" required className="w-full p-3 border rounded-lg" />
                    </>
                )}
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full p-3 border rounded-lg" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full p-3 border rounded-lg" />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
                    {isLoading ? 'Processing...' : 'Continue'}
                </button>
            </form>
        </div>
    );
};


// --- Main Confirmation Page Component ---
const BookingConfirmationPage = ({ onAuthChange }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [bookingDetails, setBookingDetails] = useState(null);
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());

    useEffect(() => {
        if (location.state?.bookingDetails) {
            setBookingDetails(location.state.bookingDetails);
        } else {
            navigate('/');
        }
    }, [location, navigate]);

    const finalizeBooking = (user) => {
        const { selectedSlot, guestCount, sessionType } = bookingDetails;
        const finalGuestCount = sessionType === 'PRIVATE' ? 1 : guestCount;
        const bookingRequest = { availabilityId: selectedSlot.availabilityId, numberOfGuests: finalGuestCount };
        const headers = { 'Authorization': `Bearer ${user.accessToken}` };

        axios.post('/api/bookings', bookingRequest, { headers })
            .then(() => {
                alert('Booking Confirmed!');
                // For now navigate back to the experience page, later to cart page
                navigate(`/experience/${bookingDetails.experience.id}`);
            })
            .catch(err => {
                alert(`Booking failed: ${err.response?.data?.message || 'An error occurred.'}`);
                navigate(`/experience/${bookingDetails.experience.id}`);
            });
    };

    // Function called after a successful login/signup from the AuthForm
    const handleLoginSuccess = () => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
    };

    if (!bookingDetails) {
        return <div>Loading...</div>;
    }

    const { experience, selectedSlot, guestCount, sessionType } = bookingDetails;
    const isGroup = sessionType === 'GROUP';
    const price = isGroup ? experience.groupPricePerPerson : experience.privatePrice;
    const totalPrice = isGroup ? price * guestCount : price;

    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <button onClick={() => navigate(-1)} className="mb-8 font-semibold">&larr; Back</button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <main>
                    {currentUser ? (
                        <div className="border rounded-2xl p-6">
                            <h2 className="text-2xl font-bold mb-4">Confirm and pay</h2>
                            <p className="mb-6">Please review your booking details below and click confirm to proceed.</p>
                            <button
                                onClick={() => finalizeBooking(currentUser)}
                                className="w-full py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    ) : (
                        <AuthForm onLoginSuccess={handleLoginSuccess} onAuthChange={onAuthChange} />
                    )}
                </main>
                <aside className="sticky top-28">
                    <div className="border border-slate-200/80 rounded-2xl p-6 space-y-4">
                        <div className="flex items-start space-x-4">
                            <img src={experience.images[0]} alt={experience.title} className="w-24 h-24 rounded-lg object-cover" />
                            <div>
                                <h3 className="font-bold text-slate-800">{experience.title}</h3>
                                <div className="flex items-center text-sm text-slate-600 mt-1">
                                    <StarIcon />
                                    <span className="ml-1 font-semibold">{experience.rating.toFixed(1)}</span>
                                    <span className="ml-1">({experience.reviews.length} reviews)</span>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Your booking details</h4>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex justify-between"><span>Date:</span> <span className="font-medium text-slate-800">{format(new Date(selectedSlot.date), 'EEEE, d MMMM yyyy')}</span></div>
                                <div className="flex justify-between"><span>Time:</span> <span className="font-medium text-slate-800">{format(new Date(`1970-01-01T${selectedSlot.startTime}`), 'p')}</span></div>
                                <div className="flex justify-between"><span>Guests:</span> <span className="font-medium text-slate-800">{guestCount} adult{guestCount > 1 ? 's' : ''}</span></div>
                            </div>
                        </div>
                        <hr />
                        <div>
                            <h4 className="font-semibold text-slate-800 mb-2">Price details</h4>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex justify-between">
                                    <span>{isGroup ? `£${price.toFixed(2)} x ${guestCount} adult(s)` : 'Private session fee'}</span>
                                    <span>£{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-800 pt-2 border-t mt-2">
                                    <span>Total (GBP)</span>
                                    <span>£{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default BookingConfirmationPage;
