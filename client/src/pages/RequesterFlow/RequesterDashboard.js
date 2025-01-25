// client/src/pages/RequesterFlow/RequesterDashboard.js
import React from "react";
import { Link, useParams } from "react-router-dom";

function RequesterDashboard() {
  const { userId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Menu */}
      <nav className="bg-white shadow p-4 mb-4">
        <ul className="flex space-x-6">
          <li>
            <Link
              to={`/requester/${userId}/dashboard`}
              className="text-blue-600 hover:underline"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/messages"
              state={{ userId: userId }}
              className="text-blue-600 hover:underline"
            >
              Direct Messages
            </Link>
          </li>
          <li>
            <Link
              to="/sustainability"
              className="text-blue-600 hover:underline"
            >
              Sustainability Tracker
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Requester Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Welcome, your tasks are being matched with volunteers. You'll be notified when matches are found.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Your Tasks</h3>
              <p className="text-blue-600">View and manage your posted tasks</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Messages</h3>
              <p className="text-green-600">Connect with matched volunteers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequesterDashboard;