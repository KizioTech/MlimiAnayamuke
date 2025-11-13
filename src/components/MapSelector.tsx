import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from "react-leaflet";
import { LatLng, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
import L from "leaflet";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapSelectorProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  onPolygonSelect?: (coordinates: LatLngExpression[]) => void;
  initialLocation?: { lat: number; lng: number };
  initialPolygon?: LatLngExpression[];
  mode?: 'point' | 'polygon';
  height?: string;
}

function LocationMarker({ onLocationSelect, initialLocation }: {
  onLocationSelect?: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}) {
  const [position, setPosition] = useState<LatLng | null>(
    initialLocation ? new LatLng(initialLocation.lat, initialLocation.lng) : null
  );

  const map = useMapEvents({
    click(e) {
      if (onLocationSelect) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  useEffect(() => {
    if (initialLocation && !position) {
      setPosition(new LatLng(initialLocation.lat, initialLocation.lng));
      map.setView([initialLocation.lat, initialLocation.lng], 13);
    }
  }, [initialLocation, map, position]);

  return position === null ? null : (
    <Marker position={position} />
  );
}

function PolygonDrawer({ onPolygonSelect, initialPolygon }: {
  onPolygonSelect?: (coordinates: LatLngExpression[]) => void;
  initialPolygon?: LatLngExpression[];
}) {
  const [polygonPoints, setPolygonPoints] = useState<LatLngExpression[]>(
    initialPolygon || []
  );

  const map = useMapEvents({
    click(e) {
      if (onPolygonSelect) {
        const newPoints: LatLngExpression[] = [...polygonPoints, [e.latlng.lat, e.latlng.lng] as LatLngExpression];
        setPolygonPoints(newPoints);
        onPolygonSelect(newPoints);
      }
    },
  });

  useEffect(() => {
    if (initialPolygon && polygonPoints.length === 0) {
      setPolygonPoints(initialPolygon);
    }
  }, [initialPolygon, polygonPoints.length]);

  return polygonPoints.length > 0 ? (
    <Polygon positions={polygonPoints} color="blue" fillColor="blue" fillOpacity={0.2} />
  ) : null;
}

const MapSelector = ({
  onLocationSelect,
  onPolygonSelect,
  initialLocation,
  initialPolygon,
  mode = 'point',
  height = "400px"
}: MapSelectorProps) => {
  const defaultCenter: [number, number] = [-13.9626, 33.7741]; // Blantyre, Malawi coordinates

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mode === 'point' && (
          <LocationMarker
            onLocationSelect={onLocationSelect}
            initialLocation={initialLocation}
          />
        )}
        {mode === 'polygon' && (
          <PolygonDrawer
            onPolygonSelect={onPolygonSelect}
            initialPolygon={initialPolygon}
          />
        )}
      </MapContainer>
      {mode === 'polygon' && (
        <div className="mt-2 text-sm text-muted-foreground">
          Click on the map to draw your farm boundary. Click multiple points to create a polygon.
        </div>
      )}
    </div>
  );
};

export default MapSelector;