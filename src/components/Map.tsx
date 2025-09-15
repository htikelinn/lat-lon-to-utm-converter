import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Ensure you import Leaflet CSS in your main CSS file or in index.js
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers: { lat: number; lng: number }[];
  coordinateInfo?: {
    utm?: string;
    mmUtm?: string;
    mgrs?: string;
  };
}

const LeafletMapComponent: React.FC<MapProps> = ({ 
  center, 
  zoom, 
  markers, 
  coordinateInfo 
}) => {
  // Custom icon for markers
  const icon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'), // Using default Leaflet icon
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((position, index) => (
        <Marker key={index} position={position} icon={icon}>
          <Popup>
            <div style={{ padding: '8px', fontFamily: 'Arial, sans-serif' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Coordinate Information</h3>
              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                <strong>Lat/Lon:</strong> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}<br />
                {coordinateInfo?.utm && <><strong>UTM:</strong> {coordinateInfo.utm}<br /></>}
                {coordinateInfo?.mmUtm && <><strong>MM_UTM:</strong> {coordinateInfo.mmUtm}<br /></>}
                {coordinateInfo?.mgrs && <><strong>MGRS:</strong> {coordinateInfo.mgrs}</>}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

const LeafletMap: React.FC<MapProps> = (props) => {
  return (
    <LeafletMapComponent {...props} />
  );
};

export default LeafletMap;