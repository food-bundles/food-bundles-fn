/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { LocateFixed, Loader2 } from "lucide-react";

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
  /** Show a "Use my current location" button (browser GPS). */
  showLocateButton?: boolean;
  /** Pan the map to an area without placing a pin. Pass a new object to move it again. */
  focus?: MapFocus | null;
}

interface MapFocus extends LocationData {
  zoom?: number;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (location: LocationData) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Maps opened inside a popup start before their box has its final size, which
// leaves grey tiles; re-measure once it is on screen. Also follow the pin.
function MapSync({ location }: { location: LocationData | null }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 250);
    return () => clearTimeout(timer);
  }, [map]);
  useEffect(() => {
    if (location) map.setView([location.lat, location.lng], Math.max(map.getZoom(), 16));
  }, [map, location]);
  return null;
}

// Moves the view to an area (e.g. a chosen district) without placing a pin
function FocusSync({ focus }: { focus: MapFocus | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], focus.zoom ?? 12);
  }, [map, focus]);
  return null;
}

export default function MapComponent({
  tempLocation,
  onLocationSelect,
  showLocateButton = false,
  focus,
}: MapComponentProps) {
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError("Your browser can't share its location. Tap the map instead.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onLocationSelect({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        setLocating(false);
        setLocateError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow it in your browser, or tap the map instead."
            : "Couldn't get your location. Tap the map to place the pin instead."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  return (
    // Fills its parent: give the parent a height (e.g. h-64)
    <div className="relative flex-1 h-full min-h-[200px] rounded border border-gray-300 overflow-hidden">
      <MapContainer
        center={[tempLocation?.lat || -1.9577, tempLocation?.lng || 30.0619]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker onLocationSelect={onLocationSelect} />
        <MapSync location={tempLocation} />
        <FocusSync focus={focus} />
        {tempLocation && <Marker position={[tempLocation.lat, tempLocation.lng]} />}
      </MapContainer>

      {showLocateButton && (
        <div className="absolute top-2 right-2 z-[1000] flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5 text-green-600" />
            )}
            {locating ? "Finding you..." : "Use my current location"}
          </button>
          {locateError && (
            <p className="max-w-56 rounded-md bg-white/95 px-2 py-1 text-[11px] text-red-600 shadow">
              {locateError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
