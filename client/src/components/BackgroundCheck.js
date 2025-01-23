import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackgroundCheckStatus from './BackgroundCheckStatus';

function BackgroundCheck({ userType }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const runCheck = async () => {
      try {
        console.log('Starting background check...');
        const res = await fetch(`http://localhost:8080/api/background-check/${userId}/runBackgroundCheck`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        const data = await res.json();
        console.log('Received response:', data);

        if (data.backgroundCheckStatus === "approved") {
          setStatus("Approved");
        } else {
          setStatus("Failed");
        }

        if (data.debugInfo) {
          setDebugInfo(data.debugInfo);
        }
      } catch (error) {
        console.error("Error running background check:", error);
        setStatus("Error");
        setDebugInfo({ error: error.message });
      }
    };

    runCheck();
  }, [userId]);

  const proceed = () => {
    if (status === "Approved") {
      navigate(`/${userType}/${userId}/availability`);
    } else {
      alert("Background check failed or not approved yet. Cannot proceed.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {userType === 'requester' ? 'Requester' : 'Volunteer'} Background Check
      </h2>
      
      {/* Status Section */}
      <div className="mb-4 p-4 border rounded">
        <p className="text-lg font-semibold">
          Status: {' '}
          <span className={
            status === "Approved" ? "text-green-600" :
            status === "Failed" ? "text-red-600" :
            "text-yellow-600"
          }>
            {status}
          </span>
        </p>
      </div>

      {/* Action Button */}
      {status === "Approved" && (
        <button 
          onClick={proceed}
          className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Proceed to Next Step
        </button>
      )}

      {/* Debug Information */}
      <div className="mt-6 space-y-6">
        {/* Status Categories */}
        {debugInfo?.nameResults && (
          <BackgroundCheckStatus 
            searchResults={{
              resultsFound: debugInfo.nameResults.resultsFound,
              hasTrustedPresence: debugInfo.nameResults.hasTrustedPresence
            }}
          />
        )}
        
        {/* Technical Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Technical Details</h3>
          {debugInfo ? (
            <div className="space-y-4">
              {debugInfo.nameQuery && (
                <div>
                  <h4 className="font-medium">Search Query:</h4>
                  <pre className="bg-white p-2 rounded">{debugInfo.nameQuery}</pre>
                </div>
              )}
              
              {debugInfo.totalResults !== undefined && (
                <div>
                  <h4 className="font-medium">Total Results:</h4>
                  <p>{debugInfo.totalResults}</p>
                </div>
              )}
              
              {debugInfo.reasonForStatus && (
                <div>
                  <h4 className="font-medium">Reason for Status:</h4>
                  <p>{debugInfo.reasonForStatus}</p>
                </div>
              )}
            </div>
          ) : (
            <p>Loading debug information...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BackgroundCheck;