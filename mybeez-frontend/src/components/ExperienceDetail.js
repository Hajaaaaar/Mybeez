import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import WishlistService from '../services/wishlist.service';
import AuthService from '../services/auth.service';
import BookingModal from './BookingModal';
import MessageHostModal from './MessageHostModal';
import ReviewModal from './ReviewModal';

const StarIcon = ({ className = 'w-5 h-5' }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}><path fillRule="evenodd" d="M8 1.75a.75.75 0 01.692.462l1.41 3.393 3.663.413a.75.75 0 01.416 1.298l-2.734 2.392.733 3.59a.75.75 0 01-1.1.805L8 11.616l-3.28 1.96a.75.75 0 01-1.1-.805l.732-3.59-2.734-2.392a.75.75 0 01.416-1.298l3.663-.413 1.41-3.393A.75.75 0 018 1.75z" clipRule="evenodd" /></svg>);
const MapPinIcon = ({ className = 'w-5 h-5' }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg> );
const MedalIcon = ({ className = 'w-5 h-5' }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>);
const DoorIcon = ({ className = 'w-5 h-5' }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0-3-3m0 0l3-3m-3 3H15" /></svg>);
const CalendarIcon = ({ className = 'w-5 h-5' }) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>);
const ClockIcon = ({ className = 'w-5 h-5' }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const Header = ({ title, rating, reviewsCount, location, duration }) => (
    <div className="flex-grow mb-8">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
                   className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800">
            {title}
        </motion.h1>
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1, ease: "easeOut"}}
                    className="mt-3 flex flex-wrap items-center text-slate-600 font-semibold space-x-4">
            <div className="flex items-center"><StarIcon className="w-5 h-5 mr-1.5 text-yellow-500"/>
                {rating != null ? `${rating.toFixed(1)} (${reviewsCount} reviews)` : 'New'}</div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center"><MapPinIcon className="w-5 h-5 mr-1.5"/>{location}</div>
            <span className="text-slate-300">·</span>
            <div className="flex items-center"><ClockIcon className="w-5 h-5 mr-1.5"/>{duration} minutes</div>
        </motion.div>
    </div>
);

const ImageGallery = ({ images = [] }) => {
    if (!images || images.length === 0) return null;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[450px]">
            <motion.div variants={itemVariants} className="col-span-2 row-span-2 rounded-2xl overflow-hidden shadow-2xl">
                <img src={images[0]} alt="Main experience" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
            </motion.div>
            {images[1] && (
                <motion.div variants={itemVariants} className="rounded-2xl overflow-hidden shadow-2xl">
                    <img src={images[1]} alt="Experience view 2" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                </motion.div>
            )}
            {images[2] && (
                <motion.div variants={itemVariants} className="rounded-2xl overflow-hidden shadow-2xl">
                    <img src={images[2]} alt="Experience view 3" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                </motion.div>
            )}
            {images[3] && (
                <motion.div variants={itemVariants} className="col-span-2 rounded-2xl overflow-hidden shadow-2xl">
                    <img src={images[3]} alt="Experience view 4" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                </motion.div>
            )}
        </motion.div>
    );
};

const BookingCard = ({ groupPrice, privatePrice, rating, host, onCheckAvailabilityClick }) => (
    <aside className="sticky top-28">
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                    className="border border-slate-200/80 rounded-2xl shadow-2xl bg-white p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-3xl font-black text-slate-900">£{groupPrice?.toFixed(2)}</span>
                    <span className="text-slate-600 ml-1 font-medium">/ person</span>
                </div>
                <div className="flex items-center font-bold text-indigo-800">
                    <StarIcon className="w-5 h-5 mr-1.5 text-yellow-500" />
                    {rating != null ? rating.toFixed(1) : '-'}
                </div>
            </div>

            {privatePrice && (
                <div className="text-center text-sm text-slate-600 py-3 border-t border-b border-slate-200/80 my-2">
                    Or book a private session for <span className="font-bold text-slate-800">£{privatePrice.toFixed(2)}</span>
                </div>
            )}

            {host && (
                <div className="mt-4 mb-5">
                    <h3 className="font-semibold text-lg text-slate-800">
                        Hosted by <span className="text-indigo-700">{host.firstName} {host.lastName}</span>
                    </h3>
                </div>
            )}

            <motion.button
                onClick={onCheckAvailabilityClick}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="mt-auto w-full py-4 text-white font-bold text-lg rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
            >
                Check Availability
            </motion.button>
        </motion.div>
    </aside>
);

const InfoBlock = ({ icon, title, children }) => (
    <motion.div variants={itemVariants} className="flex items-start space-x-4 py-5">
        <div className="flex-shrink-0 text-indigo-600">{icon}</div>
        <div>
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{children}</p>
        </div>
    </motion.div>
);

