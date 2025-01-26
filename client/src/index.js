import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Add global styles
const globalStyles = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF); /* Match the gradient from LandingPage */
    font-family: "Inter", -apple-system, sans-serif;
    color: #1a1a1a;
  }
  #root {
    height: 100%;
  }
`;

// Inject global styles
const styleElement = document.createElement("style");
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);