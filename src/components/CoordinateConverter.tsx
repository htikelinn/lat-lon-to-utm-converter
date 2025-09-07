import React, { useState, useEffect } from 'react';
import { ConversionResult } from '../types/coordinates';
import { convertCoordinates, formatUTMCoordinates } from '../utils/coordinateConverter';
import GoogleMap from './GoogleMap';
import './CoordinateConverter.css';

const CoordinateConverter: React.FC = () => {
  const [coordinate, setCoordinate] = useState<string>('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<{lat: number, lng: number} | null>(null);

  // Convert coordinates whenever input changes
  useEffect(() => {
    if (coordinate.trim()) {
      const conversionResult = convertCoordinates(coordinate.trim());
      setResult(conversionResult);
    } else {
      setResult(null);
    }
  }, [coordinate]);

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoordinate(e.target.value);
  };

  const clearInputs = () => {
    setCoordinate('');
    setResult(null);
  };

  const loadLatLonExample = () => {
    setCoordinate('16.8794118, 96.1420957');
  };

  const loadMMUTMExample = () => {
    setCoordinate('JU958681');
  };

  const loadMGRSExample = () => {
    setCoordinate('47QJU9549568421');
  };

  // Helper function to extract lat/lon from conversion result or input
  const getLatLonFromResult = (): {lat: number, lng: number} | null => {
    if (!result?.isValid) return null;

    // If input is already lat/lon, extract from the original input
    if (result.inputFormat === 'LATLON') {
      const coords = coordinate.split(/[,\t]/).map(s => parseFloat(s.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        return { lat: coords[0], lng: coords[1] };
      }
    }

    // For other formats, we need to convert back from MGRS
    if (result.mgrs) {
      try {
        const mgrs = require('mgrs');
        const latLonBounds = mgrs.inverse(result.mgrs.formatted);
        // Take the center of the bounding box
        const lat = (latLonBounds[1] + latLonBounds[3]) / 2;
        const lng = (latLonBounds[0] + latLonBounds[2]) / 2;
        return { lat, lng };
      } catch (error) {
        console.error('Error converting to lat/lon:', error);
        return null;
      }
    }

    return null;
  };

  const handleShowOnMap = () => {
    const latLon = getLatLonFromResult();
    if (latLon) {
      setMapCenter(latLon);
      setShowMap(true);
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  return (
    <div className="coordinate-converter">
      <div className="converter-card">
        <h1>Universal Coordinate Converter</h1>
        <p className="description">
          Enter coordinates in any supported format: Lat/Lon, MM_UTM (Myanmar), or MGRS. 
          The system will automatically detect and convert between all formats.
        </p>
        
        <div className="input-section">
          <div className="input-group">
            <label htmlFor="coordinate">Enter Coordinate:</label>
            <input
              id="coordinate"
              type="text"
              value={coordinate}
              onChange={handleCoordinateChange}
              placeholder="e.g., 16.123456, 96.123456 or JU123456 or 46QGJ1234567890"
              className="coordinate-input"
            />
            <small>Supports: Lat/Lon (comma separated), MM_UTM (8 chars), MGRS (15 chars)</small>
          </div>
          
          <div className="button-group">
            <button onClick={loadLatLonExample} className="example-btn">
              LatLon Example
            </button>
            <button onClick={loadMMUTMExample} className="example-btn">
              MM_UTM Example
            </button>
            <button onClick={loadMGRSExample} className="example-btn">
              MGRS Example
            </button>
            {result && result.isValid && (
              <button onClick={handleShowOnMap} className="map-btn">
                📍 Show on Map
              </button>
            )}
            <button onClick={clearInputs} className="clear-btn">
              Clear
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section">
            <h2>Coordinate Conversion Results</h2>
            {result.isValid ? (
              <div className="result-content">
                {result.inputFormat && (
                  <div className="input-format-info">
                    <strong>Detected Format:</strong> {result.inputFormat}
                  </div>
                )}
                
                <div className="results-grid">
                  {/* UTM Section */}
                  <div className="format-section">
                    <h3>UTM (WGS84)</h3>
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
                      <strong>{formatUTMCoordinates(result.utm)}</strong>
                    </div>
                  </div>

                  {/* MM_UTM Section */}
                  {result.mmUtm && (
                    <div className="format-section">
                      <h3>MM_UTM (Myanmar)</h3>
                      <div className="result-grid">
                        <div className="result-item">
                          <span className="label">Grid Zone:</span>
                          <span className="value">{result.mmUtm.gridZone}</span>
                        </div>
                        <div className="result-item">
                          <span className="label">Easting:</span>
                          <span className="value">{result.mmUtm.easting}</span>
                        </div>
                        <div className="result-item">
                          <span className="label">Northing:</span>
                          <span className="value">{result.mmUtm.northing}</span>
                        </div>
                      </div>
                      <div className="formatted-result">
                        <strong>{result.mmUtm.formatted}</strong>
                      </div>
                    </div>
                  )}

                  {/* MGRS Section */}
                  {result.mgrs && (
                    <div className="format-section">
                      <h3>MGRS</h3>
                      <div className="result-grid">
                        <div className="result-item">
                          <span className="label">Zone:</span>
                          <span className="value">{result.mgrs.zone}{result.mgrs.latitudeBand}</span>
                        </div>
                        <div className="result-item">
                          <span className="label">Grid Square:</span>
                          <span className="value">{result.mgrs.gridSquare}</span>
                        </div>
                        <div className="result-item">
                          <span className="label">Coordinates:</span>
                          <span className="value">{result.mgrs.easting} {result.mgrs.northing}</span>
                        </div>
                      </div>
                      <div className="formatted-result">
                        <strong>{result.mgrs.formatted}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="error-message">
                <strong>Error:</strong> {result.error}
              </div>
            )}
          </div>
        )}

        {showMap && mapCenter && result && (
          <div className="map-section">
            <div className="map-header">
              <h2>Location on Map</h2>
              <button onClick={handleCloseMap} className="close-map-btn">
                ✕ Close Map
              </button>
            </div>
            <GoogleMap
              center={mapCenter}
              zoom={15}
              markers={[mapCenter]}
              coordinateInfo={{
                utm: result.utm ? formatUTMCoordinates(result.utm) : undefined,
                mmUtm: result.mmUtm?.formatted,
                mgrs: result.mgrs?.formatted,
              }}
            />
            <div className="map-info">
              <p>Click on the marker to see detailed coordinate information.</p>
            </div>
          </div>
        )}
        
        <div className="info-section">
          <h3>About Coordinate Systems</h3>
          <div className="info-grid">
            <div className="info-item">
              <h4>UTM (Universal Transverse Mercator)</h4>
              <ul>
                <li>Divides Earth into 60 zones, each 6° of longitude wide</li>
                <li>Easting: distance east from zone's central meridian (meters)</li>
                <li>Northing: distance north from equator (meters)</li>
                <li>Hemisphere: N (Northern) or S (Southern)</li>
              </ul>
            </div>
            <div className="info-item">
              <h4>MM_UTM (Myanmar UTM)</h4>
              <ul>
                <li>8-character format specific to Myanmar region</li>
                <li>Works with UTM zones 46 and 47</li>
                <li>Format: 2 letters + 6 digits (e.g., KA123456)</li>
                <li>Grid zones map to specific UTM areas in Myanmar</li>
              </ul>
            </div>
            <div className="info-item">
              <h4>MGRS (Military Grid Reference System)</h4>
              <ul>
                <li>15-character precise coordinate system</li>
                <li>Based on UTM but with additional grid squares</li>
                <li>Format: Zone + Band + Grid + Coordinates</li>
                <li>Used primarily for military and surveying applications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinateConverter;
