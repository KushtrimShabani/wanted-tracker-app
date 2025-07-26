import React from 'react';
import { Link } from 'react-router-dom';

const WantedCard = ({ person }) => {
  const primaryImage = person.images?.[0]?.original || person.images?.[0]?.thumb;
  
  return (
    <Link 
      to={`/wanted/${person.uid}`}
      className="group block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 animate-fade-in"
    >
      <div className="aspect-w-16 aspect-h-12 bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={person.title || 'Unknown'}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className={`w-full h-48 bg-gray-200 flex items-center justify-center ${primaryImage ? 'hidden' : 'flex'}`}
        >
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-sm">No Image</p>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {person.title || 'Unknown Name'}
        </h3>
        
        <div className="mt-2 space-y-1 text-sm text-gray-600">
          {person.hair_raw && (
            <p>
              <span className="font-medium">Hair:</span> {person.hair_raw}
            </p>
          )}
          {person.race_raw && (
            <p>
              <span className="font-medium">Race:</span> {person.race_raw}
            </p>
          )}
          {person.sex && (
            <p>
              <span className="font-medium">Sex:</span> {person.sex}
            </p>
          )}
        </div>
        
        {person.description && (
          <p className="mt-3 text-sm text-gray-700 line-clamp-3">
            {person.description}
          </p>
        )}
        
        <div className="mt-4 flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700">
          View Details
          <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default WantedCard;