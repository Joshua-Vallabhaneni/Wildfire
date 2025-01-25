// client/src/pages/DirectMessages/DirectMessages.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import DirectMessageInterface from '../../components/DirectMessageInterface';

function DirectMessages() {
  const location = useLocation();
  const userId = location.state?.userId;

  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Error</h2>
          <p className="text-gray-600 mb-6">Please access messages through your dashboard.</p>
        </div>
      </div>
    );
  }

  return <DirectMessageInterface userId={userId} />;
}

export default DirectMessages;