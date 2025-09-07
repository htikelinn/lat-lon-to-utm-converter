import React, { useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface MapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  markers: google.maps.LatLngLiteral[];
  coordinateInfo?: {
    utm?: string;
    mmUtm?: string;
    mgrs?: string;
  };
}

interface GoogleMapComponentProps extends MapProps {}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ 
  center, 
  zoom, 
  markers, 
  coordinateInfo 
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (ref.current && !mapRef.current) {
      // Initialize map
      mapRef.current = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'hybrid', // Show satellite view with labels
      });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (mapRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      markers.forEach(position => {
        const marker = new window.google.maps.Marker({
          position,
          map: mapRef.current,
          title: `Location: ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`,
        });

        // Create info window with coordinate information
        if (coordinateInfo) {
          const infoContent = `
            <div style="padding: 8px; font-family: Arial, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #333;">Coordinate Information</h3>
              <div style="font-size: 12px; line-height: 1.4;">
                <strong>Lat/Lon:</strong> ${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}<br/>
                ${coordinateInfo.utm ? `<strong>UTM:</strong> ${coordinateInfo.utm}<br/>` : ''}
                ${coordinateInfo.mmUtm ? `<strong>MM_UTM:</strong> ${coordinateInfo.mmUtm}<br/>` : ''}
                ${coordinateInfo.mgrs ? `<strong>MGRS:</strong> ${coordinateInfo.mgrs}` : ''}
              </div>
            </div>
          `;

          const infoWindow = new window.google.maps.InfoWindow({
            content: infoContent,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapRef.current, marker);
          });
        }

        markersRef.current.push(marker);
      });

      // Center map on first marker if available
      if (markers.length > 0) {
        mapRef.current.setCenter(markers[0]);
      }
    }
  }, [markers, coordinateInfo]);

  return <div ref={ref} style={{ width: '100%', height: '400px' }} />;
};

const render = (status: Status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading Google Maps...</div>;
    case Status.FAILURE:
      return <div className="map-error">Error loading Google Maps. Please check your API key.</div>;
    case Status.SUCCESS:
    default:
      return <></>; // Empty fragment instead of null
  }
};

interface GoogleMapProps extends MapProps {}

const GoogleMap: React.FC<GoogleMapProps> = (props) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="map-error">
        Google Maps API key is not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file.
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <GoogleMapComponent {...props} />
    </Wrapper>
  );
};

export default GoogleMap;
