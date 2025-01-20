// client/src/pages/RequesterFlow/RequesterFlow.js
import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import RequesterAvailability from "./RequesterAvailability";
import RequesterTasks from "./RequesterTasks";
import RequesterBackgroundCheck from "./RequesterBackgroundCheck";
import RequesterDashboard from "./RequesterDashboard";

function RequesterFlow() {
  // Grab userId from the URL
  const { "*": subpath } = useParams();
  // subpath might be something like "63abc123/availability"

  return (
    <Routes>
      <Route path=":userId/availability" element={<RequesterAvailability />} />
      <Route path=":userId/tasks" element={<RequesterTasks />} />
      <Route path=":userId/background-check" element={<RequesterBackgroundCheck />} />
      <Route path=":userId/dashboard" element={<RequesterDashboard />} />
    </Routes>
  );
}

export default RequesterFlow;
