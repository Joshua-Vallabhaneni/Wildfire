// client/src/components/MatchingDashboard.js
import React, { useEffect, useState } from 'react';
import { MapPin, Clock, Shield, Tag } from 'lucide-react';

/**
 * TaskCard Component
 * - Replaces <Card> with simple <div> containers
 */
const TaskCard = ({ task, onClick }) => {
  const urgencyColor = (urgency) => {
    if (urgency >= 8) return 'text-red-600';
    if (urgency >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div
      className="mb-4 p-4 border rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* This section replaces CardHeader + CardTitle */}
      <div className="pb-2">
        <div className="text-lg font-semibold flex justify-between items-start">
          <span>{task.title}</span>
          <span className={`text-sm ${urgencyColor(task.urgency)}`}>
            Urgency: {task.urgency}/10
          </span>
        </div>
      </div>

      {/* This section replaces CardContent */}
      <div>
        <div className="space-y-2">
          {task.organization && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {task.organization.name} - {task.organization.address}
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Tag className="h-4 w-4 mr-2" />
            {task.category}
          </div>

          {task.requesterAvailability && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {Object.entries(task.requesterAvailability)
                .map(([day, slots]) => `${day}: ${slots.join(', ')}`)
                .join(' | ')}
            </div>
          )}

          {task.specialtyRequired && (
            <div className="flex items-center text-sm text-orange-600">
              <Shield className="h-4 w-4 mr-2" />
              Requires Special Skills
            </div>
          )}

          <div className="text-sm text-gray-600 pt-2 border-t">
            Match Score: {(task.matchScore * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MatchesSection Component
 * - Replaces <Alert> with a simple <div> block for "No matches found".
 */
const MatchesSection = ({ title, tasks, emptyMessage }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        {/* Replaced Alert with a simpler alert-like div */}
        <div className="border border-orange-200 bg-orange-50 p-4 rounded">
          <strong className="block mb-1">No matches found</strong>
          <p className="text-sm text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <TaskCard
            key={index}
            task={task}
            onClick={() => {
              if (task.organization?.link) {
                window.open(task.organization.link, '_blank');
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * MatchingDashboard Component
 * - Uses the above two components to show matches for a volunteer.
 */
const MatchingDashboard = ({ volunteerId }) => {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/matching/${volunteerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [volunteerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    // Basic error message instead of <Alert>
    return (
      <div className="p-4 max-w-lg mx-auto mt-8 border border-red-300 bg-red-50 text-red-800">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Your Matched Opportunities</h1>

      <MatchesSection
        title="Top Matches from Individual Requesters"
        tasks={matches?.requestorTasks || []}
        emptyMessage="No matching tasks from individual requesters found."
      />

      <MatchesSection
        title="Matches from Private Organizations"
        tasks={matches?.privateOrgs || []}
        emptyMessage="No matching tasks from private organizations found."
      />

      <MatchesSection
        title="Matches from Government Organizations"
        tasks={matches?.governmentOrgs || []}
        emptyMessage="No matching tasks from government organizations found."
      />
    </div>
  );
};

export default MatchingDashboard;
