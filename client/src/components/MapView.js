// client/src/components/MapView.js
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// You might need to handle custom icon imports for the markers
// For brevity, let's use default markers

function MapView({ tasks, orgs, userLocation }) {
  // Center the map around Los Angeles or user location
  const defaultCenter = [34.0522, -118.2437]; // LA coords
  const zoomLevel = 10;

  // We'll need to convert addresses to lat/lng in real time using openrouteservice
  // For now, let's skip that or assume we have it in the DB.
  // This is a place to do distance matrix calls if needed.

  return (
    <div style={{ height: "600px", marginTop: "10px" }}>
      <MapContainer center={defaultCenter} zoom={zoomLevel} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Mark user location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {/* Mark organizations */}
        {orgs.map((org, i) => (
          <Marker key={i} position={[34.05 + (Math.random() * 0.1), -118.24 + (Math.random() * 0.1)]}>
            <Popup>
              <b>{org.name}</b><br/>
              {org.address}<br/>
              {org.taskType}
            </Popup>
          </Marker>
        ))}
        {/* Mark tasks */}
        {tasks.map((task, i) => (
          <Marker key={i} position={[34.05 + (Math.random() * 0.1), -118.24 + (Math.random() * 0.1)]}>
            <Popup>
              <b>Task:</b> {task.title}<br/>
              <b>Urgency:</b> {task.urgency}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
