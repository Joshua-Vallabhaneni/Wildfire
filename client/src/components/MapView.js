// client/src/components/MapView.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mapStyles = {
  container: {
    position: 'relative',
    height: '100vh',
    width: '100%',
  },
  mapContainer: {
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  toggleButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    padding: '12px 24px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    fontWeight: '600',
  },
  popup: {
    margin: '0',
    padding: '10px',
  },
  popupTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: '8px',
  },
  popupAddress: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  popupDistance: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '12px',
  },
  popupTasks: {
    marginTop: '8px',
  },
  popupTaskTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  taskItem: {
    fontSize: '14px',
    color: '#666',
    padding: '4px 0'
  }
};

function MapView({ orgs, userLocation, setView, view }) {
  const [distances, setDistances] = useState({});
  const LACenter = [34.0522, -118.2437];
  const zoomLevel = 10;

  // Filter out virtual/nationwide organizations
  const physicalOrgs = orgs.filter(org => 
    !org.address.toLowerCase().includes('virtual') && 
    !org.address.toLowerCase().includes('nationwide')
  );

  useEffect(() => {
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 3959; // Earth's radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return (R * c).toFixed(1);
    };

    const geocodeAndCalculateDistances = async () => {
      if (!userLocation) return;

      const updatedDistances = {};

      for (const org of physicalOrgs) {
        try {
          const encodedAddress = encodeURIComponent(org.address);
          const response = await fetch(
            `https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf62487b6a99d2d000446a95d1308087fb1056&text=${encodedAddress}`
          );
          const data = await response.json();
          
          if (data.features && data.features[0]) {
            const [lng, lat] = data.features[0].geometry.coordinates;
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              lat,
              lng
            );
            updatedDistances[org._id] = distance;
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }

      setDistances(updatedDistances);
    };

    geocodeAndCalculateDistances();
  }, [physicalOrgs, userLocation]);

  return (
    <div style={mapStyles.container}>
      {/* <button
        style={mapStyles.toggleButton}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#F57C00';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#FF9800';
          e.target.style.transform = 'translateY(0)';
        }}
        onClick={() => setView(view === 'map' ? 'list' : 'map')}
      >
        Switch to {view === 'map' ? 'List' : 'Map'} View
      </button> */}

      <MapContainer 
        center={LACenter}
        zoom={zoomLevel} 
        style={mapStyles.mapContainer}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
            <Popup>
              <div style={mapStyles.popup}>
                <div style={mapStyles.popupTitle}>Your Location</div>
              </div>
            </Popup>
          </Marker>
        )}

        {physicalOrgs.map((org) => (
          <Marker
            key={org._id || Math.random()}
            position={[
              34.05 + Math.random() * 0.1,
              -118.24 + Math.random() * 0.1,
            ]}
            icon={redIcon}
          >
            <Popup>
              <div style={mapStyles.popup}>
                <div style={mapStyles.popupTitle}>{org.name}</div>
                <div style={mapStyles.popupAddress}>{org.address}</div>
                {distances[org._id] && (
                  <div style={mapStyles.popupDistance}>
                    {distances[org._id]} miles away
                  </div>
                )}
                <div style={mapStyles.popupTasks}>
                  <div style={mapStyles.popupTaskTitle}>Tasks Available:</div>
                  {org.tasksRequested.map((task, i) => (
                    <div key={i} style={mapStyles.taskItem}>
                      {task.title} (Urgency: {task.urgency}/10)
                    </div>
                  ))}
                </div>
                {org.link && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #eee'
                  }}>
                    <a
                      href={org.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#FF9800',
                        textDecoration: 'none',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
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
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;