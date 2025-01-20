// client/src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RequesterFlow from "./pages/RequesterFlow/RequesterFlow";
import VolunteerFlow from "./pages/VolunteerFlow/VolunteerFlow";
import DirectMessages from "./pages/DirectMessages/DirectMessages";
import SustainabilityTracker from "./pages/SustainabilityTracker/SustainabilityTracker";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/requester/*" element={<RequesterFlow />} />
        <Route path="/volunteer/*" element={<VolunteerFlow />} />
        <Route path="/messages" element={<DirectMessages />} />
        <Route path="/sustainability" element={<SustainabilityTracker />} />
      </Routes>
    </div>
  );
}

export default App;
