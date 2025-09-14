import React from 'react';

const TeamMemberCard = ({ name, role, bio, imageUrl }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 text-center transition-transform transform hover:-translate-y-2 hover:shadow-xl">
            <img
                src={imageUrl}
                alt={`Portrait of ${name}`}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-100"
            />
            <h3 className="text-lg font-bold text-gray-900">{name}</h3>
            <p className="text-sm text-indigo-600 font-semibold mb-3">{role}</p>
            <p className="text-xs text-gray-500">{bio}</p>
        </div>
    );
};

export default TeamMemberCard;
