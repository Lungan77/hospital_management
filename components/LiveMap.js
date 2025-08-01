"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const incidentIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ambulanceIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  
  return null;
}

export default function LiveMap({ 
  incidentLocation, 
  ambulanceLocation, 
  onNavigate,
  emergency 
}) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default to London

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to incident location if available
          if (incidentLocation) {
            setMapCenter(incidentLocation);
          }
        }
      );
    }
  }, [incidentLocation]);

  // Use incident location as center if available
  useEffect(() => {
    if (incidentLocation) {
      setMapCenter(incidentLocation);
    }
  }, [incidentLocation]);

  const handleNavigateToIncident = () => {
    if (incidentLocation && emergency?.address) {
      const address = encodeURIComponent(emergency.address);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`;
      window.open(url, '_blank');
      if (onNavigate) onNavigate();
    }
  };

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
      >
        <MapUpdater center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Incident Location Marker */}
        {incidentLocation && (
          <Marker position={incidentLocation} icon={incidentIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-red-600">Emergency Incident</h3>
                <p className="text-sm">{emergency?.address}</p>
                <p className="text-xs text-gray-600">Priority: {emergency?.priority}</p>
                <button
                  onClick={handleNavigateToIncident}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                >
                  Navigate Here
                </button>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Ambulance Location Marker */}
        {ambulanceLocation && (
          <Marker position={ambulanceLocation} icon={ambulanceIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-blue-600">Your Location</h3>
                <p className="text-sm">Current Position</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* User's Current Location */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">Your Current Location</h3>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}