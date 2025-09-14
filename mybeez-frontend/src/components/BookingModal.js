import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';


import "react-datepicker/dist/react-datepicker.css";

// --- SVG ICONS ---
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372m-1.025-.372c.309-.126.6-.268.868-.428m-2.431 2.431a9.38 9.38 0 01-2.625-.372m6.055 2.411a9.385 9.385 0 01-2.625.372M3 19.128a9.38 9.38 0 012.625-.372m-1.025-.372c-.309-.126-.6-.268-.868-.428m2.431 2.431a9.38 9.38 0 002.625.372m-6.055 2.411a9.385 9.385 0 002.625.372m0 0a9.385 9.385 0 012.625.372m-2.625-.372a9.385 9.385 0 00-2.625.372M12 6.375c-1.036 0-1.875.84-1.875 1.875s.84 1.875 1.875 1.875 1.875-.84 1.875-1.875-.84-1.875-1.875-1.875z" /></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>);

// --- Animation Variants ---
const backdropVariants = { visible: { opacity: 1 }, hidden: { opacity: 0 } };
const modalVariants = { hidden: { y: "100vh", opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.3, type: "spring", damping: 25, stiffness: 200 } }, exit: { y: "100vh", opacity: 0, transition: { duration: 0.2 } } };

// --- Main Component ---
const BookingModal = ({ isOpen, onClose, experience }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('GROUP');
    const [groupAvailability, setGroupAvailability] = useState(null);
    const [privateAvailability, setPrivateAvailability] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [guestCount, setGuestCount] = useState(1);
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const dateRefs = useRef({});

    // Fetch data based on the active tab
    useEffect(() => {
        if (isOpen && experience?.id) {
            setIsLoading(true);
            setError(null);
            setSelectedSlotId(null); // Reset selection on tab change

            const endpoint = activeTab === 'GROUP' ? 'group' : 'private';

            axios.get(`/api/availability/${experience.id}/${endpoint}`)
                .then(response => {
                    if (activeTab === 'GROUP') {
                        setGroupAvailability(response.data);
                    } else {
                        setPrivateAvailability(response.data);
                    }
                })
                .catch(err => {
                    console.error(`Failed to fetch ${activeTab} availability:`, err);
                    setError("Could not load available times. Please try again later.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, experience, activeTab]);

    // --- Handlers ---
    const handleSelectSlot = (slot) => {
        setSelectedSlotId(prevId => prevId === slot.availabilityId ? null : slot.availabilityId);
        setGuestCount(1);
    };

    const handleJumpToDate = (date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        dateRefs.current[formattedDate]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setIsCalendarOpen(false);
    };

    const handleAddToCartAndRedirect = () => {
        if (!selectedSlotId) {
            alert("Please select a time slot.");
            return;
        }

        // 1. Find the full details of the selected slot
        const allSlots = (activeTab === 'GROUP' ? groupAvailability.availableDates : privateAvailability.availableDates)
            .flatMap(d => d.slots.map(s => ({ ...s, date: d.date })));
        const selectedSlot = allSlots.find(s => s.availabilityId === selectedSlotId);

        // 2. Determine price and final guest count
        const isGroup = activeTab === 'GROUP';
        const price = isGroup ? experience.groupPricePerPerson : experience.privatePrice;
        const finalGuestCount = isGroup ? guestCount : 1;

        // 3. Create the cart item object
        const cartItem = {
            experienceId: experience.id,
            title: experience.title,
            image: experience.images[0], // Use the cover image for the cart
            sessionType: activeTab,
            guestCount: finalGuestCount,
            pricePerItem: price,
            totalPrice: price * finalGuestCount,
            selectedSlot: {
                availabilityId: selectedSlot.availabilityId,
                date: selectedSlot.date,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
            }
        };

        // 4. Save to local storage
        localStorage.setItem('cart', JSON.stringify([cartItem]));

        // 5. Close the modal and redirect to the cart page
        onClose();
        navigate('/cart');
    };

    const currentAvailability = activeTab === 'GROUP' ? groupAvailability : privateAvailability;
    const allSlots = currentAvailability?.availableDates.flatMap(d => d.slots.map(s => ({ ...s, date: d.date }))) || [];
    const selectedSlot = allSlots.find(s => s.availabilityId === selectedSlotId);
    const maxGuests = selectedSlot ? selectedSlot.spotsLeft : 1;
    const availableDatesForPicker = currentAvailability?.availableDates.map(d => new Date(d.date)) || [];
    const firstAvailableMonth = currentAvailability?.availableDates.length > 0
        ? format(new Date(currentAvailability.availableDates[0].date), 'MMMM yyyy')
        : '';
    const price = activeTab === 'GROUP' ? experience.groupPricePerPerson : experience.privatePrice;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4" variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" onClick={onClose}>
                    <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" style={{ height: 'min(650px, 90vh)' }} variants={modalVariants} onClick={(e) => e.stopPropagation()}>
                        <header className="p-4 border-b flex-shrink-0 flex justify-between items-center"><h2 className="text-xl font-bold text-slate-800">Select a time</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><CloseIcon /></button></header>

                        <div className="p-6 flex-shrink-0">
                            <div className="flex border-b">
                                <TabButton icon={<UsersIcon />} isActive={activeTab === 'GROUP'} onClick={() => setActiveTab('GROUP')}>Group session</TabButton>
                                <TabButton icon={<UserIcon />} isActive={activeTab === 'PRIVATE'} onClick={() => setActiveTab('PRIVATE')}>Private session</TabButton>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex-grow overflow-y-auto relative">
                            {isLoading && <div className="text-center p-8">Loading...</div>}
                            {error && <div className="text-center p-8 text-red-500">{error}</div>}

                            {!isLoading && !error && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b pb-3 mb-3">
                                        <h3 className="font-bold text-lg text-slate-800">{firstAvailableMonth}</h3>
                                        <button onClick={() => setIsCalendarOpen(true)} className="p-2 rounded-full hover:bg-slate-100 text-slate-600" aria-label="Jump to date"><CalendarIcon /></button>
                                    </div>
                                    {currentAvailability?.availableDates.length > 0 ? (
                                        currentAvailability.availableDates.map(day => (
                                            <div key={day.date} ref={el => dateRefs.current[day.date] = el}>
                                                <h3 className="font-bold text-slate-700 mb-3 pt-4">{format(new Date(day.date), 'EEEE, d MMMM')}</h3>
                                                <div className="space-y-3">
                                                    {day.slots.map(slot => (
                                                        <Slot key={slot.availabilityId} slot={slot} price={price} sessionType={activeTab} isSelected={selectedSlotId === slot.availabilityId} onClick={() => handleSelectSlot(slot)} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : ( <p className="text-slate-500 text-center pt-8">No upcoming {activeTab.toLowerCase()} sessions available.</p> )}
                                </div>
                            )}
                        </div>

                        {selectedSlotId && activeTab === 'GROUP' && (
                            <div className="p-6 border-t flex-shrink-0">
                                <GuestSelector count={guestCount} onChange={(amount) => setGuestCount(prev => prev + amount)} maxGuests={maxGuests} />
                            </div>
                        )}

                        <footer className="p-4 bg-slate-50 border-t flex-shrink-0 flex justify-end">
                            <button onClick={handleAddToCartAndRedirect} disabled={!selectedSlotId || isLoading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors">
                                Add to Cart
                            </button>
                        </footer>
                    </motion.div>

                    {isCalendarOpen && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-10" onClick={() => setIsCalendarOpen(false)}>
                            <div onClick={(e) => e.stopPropagation()}>
                                <DatePicker selected={null} onChange={handleJumpToDate} includeDates={availableDatesForPicker} minDate={new Date()} inline calendarClassName="!border-slate-300 !shadow-2xl !rounded-2xl" />
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Child Components ---
const TabButton = ({ icon, children, isActive, onClick }) => ( <button onClick={onClick} className={`flex items-center justify-center w-1/2 pb-3 font-semibold transition-colors ${ isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700' }`}>{icon} {children}</button> );
const GuestSelector = ({ count, onChange, maxGuests }) => ( <div> <label className="font-semibold text-slate-800">Guests</label> <div className="flex items-center justify-between mt-2"> <span className="text-slate-600">Adults</span> <div className="flex items-center"> <button onClick={() => onChange(-1)} className="w-8 h-8 rounded-full border hover:bg-slate-100 disabled:opacity-50" disabled={count <= 1}>-</button> <span className="w-10 text-center font-bold">{count}</span> <button onClick={() => onChange(1)} className="w-8 h-8 rounded-full border hover:bg-slate-100 disabled:opacity-50" disabled={count >= maxGuests}>+</button> </div> </div> {count >= maxGuests && <p className="text-xs text-red-500 mt-1">Maximum number of guests reached.</p>} </div> );
const Slot = ({ slot, price, sessionType, isSelected, onClick }) => (
    <button onClick={onClick} disabled={slot.spotsLeft <= 0} className={`w-full text-left p-4 rounded-lg border-2 transition-all flex justify-between items-center ${ isSelected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-300 hover:border-slate-400' } disabled:bg-slate-50 disabled:cursor-not-allowed disabled:hover:border-slate-300`}>
        <div>
            <p className="font-bold text-slate-800">{format(new Date(`1970-01-01T${slot.startTime}`), 'p')} - {format(new Date(`1970-01-01T${slot.endTime}`), 'p')}</p>
            <p className="text-sm text-slate-600">£{price?.toFixed(2)}{sessionType === 'GROUP' ? '/guest' : ''}</p>
        </div>
        <div>
            {slot.spotsLeft > 0 ? (
                sessionType === 'GROUP' && <span className="text-sm font-semibold text-blue-600">{slot.spotsLeft} spots left</span>
            ) : (
                <span className="text-sm font-semibold text-red-600">Sold out</span>
            )}
        </div>
    </button>
);

export default BookingModal;

