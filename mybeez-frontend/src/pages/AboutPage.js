import React from 'react';
import TeamMemberCard from '../components/TeamMemberCard';

// --- Placeholder Data ---
const teamMembers = [
    
    {
        name: "Hajar Nefaa",
        role: "Full Stack Engineer",
        bio: "Hajar Nefaa was the engineer behind the entire platform’s UX/UI and core functionality. From building the authentication system and designing the Experience and Explore pages, to developing the booking and inbox pages... — she crafted a seamless, secure, and visually engaging experience across the board. Her work unified the front-end design with powerful back-end architecture, ensuring the platform runs smoothly, securely, and beautifully from end to end.",
        imageUrl: "https://placehold.co/400x400/EFEFEF/AAAAAA?text=Hajar"
    },
    
];

const AboutPage = () => {
    return (
        <div className="bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* --- Header Section --- */}
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">About MyBeez</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Connecting passions with experiences. We believe in the power of shared knowledge and the magic of creating together.
                    </p>
                </header>

                {/* --- Our Story Section --- */}
                <section className="bg-white p-10 rounded-2xl shadow-lg mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-indigo-700 mb-4">Our Mission</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                MyBeez was born from a simple idea: everyone has a skill worth sharing and a curiosity worth exploring. In a world that's more digital than ever, we wanted to create a platform that fosters real, tangible connections. Our mission is to empower local experts, artisans, and enthusiasts to become hosts and share their passions, while enabling others to discover unique, hands-on experiences right in their own communities.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                We're more than just a booking platform; we're a community hub for creativity, learning, and connection. Whether it's mastering the art of pottery, learning to bake the perfect sourdough, or exploring nature with a local guide, MyBeez is where your next adventure begins.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <img
                                src="/images/Mission.png"
                                alt="Community gathering for a workshop"
                                className="rounded-xl shadow-md"
                            />
                        </div>
                    </div>
                </section>

                {/* --- Meet the Team Section --- */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900">Meet the Team</h2>
                        <p className="mt-3 text-md text-gray-500">The passionate developers behind the MyBeez platform.</p>
                    </div>
                    <div className="flex justify-center">
                        {teamMembers.map((member, index) => (
                            <TeamMemberCard key={index} {...member} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AboutPage;
