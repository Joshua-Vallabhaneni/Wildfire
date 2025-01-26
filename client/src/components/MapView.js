import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const containerStyles = {
  position: "relative",
  width: "100%",
  height: "100vh",
  background: "linear-gradient(135deg, #FF4500, #FFA500, #FFFFFF)",
  overflow: "hidden",
};

const mapStyle = {
  height: "100%",
  width: "100%",
};

/** 
 * Marker icons 
 */
const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const governmentIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const privateIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const requestorIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

function getOrgIcon(org) {
  console.log("Getting icon for org:", org);
  if (org.isRequestor === true) {
    console.log("Using requestor icon");
    return requestorIcon;
  }
  
  const lowerName = (org.name || "").toLowerCase();
  if (lowerName.includes("fire") || lowerName.includes("lafd") || lowerName.includes("fema")) {
    console.log("Using government icon");
    return governmentIcon;
  }
  
  console.log("Using private icon");
  return privateIcon;
}


const popupStyles = {
  title: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#FF4500",
    marginBottom: "6px",
  },
  address: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "4px",
  },
  distance: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "6px",
  },
  tasks: {
    marginTop: "6px",
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  taskItem: {
    fontSize: "14px",
    color: "#666",
    padding: "2px 0",
  },
};

function MapView({ orgs, requestorTasks }) {
  const [userLocation, setUserLocation] = useState(null);
  const [geocodedOrgs, setGeocodedOrgs] = useState([]);
  const [loadingGeocode, setLoadingGeocode] = useState(true);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          console.warn("Geolocation error => fallback LA");
          setUserLocation({ lat: 34.0522, lng: -118.2437 });
        }
      );
    } else {
      setUserLocation({ lat: 34.0522, lng: -118.2437 });
    }
  }, []);

  // Geocode addresses
  useEffect(() => {
async function geocodeAll() {
  setLoadingGeocode(true);
  const results = [];

  // Handle organizations first
  for (const org of (orgs || [])) {
    if (!org.address) continue;

    let lat = null;
    let lng = null;

    if (org.address.toLowerCase().includes("virtual") || 
        org.address.toLowerCase().includes("nationwide")) {
      lat = 34.05 + Math.random() * 0.1;
      lng = -118.24 + Math.random() * 0.1;
    } else {
      const encoded = encodeURIComponent(org.address);
      try {
        const resp = await fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf62487b6a99d2d000446a95d1308087fb1056&text=${encoded}`
        );
        const data = await resp.json();
        if (data.features && data.features.length > 0) {
          const [lngFound, latFound] = data.features[0].geometry.coordinates;
          lat = latFound;
          lng = lngFound;
        } else {
          lat = 34.05 + Math.random() * 0.1;
          lng = -118.24 + Math.random() * 0.1;
        }
      } catch (err) {
        console.error("Geocode error for organization:", org.address, err);
        lat = 34.05 + Math.random() * 0.1;
        lng = -118.24 + Math.random() * 0.1;
      }
    }

    results.push({
      ...org,
      lat,
      lng
    });
  }

  // Hardcoded requestor tasks (around LA area)
  const hardcodedRequestors = [
    {
      isRequestor: true,
      _id: 'req-1',
      name: 'Linda Chang',
      address: '567 Ocean View Rd, Ventura, CA',
      lat: 34.0611,
      lng: -118.2351,
      tasksRequested: [{
        title: 'Replant Garden Area',
        urgency: 5,
        category: 'Sustainability'
      }]
    },
    {
      isRequestor: true,
      _id: 'req-2',
      name: 'Mike Rodriguez',
      address: '123 Glendale Ave, Los Angeles, CA',
      lat: 34.0477,
      lng: -118.2425,
      tasksRequested: [{
        title: 'Clear Debris',
        urgency: 7,
        category: 'Infrastructure'
      }]
    },
    {
      isRequestor: true,
      _id: 'req-3',
      name: 'Sarah Kim',
      address: '789 Highland Park, Los Angeles, CA',
      lat: 34.0522,
      lng: -118.2437,
      tasksRequested: [{
        title: 'Community Garden Setup',
        urgency: 6,
        category: 'Sustainability'
      }]
    }
  ];

  // Add hardcoded requestors to results
  results.push(...hardcodedRequestors);

  console.log("Final results including hardcoded requestors:", results);
  setGeocodedOrgs(results);
  setLoadingGeocode(false);
}

    geocodeAll();
  }, [orgs, requestorTasks]);

  let mapCenter = [34.0522, -118.2437];
  if (userLocation) {
    mapCenter = [userLocation.lat, userLocation.lng];
  }
  const zoomLevel = 10;

  if (loadingGeocode) {
    return (
      <div style={containerStyles}>
        <p style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>
          Loading map data...
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <MapContainer center={mapCenter} zoom={zoomLevel} style={mapStyle}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div style={popupStyles.title}>You Are Here</div>
            </Popup>
          </Marker>
        )}

        {geocodedOrgs.map((org) => {
          const distStr = userLocation
            ? getDistanceInMiles(userLocation.lat, userLocation.lng, org.lat, org.lng)
            : null;

          return (
            <Marker key={org._id || org.name} position={[org.lat, org.lng]} icon={getOrgIcon(org)}>
              <Popup>
                <div>
                  <div style={popupStyles.title}>{org.name}</div>
                  <div style={popupStyles.address}>{org.address}</div>
                  {distStr && (
                    <div style={popupStyles.distance}>{distStr} miles away</div>
                  )}

                  {org.tasksRequested && org.tasksRequested.length > 0 && (
                    <div style={popupStyles.tasks}>
                      <div style={popupStyles.taskTitle}>Tasks Available:</div>
                      {org.tasksRequested.map((task, idx) => (
                        <div key={idx} style={popupStyles.taskItem}>
                          {task.title} (Urgency: {task.urgency}/10)
                        </div>
                      ))}
                    </div>
                  )}

                  {org.link && (
                    <div style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #eee",
                    }}>
                      <a
                        href={org.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#FF4500",
                          textDecoration: "none",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        padding: "8px 12px",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        fontSize: "0.9rem",
        lineHeight: "1.4",
        zIndex: 9999,
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
            alt="user"
            style={{ width: "16px", height: "26px", marginRight: "6px" }}
          />
          You
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
            alt="gov"
            style={{ width: "16px", height: "26px", marginRight: "6px" }}
          />
          Government
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"
            alt="private"
            style={{ width: "16px", height: "26px", marginRight: "6px" }}
          />
          Private
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png"
            alt="requestor"
            style={{ width: "16px", height: "26px", marginRight: "6px" }}
          />
          Requestor
        </div>
      </div>
    </div>
  );
}

export default MapView;