// client/src/pages/VolunteerFlow/VolunteerFlow.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import VolunteerBackgroundCheck from "./VolunteerBackgroundCheck";
import VolunteerAvailability from "./VolunteerAvailability";
import VolunteerSkills from "./VolunteerSkills";
import VolunteerDashboard from "./VolunteerDashboard";

function VolunteerFlow() {
  return (
    <Routes>
      <Route path=":userId/background-check" element={<VolunteerBackgroundCheck />} />
      <Route path=":userId/availability" element={<VolunteerAvailability />} />
      <Route path=":userId/skills" element={<VolunteerSkills />} />
      <Route path=":userId/dashboard" element={<VolunteerDashboard />} />
    </Routes>
  );
}

export default VolunteerFlow;
