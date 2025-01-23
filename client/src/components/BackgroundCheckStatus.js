import React from 'react';

function BackgroundCheckStatus({ searchResults }) {
  const resultsCount = searchResults?.resultsFound || 0;
  const hasTrustedPresence = searchResults?.hasTrustedPresence || false;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Background Check Results</h3>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className={`text-2xl font-bold mt-0.5 ${resultsCount > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {resultsCount > 0 ? '✓' : '✗'}
          </div>
          <div>
            <h4 className="font-medium">Online Presence</h4>
            <p className="text-sm text-gray-600">
              {resultsCount > 0 
                ? `Found ${resultsCount} relevant results`
                : 'No significant online presence found'}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className={`text-2xl font-bold mt-0.5 ${hasTrustedPresence ? 'text-green-500' : 'text-red-500'}`}>
            {hasTrustedPresence ? '✓' : '✗'}
          </div>
          <div>
            <h4 className="font-medium">Verified Platforms</h4>
            <p className="text-sm text-gray-600">
              {hasTrustedPresence 
                ? 'Present on trusted platforms'
                : 'No presence on verified platforms'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BackgroundCheckStatus;