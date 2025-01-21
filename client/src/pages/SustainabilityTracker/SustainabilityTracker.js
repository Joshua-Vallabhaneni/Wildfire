// client/src/pages/SustainabilityTracker/SustainabilityTracker.js

import React from "react";

function SustainabilityTracker() {
  // No separate tasks collection anymore
  // You could fetch user-based tasks if desired
  return (
    <div style={{ padding: "20px" }}>
      <h2>Sustainability Tracker</h2>
      <p>
        This page used to display tasks from a separate "tasks" collection.
        That model has been removed. If you still want to track sustainability
        tasks, consider reading them from each user's "tasksRequested" field,
        or remove this page entirely.
      </p>
    </div>
  );
}

export default SustainabilityTracker;
