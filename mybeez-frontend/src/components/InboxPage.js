import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, isToday, isYesterday, parseISO, isSameDay } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthService from '../services/auth.service';
import { isMessageContentInvalid } from '../utils/validation';

// --- SVG ICONS ---
const SendIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.95.54l3.853-1.405a.75.75 0 010 1.372L4.642 9.92l-1.414 4.95a.75.75 0 00.95.826l13.5-4.875a.75.75 0 000-1.452L3.105 2.289z" /></svg>);
const UserCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>);

// --- Main Inbox Page Component ---
const InboxPage = ({ onConversationAction }) => {
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [filter, setFilter] = useState('All');
    const [validationRules, setValidationRules] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Main loading state for initial data

    const currentUser = AuthService.getCurrentUser();
    const messagesEndRef = useRef(null);

    // This effect handles the auto-scrolling
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedConversation?.messages]);

    // This effect fetches the initial list of conversations and validation rules
    useEffect(() => {
        if (!currentUser) {
            setIsLoading(false);
            return;
        }
        const headers = { 'Authorization': `Bearer ${currentUser.accessToken}` };

        // Use Promise.all to fetch conversations and validation rules concurrently
        Promise.all([
            axios.get('/api/messages/conversations', { headers }),
            axios.get('/api/config/validation')
        ]).then(([conversationsResponse, validationResponse]) => {
            setConversations(conversationsResponse.data);
            setValidationRules(validationResponse.data);
        }).catch(err => {
            console.error("Failed to load initial page data", err);
            toast.error("Could not load necessary data. Please refresh the page.");
        }).finally(() => {
            setIsLoading(false); // Set loading to false after both complete
        });

    }, [currentUser, location.state]);

    const handleSelectConversation = (convoId) => {
        if (activeConversationId === convoId && !isLoadingMessages) return;

        const convoDetails = conversations.find(c => c.id === convoId);
        if (!convoDetails) return;

        setActiveConversationId(convoId);
        setNewMessage('');
        setSelectedConversation({ ...convoDetails, messages: [] });
        setIsLoadingMessages(true);

        const headers = { 'Authorization': `Bearer ${currentUser.accessToken}` };
        axios.get(`/api/messages/conversations/${convoId}`, { headers })
            .then(response => {
                setSelectedConversation(prev => ({
                    ...prev,
                    messages: response.data.messages || [],
                }));
                setConversations(prevConversations =>
                    prevConversations.map(c =>
                        c.id === convoId ? { ...c, hasUnreadMessages: false } : c
                    )
                );
                if (onConversationAction) { onConversationAction(); }
            })
            .catch(err => {
                toast.error("Could not load messages for this conversation.");
            })
            .finally(() => {
                setIsLoadingMessages(false);
            });
    };

    // This function handles sending the message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId || isSending || !validationRules) return;

        if (isMessageContentInvalid(newMessage, validationRules)) {
            toast.error("Message contains inappropriate or unsafe content.");
            return;
        }

        setIsSending(true);

        const recipientId = selectedConversation?.otherParticipant?.id;

        if (!recipientId) {
            toast.error("Could not determine the recipient.");
            setIsSending(false);
            return;
        }

        const messageData = { recipientId, content: newMessage };
        const headers = { 'Authorization': `Bearer ${currentUser.accessToken}` };

        const optimisticMessage = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            content: newMessage,
            senderId: currentUser.id,
        };

        setSelectedConversation(prev => {
            if (!prev) return null;
            const updatedMessages = [...(prev.messages || []), optimisticMessage];
            return { ...prev, messages: updatedMessages };
        });

        setConversations(prev =>
            prev.map(c =>
                c.id === activeConversationId
                    ? { ...c, lastMessage: optimisticMessage.content, updatedAt: optimisticMessage.timestamp }
                    : c
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );

        setNewMessage('');

        axios.post('/api/messages/send', messageData, { headers })
            .then(response => {
                const realMessageFromServer = response.data;
                setSelectedConversation(prev => {
                    if (!prev) return null;
                    const updatedMessages = prev.messages.map(msg =>
                        msg.id === optimisticMessage.id ? { ...optimisticMessage, ...realMessageFromServer } : msg
                    );
                    return { ...prev, messages: updatedMessages };
                });
                if (onConversationAction) { onConversationAction(); }
            })
            .catch(err => {
                // Error
                const errorMessage = err.response?.data?.error || "Message failed to send. Please try again.";
                toast.error(errorMessage);

                setSelectedConversation(prev => {
                    if (!prev) return null;
                    const revertedMessages = prev.messages.filter(
                        msg => msg.id !== optimisticMessage.id
                    );
                    return { ...prev, messages: revertedMessages };
                });

                setNewMessage(optimisticMessage.content);
            })
            .finally(() => {
                setIsSending(false);
            });
    };


    const filteredConversations = conversations.filter(convo => {
        if (filter === 'Unread') {
            return convo.hasUnreadMessages === true;
        }
        return true;
    });

    if (isLoading) {
        return <div className="text-center py-20">Loading conversations...</div>;
    }

    if (!currentUser) {
        return <div className="text-center py-20">Please log in to view your messages.</div>;
    }

    return (
        <div className="flex h-[calc(100vh-5px)] font-sans bg-white text-gray-800">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <aside className="w-full md:w-[448px] flex-shrink-0 border-r border-gray-200 flex flex-col">
                <header className="p-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold">Messages</h1>
                </header>
                <div className="px-2 pt-2 border-b border-gray-200">
                    <div className="flex space-x-1">
                        <button onClick={() => setFilter('All')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${filter === 'All' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>All</button>
                        <button onClick={() => setFilter('Unread')} className={`px-4 py-2 text-sm font-semibold rounded-lg ${filter === 'Unread' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}>Unread</button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {filteredConversations.map(convo => (
                        <ConversationSummary key={convo.id} conversation={convo}
                                             isActive={activeConversationId === convo.id}
                                             onClick={() => handleSelectConversation(convo.id)}/>
                    ))}
                </div>
            </aside>

            <main className="hidden md:flex flex-1 flex-col bg-white">
                {!selectedConversation ? (
                    <div className="flex-grow flex items-center justify-center bg-gray-50">
                        <p className="text-gray-500 text-lg">Select a conversation to start chatting</p>
                    </div>
                ) : (
                    <>
                        <header className="p-4 border-b border-gray-200 flex items-center space-x-3 shadow-sm">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                {selectedConversation.otherParticipant?.profilePictureUrl ? (
                                    <img src={selectedConversation.otherParticipant.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                                ) : <UserCircleIcon className="text-gray-400" />}
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">
                                    {selectedConversation.otherParticipant?.firstName}
                                </h2>
                            </div>
                        </header>
                        <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-gray-50">
                            {isLoadingMessages ? (
                                <div className="flex-grow flex items-center justify-center">
                                    <p className="text-gray-500 text-lg">Loading messages...</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {selectedConversation.messages && selectedConversation.messages.map((msg, index) => {
                                        const prevMsg = selectedConversation.messages[index - 1];
                                        const showDateSeparator = msg.timestamp && (!prevMsg || !isSameDay(parseISO(msg.timestamp), parseISO(prevMsg.timestamp)));

                                        return (
                                            <React.Fragment key={msg.id}>
                                                {showDateSeparator && <DateSeparator date={parseISO(msg.timestamp)} />}
                                                <MessageBubble
                                                    message={msg}
                                                    isOwnMessage={msg.senderId === currentUser.id}
                                                    participant={selectedConversation.otherParticipant}
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                        <footer className="p-4 bg-white">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-3 border border-gray-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-black">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write a message..."
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base"
                                />
                                <button type="submit" aria-label="Send message" className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300" disabled={!newMessage.trim() || isSending || !validationRules}>
                                    <SendIcon />
                                </button>
                            </form>
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
};

// --- Child Components ---

const ConversationSummary = ({ conversation, isActive, onClick }) => {
    const date = conversation.updatedAt ? parseISO(conversation.updatedAt) : new Date();
    let displayDate;
    if (isToday(date)) {
        displayDate = format(date, 'HH:mm');
    } else if (isYesterday(date)) {
        displayDate = 'Yesterday';
    } else {
        displayDate = format(date, 'dd/MM/yy');
    }

    const isUnread = conversation.hasUnreadMessages;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 flex space-x-4 items-center transition-colors relative ${
                isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
        >
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-black rounded-r-full"></div>}
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {conversation.otherParticipant?.profilePictureUrl ? (
                    <img src={conversation.otherParticipant.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                ) : <UserCircleIcon className="text-gray-400" />}
            </div>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-start">
                    <p className={`truncate ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>{conversation.otherParticipant?.firstName}</p>
                    <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{displayDate}</p>
                </div>
                <p className={`text-sm truncate mt-1 ${isUnread ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{conversation.lastMessage}</p>
            </div>
        </button>
    );
};

const MessageBubble = ({message, isOwnMessage, participant}) => {
    const timestamp = message.timestamp ? format(parseISO(message.timestamp), 'HH:mm') : '';

    return (
        <div className={`group flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-md px-4 py-2.5 rounded-2xl ${
                isOwnMessage
                    ? 'bg-black text-white rounded-br-lg'
                    : 'bg-gray-200 text-gray-800 rounded-bl-lg'
            }`}>
                <p className="text-base break-words">{message.content}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isOwnMessage && participant?.firstName && `${participant.firstName} · `}
                {timestamp}
            </p>
        </div>
    );
};

const DateSeparator = ({ date }) => {
    const formattedDate = format(date, 'eeee, dd MMMM yyyy');
    return (
        <div className="text-center my-4">
            <span className="text-xs text-gray-500 font-semibold bg-gray-50 px-3 py-1">
                {formattedDate}
            </span>
        </div>
    );
};

export default InboxPage;
