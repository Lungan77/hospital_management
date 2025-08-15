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

// Custom ambulance icons based on status
const createAmbulanceIcon = (status) => {
  const colors = {
    "Available": "green",
    "Dispatched": "blue", 
    "En Route": "purple",
    "On Scene": "orange",
    "Transporting": "red",
    "Out of Service": "grey",
    "Maintenance": "yellow"
  };
  
  const color = colors[status] || "grey";
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function FleetMap({ 
  ambulances, 
  onAmbulanceSelect, 
  selectedAmbulance,
  center = [-26.2041, 28.0473], // Default to Johannesburg
  zoom = 12
}) {
  const [mapCenter, setMapCenter] = useState(center);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    // If ambulances are available, center map on fleet
    if (ambulances.length > 0) {
      const validLocations = ambulances.filter(a => 
        a.currentLocation?.latitude && 
        a.currentLocation?.longitude &&
        !isNaN(a.currentLocation.latitude) &&
        !isNaN(a.currentLocation.longitude)
      );
      
      if (validLocations.length > 0) {
        // Calculate center of all ambulances
        const avgLat = validLocations.reduce((sum, a) => sum + a.currentLocation.latitude, 0) / validLocations.length;
        const avgLng = validLocations.reduce((sum, a) => sum + a.currentLocation.longitude, 0) / validLocations.length;
        setMapCenter([avgLat, avgLng]);
        setMapKey(prev => prev + 1); // Force map re-initialization
      }
    }
  }, [ambulances]);

  const handleAmbulanceClick = (ambulance) => {
    if (onAmbulanceSelect) {
      onAmbulanceSelect(ambulance);
    }
  };

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
      <MapContainer
        key={mapKey}
        center={mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
      >
        <MapUpdater center={mapCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Ambulance Markers */}
        {ambulances.map((ambulance) => {
          if (!ambulance.currentLocation?.latitude || 
              !ambulance.currentLocation?.longitude ||
              isNaN(ambulance.currentLocation.latitude) ||
              isNaN(ambulance.currentLocation.longitude)) {
            return null;
          }
          
          const position = [ambulance.currentLocation.latitude, ambulance.currentLocation.longitude];
          const icon = createAmbulanceIcon(ambulance.status);
          
          return (
            <Marker 
              key={ambulance._id} 
              position={position} 
              icon={icon}
              eventHandlers={{
                click: () => handleAmbulanceClick(ambulance)
              }}
            >
              <Popup>
                <div className="text-center min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{ambulance.callSign}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Vehicle:</strong> {ambulance.vehicleNumber}</p>
                    <p><strong>Type:</strong> {ambulance.type}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        ambulance.status === "Available" ? "bg-green-100 text-green-700" :
                        ambulance.status === "Dispatched" ? "bg-blue-100 text-blue-700" :
                        ambulance.status === "En Route" ? "bg-purple-100 text-purple-700" :
                        ambulance.status === "On Scene" ? "bg-orange-100 text-orange-700" :
                        ambulance.status === "Transporting" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {ambulance.status}
                      </span>
                    </p>
                    <p><strong>Radio:</strong> {ambulance.radioChannel || "N/A"}</p>
                    <p><strong>Fuel:</strong> {ambulance.fuelLevel || 0}%</p>
                    {ambulance.crew && ambulance.crew.length > 0 && (
                      <div className="mt-2">
                        <p><strong>Crew:</strong></p>
                        {ambulance.crew.map((member, idx) => (
                          <p key={idx} className="text-xs ml-2">
                            {member.role}: {member.memberId?.name || "Unassigned"}
                          </p>
                        ))}
                      </div>
                    )}
                    {ambulance.currentEmergency && (
                      <div className="mt-2 p-2 bg-red-100 rounded">
                        <p className="text-xs"><strong>Emergency:</strong> {ambulance.currentEmergency.incidentNumber}</p>
                        <p className="text-xs"><strong>Priority:</strong> {ambulance.currentEmergency.priority}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {ambulance.currentLocation.lastUpdated ? 
                        new Date(ambulance.currentLocation.lastUpdated).toLocaleTimeString() : "Unknown"}
                    </p>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handleAmbulanceClick(ambulance)}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    {ambulance.currentLocation?.address && (
                      <button
                        onClick={() => {
                          const address = encodeURIComponent(ambulance.currentLocation.address);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                        }}
                        className="w-full bg-green-600 text-white px-3 py-2 rounded text-xs hover:bg-green-700 transition-colors mt-2"
                      >
                        Open in Google Maps
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}