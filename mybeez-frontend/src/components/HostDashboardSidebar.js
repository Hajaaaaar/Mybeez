import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  House, Calendar, EnvelopeSimple, FileText,
  Clock, CheckCircle, Archive, UserCircle, Plus,
  MagnifyingGlass, Info, Heart, ShoppingCart, SignOut
} from '@phosphor-icons/react';



const generalLinks = [
  { text: 'Explore', icon: MagnifyingGlass, to: '/experience' },
  { text: 'About', icon: Info, to: '/about' },
];

const topNavLinks = [
  { text: 'Dashboard', icon: House, to: '/host/dashboard' },
  { text: 'Calendar', icon: Calendar, to: '/host/calendar' },
  { text: 'Inbox', icon: EnvelopeSimple, to: '/host/inbox' },
  { text: 'Resources', icon: FileText, to: '/host/resources' },
];

const experienceLinks = [
  { text: 'Pending Approval', icon: Clock, to: '/host/experiences/pending' },
  { text: 'Ongoing Experiences', icon: CheckCircle, to: '/host/experiences/approved' },
  { text: 'Completed Experiences', icon: Archive, to: '/host/experiences/completed' },
];
const HostDashboardSidebar = ({ unreadCount, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    // A short delay before collapsing
    timerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
  };

  // Helper to render link items to avoid repetition
  const renderNavLink = (link) => (
      <NavLink
          to={link.to}
          key={link.text}
          className={({isActive}) =>
              `relative flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors
            ${isExpanded ? 'justify-start' : 'justify-center'}
            ${isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
          }
      >

        <div className="relative">

          <link.icon className="h-6 w-6 flex-shrink-0" weight="bold"/>
          {link.text === 'Inbox' && unreadCount > 0 && (
              <span
                  className={`absolute top-0 right-0 flex items-center justify-center rounded-full bg-red-500 text-white ring-2 ring-white
            ${isExpanded ? 'h-6 w-6 text-sm font-bold' : 'h-3 w-3'}`}
              >
            {/* Show count only when expanded */}
                {isExpanded && (unreadCount > 9 ? '9+' : unreadCount)}
          </span>
          )}
        </div>
        {isExpanded && <span className="ml-4 truncate">{link.text}</span>}
      </NavLink>
  );

  return (
      <div
          className={`bg-white h-full p-4 flex flex-col justify-between border-r border-gray-200 transition-all duration-300 ease-in-out ${isExpanded ? 'w-[17rem]' : 'w-20'}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
      >
        <div className="flex-grow">
          <nav className="space-y-1">
            {generalLinks.map(renderNavLink)}
            <hr className="my-3 border-gray-200"/>
            {topNavLinks.map(renderNavLink)}
            {experienceLinks.map(renderNavLink)}
          </nav>
        </div>

        <div className="flex-shrink-0 space-y-1">
          <NavLink
              to="/host/create-experience"
              className={`w-full bg-blue-600 text-white rounded-lg py-3 text-base font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-3 ${isExpanded ? 'justify-start px-4' : 'justify-center'}`}
          >
            <Plus size={24} weight="bold" className="flex-shrink-0" />
            {isExpanded && <span className="truncate">Create experience</span>}
          </NavLink>
          <hr className="my-2 border-gray-200" />
          <NavLink to="/wishlist" className={`flex items-center p-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-100 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            <Heart weight="bold" className="h-6 w-6 flex-shrink-0" />
            {isExpanded && <span className="ml-4 truncate">Wishlist</span>}
          </NavLink>

          <NavLink to="/cart" className={`flex items-center p-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-100 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            <ShoppingCart weight="bold" className="h-6 w-6 flex-shrink-0" />
            {isExpanded && <span className="ml-4 truncate">My Cart</span>}
          </NavLink>

          <a href="/profile"
             className={`flex items-center p-2 text-base font-medium text-gray-600 hover:bg-gray-100 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
            <UserCircle size={32} className="flex-shrink-0"/>
            {isExpanded && <span className="ml-4 truncate">Profile</span>}
          </a>

          <button
              onClick={onLogout}
              className={`w-full flex items-center p-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <SignOut weight="bold" className="h-6 w-6 flex-shrink-0"/>
            {isExpanded && <span className="ml-4 truncate">Logout</span>}
          </button>
        </div>
      </div>

  );
};

export default HostDashboardSidebar;