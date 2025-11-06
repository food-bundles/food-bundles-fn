/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LocationData {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  tempLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (location: LocationData) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapComponent({ tempLocation, onLocationSelect }: MapComponentProps) {
  return (
    <div className="flex-1 rounded border border-gray-300 overflow-hidden">
      <MapContainer
        center={[
          tempLocation?.lat || -1.9577,
          tempLocation?.lng || 30.0619,
        ]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onLocationSelect={onLocationSelect} />
        {tempLocation && (
          <Marker position={[tempLocation.lat, tempLocation.lng]} />
        )}
      </MapContainer>
    </div>
  );
}