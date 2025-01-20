// client/src/pages/VolunteerFlow/VolunteerFlow.js
import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import VolunteerAvailability from "./VolunteerAvailability";
import VolunteerSkills from "./VolunteerSkills";
import VolunteerBackgroundCheck from "./VolunteerBackgroundCheck";
import VolunteerDashboard from "./VolunteerDashboard";

function VolunteerFlow() {
  return (
    <Routes>
      <Route path=":userId/availability" element={<VolunteerAvailability />} />
      <Route path=":userId/skills" element={<VolunteerSkills />} />
      <Route path=":userId/background-check" element={<VolunteerBackgroundCheck />} />
      <Route path=":userId/dashboard" element={<VolunteerDashboard />} />
    </Routes>
  );
}

export default VolunteerFlow;