const HostProfile = ({ host, onMessageClick }) => {
    if (!host) return null;
    const baseUrl = window.location.origin;

    return (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants}
                        className="py-12">
            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-indigo-800 mb-6 text-center">Meet Your Host</motion.h2>
            <motion.div variants={itemVariants}
                        className="relative max-w-2xl mx-auto bg-white p-6 rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
                <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-gradient-to-tr from-blue-100 to-indigo-100/50 rounded-full opacity-50 blur-2xl"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center">
                    <img src={`${baseUrl}${host.profilePictureUrl}`} alt={host.firstName} className="h-24 w-24 rounded-2xl object-cover flex-shrink-0 mb-6 sm:mb-0 sm:mr-6 border-4 border-white shadow-lg" />
                    <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold text-slate-800">{host.firstName}</h3>
                        <p className="mt-2 text-base text-slate-600 leading-relaxed text-justify">{host.summary}</p>
                        <motion.button onClick={onMessageClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                       className="mt-4 font-semibold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-5 py-2 rounded-lg transition-colors duration-300 text-sm">
                            Message Host
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
};

const ReviewCard = ({ review }) => (
    <motion.div variants={itemVariants} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-slate-300'}`} />
            ))}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-3">"{review.reviewText}"</p>
        <p className="font-semibold text-xs text-slate-800">{review.reviewerName}</p>
    </motion.div>
);

