import React, { useState, useEffect } from 'react';
import { LatLonCoordinates, ConversionResult } from '../types/coordinates';
import { convertLatLonToUTM, formatUTMCoordinates } from '../utils/coordinateConverter';
import './CoordinateConverter.css';

const CoordinateConverter: React.FC = () => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [result, setResult] = useState<ConversionResult | null>(null);

  // Convert coordinates whenever input changes
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        const coordinates: LatLonCoordinates = { latitude: lat, longitude: lon };
        const conversionResult = convertLatLonToUTM(coordinates);
        setResult(conversionResult);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [latitude, longitude]);

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLatitude(e.target.value);
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLongitude(e.target.value);
  };

  const clearInputs = () => {
    setLatitude('');
    setLongitude('');
    setResult(null);
  };

  const loadExample = () => {
    setLatitude('40.7831');
    setLongitude('-73.9712');
  };

  return (
    <div className="coordinate-converter">
      <div className="converter-card">
        <h1>Latitude/Longitude to UTM Converter</h1>
        <p className="description">
          Enter latitude and longitude coordinates to convert them to UTM (Universal Transverse Mercator) format.
        </p>
        
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="latitude">Latitude (°):</label>
            <input
              id="latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={handleLatitudeChange}
              placeholder="e.g., 40.7831"
              className="coordinate-input"
            />
            <small>Range: -90 to 90 degrees</small>
          </div>
          
          <div className="input-group">
            <label htmlFor="longitude">Longitude (°):</label>
            <input
              id="longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={handleLongitudeChange}
              placeholder="e.g., -73.9712"
              className="coordinate-input"
            />
            <small>Range: -180 to 180 degrees</small>
          </div>
          
          <div className="button-group">
            <button onClick={loadExample} className="example-btn">
              Load Example (NYC)
            </button>
            <button onClick={clearInputs} className="clear-btn">
              Clear
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section">
            <h2>UTM Coordinates</h2>
            {result.isValid ? (
              <div className="result-content">
                <div className="result-grid">
                  <div className="result-item">
                    <span className="label">Zone:</span>
                    <span className="value">{result.utm.zone}{result.utm.hemisphere}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Easting:</span>
                    <span className="value">{result.utm.easting.toLocaleString()} m</span>
                  </div>
                  <div className="result-item">
                    <span className="label">Northing:</span>
                    <span className="value">{result.utm.northing.toLocaleString()} m</span>
                  </div>
                </div>
                <div className="formatted-result">
                  <strong>Formatted: {formatUTMCoordinates(result.utm)}</strong>
                </div>
              </div>
            ) : (
              <div className="error-message">
                <strong>Error:</strong> {result.error}
              </div>
            )}
          </div>
        )}
        
        <div className="info-section">
          <h3>About UTM Coordinates</h3>
          <ul>
            <li>UTM divides the Earth into 60 zones, each 6° of longitude wide</li>
            <li>Easting: distance east from the zone's central meridian (in meters)</li>
            <li>Northing: distance north from the equator (in meters)</li>
            <li>Hemisphere: N (Northern) or S (Southern)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CoordinateConverter;
