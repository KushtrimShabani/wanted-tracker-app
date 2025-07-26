import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWantedStore } from '../store/wantedStore';
import LoadingSpinner from '../components/LoadingSpinner';

const WantedDetail = () => {
  const { id } = useParams();
  const { 
    currentPerson, 
    isLoading, 
    error, 
    fetchWantedPerson, 
    clearCurrentPerson,
    setToast 
  } = useWantedStore();

  useEffect(() => {
    if (id) {
      fetchWantedPerson(id);
    }
    
    return () => {
      clearCurrentPerson();
    };
  }, [id, fetchWantedPerson, clearCurrentPerson]);

  useEffect(() => {
    if (error) {
      setToast({ type: 'error', message: error });
    }
  }, [error, setToast]);

  if (isLoading) {
    return <LoadingSpinner text="Loading person details..." />;
  }

  if (!currentPerson && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Person Not Found</h2>
        <p className="text-gray-600 mb-6">
          The requested person could not be found in the FBI database.
        </p>
        <Link
          to="/"
          className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to List
        </Link>
      </div>
    );
  }

  const person = currentPerson;
  const primaryImage = person?.images?.[0]?.original || person?.images?.[0]?.large;
  const additionalImages = person?.images?.slice(1) || [];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to List
        </Link>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="md:flex">
          {/* Image Section */}
          <div className="md:w-1/3">
            <div className="aspect-w-3 aspect-h-4 bg-gray-100">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={person.title || 'Unknown'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              <div 
                className={`w-full h-full bg-gray-200 flex items-center justify-center ${primaryImage ? 'hidden' : 'flex'}`}
              >
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p>No Image Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-2/3 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {person.title || 'Unknown Name'}
            </h1>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {person.sex && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sex</h3>
                  <p className="mt-1 text-lg text-gray-900">{person.sex}</p>
                </div>
              )}
              {person.race_raw && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Race</h3>
                  <p className="mt-1 text-lg text-gray-900">{person.race_raw}</p>
                </div>
              )}
              {person.hair_raw && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hair</h3>
                  <p className="mt-1 text-lg text-gray-900">{person.hair_raw}</p>
                </div>
              )}
              {person.eyes_raw && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Eyes</h3>
                  <p className="mt-1 text-lg text-gray-900">{person.eyes_raw}</p>
                </div>
              )}
              {person.height_min && person.height_max && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Height</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {person.height_min}" - {person.height_max}"
                  </p>
                </div>
              )}
              {person.weight_min && person.weight_max && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Weight</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {person.weight_min} - {person.weight_max} lbs
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            {person.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: person.description }}
                />
              </div>
            )}

            {/* Details */}
            {person.details && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: person.details }}
                />
              </div>
            )}

            {/* Caution */}
            {person.caution && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Caution
                </h3>
                <div 
                  className="text-red-800"
                  dangerouslySetInnerHTML={{ __html: person.caution }}
                />
              </div>
            )}

            {/* External Links */}
            {person.url && (
              <div className="border-t pt-6">
                <a
                  href={person.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  View on FBI Website
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Images */}
      {additionalImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {additionalImages.map((image, index) => (
              <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image.original || image.large || image.thumb}
                  alt={`${person.title || 'Unknown'} - Image ${index + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => window.open(image.original || image.large, '_blank')}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WantedDetail;