const ExperienceDetail = ({ onAuthChange }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [experience, setExperience] = useState(null);
    const [error, setError] = useState(null);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const [wishlist, setWishlist] = useState([]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentUser] = useState(AuthService.getCurrentUser());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

    const handleReviewModalOpen = () => setIsReviewModalOpen(true);
    const handleReviewModalClose = () => setIsReviewModalOpen(false);

    const handleLeaveReviewClick = () => {
        if (currentUser && (currentUser.role === 'USER' || currentUser.role === 'HOST')) {
            handleReviewModalOpen();
        } else {
            setIsLoginPromptOpen(true);
        }
    };

    const goToLogin = () => {
        setIsLoginPromptOpen(false);
        const redirect = encodeURIComponent(location.pathname + location.search + '#guest-reviews');
        navigate(`/login?redirect=${redirect}`);
    };

    useEffect(() => {
        axios.get(`/api/experiences/${id}`)
            .then((res) => { setExperience(res.data); })
            .catch(() => setError('Experience not found'));
    }, [id]);

    useEffect(() => {
        if (currentUser) {
            WishlistService.getWishlist().then(response => {
                if (Array.isArray(response.data)) setWishlist(response.data);
            }).catch(err => console.error("Could not fetch wishlist", err));
        }
    }, [currentUser]);

    useEffect(() => {
        if (experience && Array.isArray(wishlist)) {
            const wished = wishlist.some(item => item.experienceId === experience.id);
            setIsWishlisted(wished);
        }
    }, [wishlist, experience]);

    const handleWishlistToggle = () => {
        if (!currentUser) {
            alert("Please log in to add items to your wishlist.");
            return;
        }
        if (isWishlisted) {
            const wishlistItem = wishlist.find(item => item.experienceId === experience.id);
            if (wishlistItem) {
                WishlistService.removeFromWishlist(wishlistItem.wishlistItemId).then(() => {
                    setIsWishlisted(false);
                    setWishlist(prev => prev.filter(item => item.wishlistItemId !== wishlistItem.wishlistItemId));
                });
            }
        } else {
            WishlistService.addToWishlist(experience.id).then(() => {
                setIsWishlisted(true);
                WishlistService.getWishlist().then(res => {
                    if (Array.isArray(res.data)) setWishlist(res.data);
                });
            });
        }
    };

    if (error) return <div className="text-center py-20 text-red-600 font-semibold">{error}</div>;

    const displayedReviews = experience ? (showAllReviews ? experience.reviews : experience.reviews.slice(0, 6)) : [];

    return (
        <>
            <AnimatePresence>
                {!experience ? (
                    <motion.div key="loader" exit={{ opacity: 0 }} className="text-center py-40 font-semibold text-slate-400">Loading...</motion.div>
                ) : (
                    <motion.main key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-50 font-sans">
                        <div className="max-w-7xl mx-auto px-6 py-16">
                            <div className="flex justify-between items-start">
                                <Header
                                    title={experience.title}
                                    rating={experience.rating}
                                    reviewsCount={experience.reviews.length}
                                    location={experience.location}
                                    duration={experience.durationInMinutes}
                                />
                                {currentUser && (
                                    <motion.button
                                        onClick={handleWishlistToggle}
                                        whileHover={{scale: 1.1}}
                                        whileTap={{scale: 0.9}}
                                        className="p-3 rounded-full bg-white/50 backdrop-blur-sm shadow-lg hover:bg-red-50 transition-colors duration-300 mt-4 border ml-4"
                                        aria-label="Toggle Wishlist"
                                    >
                                        {isWishlisted ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-red-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-slate-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                                            </svg>
                                        )}
                                    </motion.button>
                                )}
                            </div>

                            <ImageGallery images={experience.images}/>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-20">
                                <div className="lg:col-span-2">
                                    <motion.div initial="hidden" whileInView="visible" viewport={{once: true, amount: 0.2}}
                                                variants={containerVariants}>
                                        <motion.div variants={itemVariants} className="prose prose-lg max-w-none mb-8">
                                            <h2 className="text-3xl font-bold text-gray-800">About This Experience</h2>
                                            <p className="lead text-slate-600">{experience.description}</p>
                                        </motion.div>
                                        <div className="border-t border-b divide-y divide-slate-200">
                                            <InfoBlock icon={<MedalIcon/>} title="Experienced Host">Our hosts are local
                                                experts who love sharing their passion.</InfoBlock>
                                            <InfoBlock icon={<DoorIcon/>} title="Seamless Check-in">Enjoy a smooth start to
                                                your adventure with our easy check-in process.</InfoBlock>
                                            <InfoBlock icon={<CalendarIcon/>} title="Flexible Cancellation">Cancel up to 24
                                                hours in advance for a full refund.</InfoBlock>
                                        </div>
                                    </motion.div>

                                    {experience.location && <motion.div initial="hidden" whileInView="visible"
                                                                        viewport={{once: true, amount: 0.2}}
                                                                        variants={containerVariants}>
                                        <h2 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center mt-12">
                                            <MapPinIcon className="w-6 h-6 mr-3 text-indigo-600"/>
                                            Where you'll be
                                        </h2>
                                        <div className="h-96 rounded-2xl overflow-hidden shadow-lg">
                                            <iframe
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(experience.location)}&output=embed`}
                                                width="100%" height="100%" frameBorder="0" allowFullScreen="" loading="lazy" className="w-full h-full">
                                            </iframe>
                                        </div>
                                    </motion.div>}
                                    <HostProfile
                                        host={experience.host}
                                        onAuthChange={onAuthChange}
                                        onMessageClick={() => setIsMessageModalOpen(true)}
                                    />
                                </div>
                                <aside className="lg:col-span-1 mt-12 lg:mt-0">
                                    <BookingCard
                                        groupPrice={experience.groupPricePerPerson}
                                        privatePrice={experience.privatePrice}
                                        host={experience.host}
                                        rating={experience.rating}
                                        onCheckAvailabilityClick={() => setIsModalOpen(true)}
                                    />
                                </aside>
                            </div>

                            <motion.section
                                initial="hidden"
                                whileInView="visible"
                                viewport={{once: true, amount: 0.1}}
                                variants={containerVariants}
                                className="py-16 border-t mt-16"
                                id="guest-reviews"
                            >
                                <motion.h2 variants={itemVariants}
                                           className="text-3xl font-bold text-indigo-800 mb-8 flex items-center">
                                    <StarIcon className="w-7 h-7 mr-3 text-yellow-500"/>
                                    Guest Reviews
                                </motion.h2>

                                {experience.reviews && experience.reviews.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {displayedReviews.map((review, index) => (
                                                <ReviewCard key={index} review={review}/>
                                            ))}
                                        </div>

                                        {!showAllReviews && experience.reviews.length > 6 && (
                                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}}
                                                        className="mt-12 text-center">
                                                <button
                                                    onClick={() => setShowAllReviews(true)}
                                                    className="font-bold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-6 py-3 rounded-xl transition-colors duration-300"
                                                >
                                                    Show all reviews
                                                </button>
                                            </motion.div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-slate-500 mt-4">Be the first to leave a review for this
                                        experience!</p>
                                )}

                                <div className="text-center mt-10">
                                    <button
                                        onClick={handleLeaveReviewClick}
                                        className="px-6 py-3 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-300"
                                    >
                                        Leave a Review
                                    </button>
                                </div>
                            </motion.section>

                        </div>
                    </motion.main>
                )}
            </AnimatePresence>

            <ReviewModal
                experience={experience}
                isOpen={isReviewModalOpen}
                onClose={handleReviewModalClose}
                currentUser={currentUser}
            />

            {experience && (
                <BookingModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    experience={experience}
                />
            )}

            {experience && (
                <MessageHostModal
                    isOpen={isMessageModalOpen}
                    onClose={() => setIsMessageModalOpen(false)}
                    host={experience.host}
                    onAuthChange={onAuthChange}
                />
            )}

            {isLoginPromptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-semibold text-slate-800">Please sign in</h3>
                        <p className="mt-2 text-sm text-slate-600">You need an account to leave a review.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsLoginPromptOpen(false)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={goToLogin}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExperienceDetail;
