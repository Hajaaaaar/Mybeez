import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// --- Reusable Icon Components ---
const StarIcon = ({ className = 'w-5 h-5 text-yellow-400' }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.681 3.462 3.82.556c.734.107 1.03.998.494 1.526l-2.764 2.693.654 3.805c.124.723-.64 1.28-1.288.944L10 13.6l-3.395 1.785c-.648.336-1.412-.221-1.288-.944l.654-3.805-2.764-2.693c-.536-.528-.24-1.419.494-1.526l3.82-.556 1.681-3.462z" clipRule="evenodd" /></svg>);
const ArrowRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ml-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;

// --- Animation Variants ---
const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};


// --- Hero Section ---
const HeroSection = () => (
    <section className="grid md:grid-cols-2 gap-12 items-center pt-8 pb-12 md:pt-16 md:pb-24">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tighter">
                Discover Authentic, <br/> Unforgettable Experiences.
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg">
                MyBeez connects you with passionate local hosts for unique activities that create lasting memories. Go beyond the ordinary.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/experience" className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md transition-transform duration-300 hover:bg-indigo-700 hover:scale-105">
                    Explore Experiences
                </Link>
                <Link to="/become-a-host" className="inline-flex items-center justify-center px-7 py-3 text-base font-semibold text-indigo-600 bg-indigo-100 rounded-lg transition-transform duration-300 hover:bg-indigo-200 hover:scale-105">
                    Become a Host
                </Link>
            </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block h-[570px]"
        >
            <img
                src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1286&q=80"
                alt="Couple enjoying a scenic view in Venice"
                className="rounded-3xl shadow-2xl object-cover w-full h-full"
            />
        </motion.div>
    </section>
);


