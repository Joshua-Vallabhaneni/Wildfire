// client/src/components/MatchingDashboard.js
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, Shield, Tag } from 'lucide-react';

const TaskCard = ({ task, onClick }) => {
  const urgencyColor = (urgency) => {
    if (urgency >= 8) return 'text-red-600';
    if (urgency >= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex justify-between items-start">
          <span>{task.title}</span>
          <span className={`text-sm ${urgencyColor(task.urgency)}`}>
            Urgency: {task.urgency}/10
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

const MatchesSection = ({ title, tasks, emptyMessage }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <Alert>
          <AlertTitle>No matches found</AlertTitle>
          <AlertDescription>{emptyMessage}</AlertDescription>
        </Alert>
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
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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