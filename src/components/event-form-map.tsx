'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

interface EventFormMapProps {
  position: [number, number];
  onLocationSelect: (coords: { lat: number, lng: number }) => void;
  className?: string;
}

// Custom SVG icon to avoid webpack issues with default icon images
const customIcon = new L.DivIcon({
  html: `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.404 12.5 41 12.5 41C12.5 41 25 21.404 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17.5C9.848 17.5 7.75 15.402 7.75 12.75C7.75 10.098 9.848 8 12.5 8C15.152 8 17.25 10.098 17.25 12.75C17.25 15.402 15.152 17.5 12.5 17.5Z" fill="#3388ff"/></svg>`,
  className: 'dummy',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (coords: { lat: number, lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

const EventFormMap = ({ position, onLocationSelect, className }: EventFormMapProps) => {
  if (typeof window === 'undefined') {
    return <div className={className} style={{ height: '200px', width: '100%', backgroundColor: 'hsl(var(--muted))' }} />;
  }

  return (
    <div className={className} style={{ height: '200px', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      <MapContainer 
        key={position.join(',')}
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={customIcon} />
        <MapClickHandler onLocationSelect={onLocationSelect} />
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
};

export default EventFormMap;
