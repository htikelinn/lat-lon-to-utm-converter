import React, { useState, useEffect } from "react";
// Assuming you've updated the ConversionResult interface in types/coordinates
import { ConversionResult } from "../types/coordinates";
import { convertCoordinates, formatUTMCoordinates } from "../utils/coordinateConverter"; // formatUTMCoordinates removed
import Map from "./Map";
import "./CoordinateConverter.css";

// Helper function to format MM_UTM to 12-character format (2 letters + 5 Easting + 5 Northing)
const formatMMUTM12Char = (mmUtm: ConversionResult["mmUtm"]) => {
    if (!mmUtm) return "";
    // Pads easting and northing (which are strings from the conversion result) to 5 digits with leading zeros
    const easting = String(mmUtm.easting).padStart(5, "0");
    const northing = String(mmUtm.northing).padStart(5, "0");
    return `${mmUtm.gridZone}${easting}${northing}`;
};

const CoordinateConverter: React.FC = () => {
    const [coordinate, setCoordinate] = useState<string>("");
    const [result, setResult] = useState<ConversionResult | null>(null);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

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
        setCoordinate("");
        setResult(null);
    };

    const loadLatLonExample = () => {
        setCoordinate("16.8794118, 96.1420957");
    };

    const loadMMUTMExample = () => {
        // Example for 12-character format (2 letters + 5 easting + 5 northing)
        setCoordinate("JU9549568421");
    };

    const loadMGRSExample = () => {
        setCoordinate("47QJU9549568421");
    };

    // Helper function to extract lat/lon from conversion result
    const getLatLonFromResult = (): { lat: number; lng: number } | null => {
        if (result?.isValid && result.latLon) {
            return { lat: result.latLon.latitude, lng: result.latLon.longitude };
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

    // Prepare Lat/Lon result for display
    const latLonResult = result?.latLon
        ? `${result.latLon.latitude.toFixed(7)}, ${result.latLon.longitude.toFixed(7)}`
        : null;

    return (
        <div className="coordinate-converter">
            <div className="converter-card">
                <h1>
                    LAT/LON &lt;--&gt; UTM Converter
                </h1>

                <p className="description">
                    Enter coordinates in any supported format: Lat/Lon, MM_UTM (Myanmar). The system
                    will automatically detect and convert between all formats.
                </p>

                <div className="input-section">
                    <div className="input-group">
                        <label htmlFor="coordinate">Enter Coordinate:</label>
                        <input
                            id="coordinate"
                            type="text"
                            value={coordinate}
                            onChange={handleCoordinateChange}
                            // Updated placeholder
                            placeholder="e.g., 16.123456, 96.123456 or JU1234567890" // or 46QGJ1234567890"
                            className="coordinate-input"
                        />
                        <small>
                            Supports: Lat/Lon (comma separated), MM_UTM (၁၀ လုံးမြေပုံညွှန်း)
                        </small>
                    </div>

                    <div className="button-group">
                        <button onClick={loadLatLonExample} className="example-btn">
                            LatLon Example
                        </button>
                        <button onClick={loadMMUTMExample} className="example-btn">
                            MM_UTM Example
                        </button>
                        {/* <button onClick={loadMGRSExample} className="example-btn">
                             MGRS Example
                        </button> */}
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
                                    {/* Lattitude and Longitude Section - ONLY SHOW */}
                                    {result.latLon && (
                                        <div className="format-section">
                                            <h3>Lat/Lon</h3>
                                            <div className="result-grid">
                                                <div className="result-item">
                                                    <span className="label">Latitude:</span>
                                                    <span className="value">
                                                        {result.latLon.latitude.toFixed(7)}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">Longitude:</span>
                                                    <span className="value">
                                                        {result.latLon.longitude.toFixed(7)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="formatted-result">
                                                <strong>{latLonResult}</strong>
                                            </div>
                                        </div>
                                    )}

                                    {/* MM_UTM Section - ONLY SHOW */}
                                    {result.mmUtm && (
                                        <div className="format-section">
                                            <h3>MM_UTM</h3>
                                            <div className="result-grid">
                                                <div className="result-item">
                                                    <span className="label">Grid Zone:</span>
                                                    <span className="value">
                                                        {result.mmUtm.gridZone}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">
                                                        Easting (5 Digits):
                                                    </span>
                                                    <span className="value">
                                                        {String(result.mmUtm.easting).padStart(
                                                            5,
                                                            "0"
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">
                                                        Northing (5 Digits):
                                                    </span>
                                                    <span className="value">
                                                        {String(result.mmUtm.northing).padStart(
                                                            5,
                                                            "0"
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="formatted-result">
                                                <strong>{formatMMUTM12Char(result.mmUtm)}</strong>
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
                        <Map
                            center={mapCenter}
                            zoom={15}
                            markers={[mapCenter]}
                            coordinateInfo={{
                                utm: result.utm ? formatUTMCoordinates(result.utm) : undefined,
                                mmUtm: result.mmUtm ? formatMMUTM12Char(result.mmUtm) : undefined, // Use 12-char format for map info
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
                            <h4>Lat/Lon (WGS84)</h4>
                            <ul>
                                <li>The standard global coordinate system.</li>
                                <li>Latitude is North/South position (up to 90°).</li>
                                <li>Longitude is East/West position (up to 180°).</li>
                                <li>Format is generally Decimal Degrees (DD).</li>
                            </ul>
                        </div>
                        <div className="info-item">
                            <h4>MM_UTM (Myanmar UTM)</h4>
                            <ul>
                                <li>**12-character format** specific to Myanmar region.</li>
                                <li>Works with UTM zones 46 and 47.</li>
                                <li>
                                    Format: 2 letters (Grid Zone) + 5 digits (Easting) + 5 digits
                                    (Northing).
                                </li>
                                <li>Grid zones map to specific UTM areas in Myanmar.</li>
                            </ul>
                        </div>
                        {/* <div className="info-item">
                            <h4>MGRS (Military Grid Reference System)</h4>
                            <ul>
                                <li>Used primarily for military and surveying applications.</li>
                                <li>Format: Zone + Band + Grid + Coordinates (up to 15 characters).</li>
                                <li>Included for complete conversion, but not shown in main results.</li>
                            </ul>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoordinateConverter;
