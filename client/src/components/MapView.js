// client/src/components/MapView.js

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// MapView now only shows org markers (no tasks)
function MapView({ orgs, userLocation }) {
  const defaultCenter = [34.0522, -118.2437]; // L.A. by default
  const zoomLevel = 10;

  return (
    <div style={{ height: "600px", marginTop: "10px" }}>
      <MapContainer center={defaultCenter} zoom={zoomLevel} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Organization markers */}
        {orgs.map((org, i) => (
          <Marker
            key={i}
            position={[
              34.05 + Math.random() * 0.1,
              -118.24 + Math.random() * 0.1,
            ]}
          >
            <Popup>
              <b>{org.name}</b>
              <br />
              {org.address}
              <br />
              {org.taskType}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
