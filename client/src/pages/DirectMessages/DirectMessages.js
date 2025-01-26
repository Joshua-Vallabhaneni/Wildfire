// client/src/pages/DirectMessages/DirectMessages.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DirectMessageInterface from '../../components/DirectMessageInterface';

function DirectMessages() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;

  useEffect(() => {
    console.log('DirectMessages state:', state);
  }, [state]);

  if (!state?.userId) {
    console.log('No user ID found in state');
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Error</h2>
          <p className="text-gray-600 mb-6">
            Please access messages through your dashboard.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DirectMessageInterface
      userId={state.userId}
      initialRecipient={state.isNewChat ? {
        id: state.recipientId,
        name: state.recipientName
      } : null}
    />
  );
}

export default DirectMessages;