// --- Categories Section ---
const CategoriesSection = ({ categories }) => {
    const categoryImages = {
        "Food & Drink": "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=60",
        "Arts & Culture": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=60",
        "Nature & Outdoors": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=60",
        "Fitness & Wellness": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=60",
        "Entertainment": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=60",
        "Workshops & Skills": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=60",
    };

    return (
        <motion.section
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}
            className="py-16 md:py-24"
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">Find Your Next Adventure</h2>
                <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
                    A collection of experiences, curated for every interest.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map(cat => (
                    <Link
                        key={cat.id}
                        to={`/experience?categoryId=${cat.id}`}
                        className="group"
                    >
                        <div className="relative overflow-hidden rounded-xl shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-105 aspect-[3/4]">
                            <img
                                src={categoryImages[cat.name] || 'https://source.unsplash.com/800x600/?abstract'}
                                alt={cat.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-4">
                                <h3 className="text-lg font-bold text-white drop-shadow-md">{cat.name}</h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </motion.section>
    );
};


// --- Featured Experiences Section ---
const FeaturedExperiences = ({ experiences }) => (
    <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={sectionVariants}
        className="py-16 md:py-24 bg-slate-50 rounded-3xl"
    >
        <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900">Top-Rated Experiences</h2>
            <p className="mt-3 text-lg text-gray-500">
                Chosen by our community, these are the adventures our users can't stop talking about.
            </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
            {experiences.map((exp) => (
                <Link to={`/experience/${exp.id}`} key={exp.id} className="block group">
                    <div className="relative overflow-hidden rounded-2xl shadow-lg h-96">
                        <img
                            src={(exp.images && exp.images.length > 0) ? exp.images[0] : 'https://source.unsplash.com/800x600/?adventure'}
                            alt={exp.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <h3 className="text-xl font-bold">{exp.title}</h3>
                            <div className="flex items-center mt-2 text-sm opacity-90">
                                <StarIcon />
                                <span className="ml-1 font-semibold">{exp.rating ? exp.rating.toFixed(1) : "New"}</span>
                                <span className="mx-2">·</span>
                                <span>{exp.location}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
        <div className="mt-12 text-center">
            <Link to="/experience" className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                View All Experiences <ArrowRightIcon />
            </Link>
        </div>
    </motion.section>
);


// --- Dynamic Testimonials Section ---
const TestimonialsSection = ({ experiences = [] }) => {
    const testimonials = experiences
        .flatMap(exp => (exp.reviews || []).map(review => ({ ...review, experienceTitle: exp.title })))
        .filter(review => review.rating >= 4 && review.reviewText)
        .slice(0, 3);

    if (testimonials.length === 0) return null;

    return (
        <motion.section
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}
            className="py-16 md:py-24"
        >
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900">What Our Guests Are Saying</h2>
                <p className="mt-3 text-lg text-gray-500">Real stories from travelers who have made unforgettable memories with MyBeez.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {testimonials.map((t, index) => (
                    <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex">
                            {[...Array(t.rating)].map((_, i) => <StarIcon key={i} />)}
                        </div>
                        <blockquote className="mt-4 text-gray-700">“{t.reviewText}”</blockquote>
                        <footer className="mt-6">
                            <p className="font-bold text-gray-900">{t.reviewerName}</p>
                            <p className="text-sm text-gray-500">on {t.experienceTitle}</p>
                        </footer>
                    </div>
                ))}
            </div>
        </motion.section>
    );
};


// --- "About Us" Section ---
const AboutSection = () => (
    <motion.section
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}
        className="py-16 md:py-24 bg-white"
    >
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-10 items-center">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Connecting People, Creating Memories</h2>
                <p className="mt-4 text-lg text-gray-600">
                    MyBeez was born from a passion for authentic travel. We believe the best way to experience a place is through the eyes of a local. Our mission is to empower hosts to share their craft and help travelers discover the heart and soul of a destination.
                </p>
                <div className="mt-6">
                    <Link to="/about" className="inline-flex items-center font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Learn More About Our Story <ArrowRightIcon />
                    </Link>
                </div>
            </div>
            <div className="flex items-center justify-center">
                <img
                    src="/images/Mission.png"
                    alt="Illustration of MyBeez connecting people through experiences"
                    className="rounded-2xl w-full max-w-md object-contain"
                />
            </div>
        </div>
    </motion.section>
);


// --- Call-to-Action Section ---
const FinalCTASection = () => (
    <section className="py-16 md:py-24 bg-indigo-600 rounded-3xl">
        <div className="text-center max-w-3xl mx-auto px-4">
            <motion.h2
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={sectionVariants}
                className="text-4xl font-bold text-white tracking-tight"
            >
                Ready for Your Next Adventure?
            </motion.h2>

            <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={{
                    ...sectionVariants,
                    visible: {
                        ...sectionVariants.visible,
                        transition: { ...sectionVariants.visible.transition, delay: 0.1 },
                    },
                }}
                className="mt-4 text-lg text-indigo-200"
            >
                Create an account to book experiences and connect with local hosts.
            </motion.p>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={{
                    ...sectionVariants,
                    visible: {
                        ...sectionVariants.visible,
                        transition: { ...sectionVariants.visible.transition, delay: 0.2 },
                    },
                }}
                className="flex flex-wrap justify-center gap-4 mt-8"
            >
                <Link
                    to="/signup"
                    className="inline-block px-8 py-3 text-base font-semibold text-indigo-600 bg-white rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                >
                    Sign Up Now
                </Link>
                <Link
                    to="/experience"
                    className="inline-block px-8 py-3 text-base font-semibold text-white bg-indigo-500/80 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-indigo-500"
                >
                    Browse Experiences
                </Link>
            </motion.div>
        </div>
    </section>
);


// --- Main Homepage Component ---
const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featuredRes, categoriesRes] = await Promise.all([
                    axios.get('/api/experiences/featured'),
                    axios.get('/api/experiences/categories')
                ]);
                setFeatured(featuredRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                console.error("Failed to fetch homepage data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white font-sans">
            <main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
                <HeroSection/>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : (
                    <>
                        {featured.length > 0 && <FeaturedExperiences experiences={featured}/>}
                        {featured.length > 0 && <TestimonialsSection experiences={featured}/>}
                        <AboutSection/>
                        {categories.length > 0 && <CategoriesSection categories={categories}/>}
                    </>
                )}

                <FinalCTASection/>
            </main>
        </div>
    );
};

export default HomePage;