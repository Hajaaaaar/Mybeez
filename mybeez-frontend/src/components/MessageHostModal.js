import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import { isMessageContentInvalid } from '../utils/validation';
import axios from 'axios';
import { toast } from 'react-toastify';

// --- CONFIGURATION & ICONS ---
const MAX_CHARS = 1000;
const MIN_CHARS = 10;

const CloseIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Animation Variants ---
const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants = {
    hidden: { y: "-50%", x: "-50%", opacity: 0, scale: 0.9 },
    visible: { y: "-50%", x: "-50%", opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { y: "-50%", x: "-50%", opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
};

const authModalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
};


// --- Auth Modal Component (Login/Signup) ---
const AuthModal = ({ isOpen, onClose, onLoginSuccess, onAuthChange }) => {
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
                    onAuthChange();
                    onLoginSuccess();
                })
                .catch(err => {
                    setError("Login failed. Please check your credentials.");
                    setIsLoading(false);
                });
        } else { // Signup logic
            AuthService.signup(firstName, lastName, email, password)
                .then(() => {
                    AuthService.login(email, password).then(() => {
                        onAuthChange();
                        onLoginSuccess();
                    });
                })
                .catch(err => {
                    setError(err.response?.data?.message || "Registration failed.");
                    setIsLoading(false);
                });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        variants={authModalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Log in or sign up</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><CloseIcon /></button>
                        </header>
                        <div className="p-6">
                            <div className="flex border-b mb-6">
                                <button onClick={() => setActiveTab('login')} className={`w-1/2 pb-3 font-semibold transition-colors ${activeTab === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}>Log in</button>
                                <button onClick={() => setActiveTab('signup')} className={`w-1/2 pb-3 font-semibold transition-colors ${activeTab === 'signup' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-500'}`}>Sign up</button>
                            </div>
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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const MessageHostModal = ({ isOpen, onClose, host, onAuthChange }) => {
    const navigate = useNavigate();
    const localStorageKey = `draft_message_to_host_${host?.id}`;
    const [message, setMessage] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [validationRules, setValidationRules] = useState(null);
    const [contentError, setContentError] = useState('');

    // Validation Logic
    const trimmedMessage = message.trim();
    const isMessageTooShort = trimmedMessage.length > 0 && trimmedMessage.length < MIN_CHARS;
    const isSendDisabled = trimmedMessage.length < MIN_CHARS || trimmedMessage.length > MAX_CHARS || !validationRules;

    useEffect(() => {
        if (isOpen && host?.id) {
            const savedDraft = localStorage.getItem(localStorageKey);
            if (savedDraft) {
                setMessage(savedDraft);
            } else {
                setMessage('');
            }
        }
        // Fetch validation rules when modal opens
        if (!validationRules) {
            axios.get('/api/config/validation')
                .then(response => { setValidationRules(response.data); })
                .catch(err => { console.error("Could not load validation config", err); });
        }
    }, [isOpen, host, localStorageKey, validationRules]);

    useEffect(() => {
        if (isOpen && host?.id) {
            localStorage.setItem(localStorageKey, message);
        }
    }, [message, isOpen, host, localStorageKey]);

    const handleMessageChange = (e) => {
        if (contentError) {
            setContentError('');
        }
        setMessage(e.target.value.slice(0, MAX_CHARS));
    };

    const sendTheMessage = () => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return;

        const messageData = {
            recipientId: host.id,
            content: message.trim(),
        };
        const headers = { 'Authorization': `Bearer ${currentUser.accessToken}` };

        axios.post('/api/messages/send', messageData, { headers })
            .then(() => {
                localStorage.removeItem(localStorageKey);
                setMessage('');
                onClose();
                navigate('/messages', { state: { refresh: true } });
            })
            .catch(err => {
                const errorMessage = err.response?.data?.error || "There was an error sending your message.";
                toast.error(errorMessage);
            });
    };

    const handleSendMessage = () => {
        if (isSendDisabled) return;

        // Perform the validation check and set the inline error message
        if (isMessageContentInvalid(message, validationRules)) {
            setContentError("Message contains inappropriate or unsafe content.");
            return;
        }

        const currentUser = AuthService.getCurrentUser();

        if (currentUser && currentUser.accessToken) {
            sendTheMessage();
        } else {
            setShowAuthModal(true);
        }
    };

    const handleLoginSuccess = () => {
        setShowAuthModal(false);
        sendTheMessage();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="backdrop"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    <motion.div
                        key="modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed top-1/2 left-1/2 w-[90%] max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-50"
                    >
                        <header className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">
                                Message {host?.firstName || 'the Host'}
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                                <CloseIcon />
                            </button>
                        </header>

                        <main className="flex flex-col space-y-2">
                            <label htmlFor="message-input" className="font-semibold text-slate-700">
                                Your Question
                            </label>
                            <textarea
                                id="message-input"
                                rows="6"
                                value={message}
                                onChange={handleMessageChange}
                                placeholder={`Have a question about the experience? Ask ${host?.firstName} anything...`}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 resize-y"
                            />
                            <div className="flex justify-between items-center text-sm px-1">
                                <p className="text-red-600 font-medium h-5">
                                    {contentError || (isMessageTooShort ? `Please enter at least ${MIN_CHARS} characters.` : '')}
                                </p>
                                <p className={`font-medium ${message.length > MAX_CHARS ? 'text-red-600' : 'text-slate-500'}`}>
                                    {message.length}/{MAX_CHARS}
                                </p>
                            </div>
                        </main>

                        <footer className="mt-4 flex justify-end">
                            <motion.button
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isSendDisabled}
                                className="py-2.5 px-6 text-white font-bold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </motion.button>
                        </footer>
                    </motion.div>

                    {/* Render the AuthModal when needed */}
                    <AuthModal
                        isOpen={showAuthModal}
                        onClose={() => setShowAuthModal(false)}
                        onLoginSuccess={handleLoginSuccess}
                        onAuthChange={onAuthChange}
                    />
                </>
            )}
        </AnimatePresence>
    );
};

export default MessageHostModal;
