import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1);
  };

    return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        
        {/* Simple 404 */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-white mb-4">
            404
          </h1>
          <div className="text-gray-400 text-xl font-mono">
            <span className="text-red-400">ERROR:</span> Page not found
          </div>
        </div>

        {/* Developer message */}
        <div className="mb-8 space-y-6">

          <p className="text-gray-300 text-lg leading-relaxed">
            This page doesn't exist in my <span className="text-blue-400 font-semibold">WantedTracker</span> app. 
            But don't worry, my code is still working perfectly!
          </p>
          
      
        </div>

        {/* Action buttons */}
        <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <button
            onClick={goHome}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go Home
          </button>
          
          <button
            onClick={goBack}
            className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
             Go Back
          </button>
        </div>

    
      </div>
    </div>
  );
};

export default NotFound; 