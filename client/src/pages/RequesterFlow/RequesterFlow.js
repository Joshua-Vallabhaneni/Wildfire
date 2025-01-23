// client/src/pages/RequesterFlow/RequesterFlow.js
import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import RequesterBackgroundCheck from "./RequesterBackgroundCheck";
import RequesterAvailability from "./RequesterAvailability";
import RequesterTasks from "./RequesterTasks";
import RequesterDashboard from "./RequesterDashboard";

function RequesterFlow() {
  return (
    <Routes>
      <Route path=":userId/background-check" element={<RequesterBackgroundCheck />} />
      <Route path=":userId/availability" element={<RequesterAvailability />} />
      <Route path=":userId/tasks" element={<RequesterTasks />} />
      <Route path=":userId/dashboard" element={<RequesterDashboard />} />
    </Routes>
  );
}

export default RequesterFlow;
