import React, { useState, useEffect } from "react";
import { ConversionResult, LatLonCoordinates } from "../types/coordinates";
import {
    convertCoordinates,
    convertDDToDMS,
    formatUTMCoordinates,
} from "../utils/coordinateConverter";
import Map from "./Map";
import "./CoordinateConverter.css";

// Enhanced MM_UTM formatting helper
const formatMMUTM = (mmUtm: {
    gridZone: string;
    easting: string;
    northing: string;
    formatted?: string;
}) => {
    if (!mmUtm) return { full: "", short: "" };

    // Return original if exists
    if (mmUtm.formatted) {
        const isShort = mmUtm.formatted.length === 8;
        return {
            full: isShort ? `${mmUtm.gridZone}${mmUtm.easting}${mmUtm.northing}` : mmUtm.formatted,
            short: isShort
                ? mmUtm.formatted
                : `${mmUtm.gridZone}${mmUtm.easting.substring(0, 3)}${mmUtm.northing.substring(
                      0,
                      3
                  )}`,
        };
    }

    // Auto-detect precision
    const isFullPrecision = mmUtm.easting.length === 5 && mmUtm.northing.length === 5;

    return {
        full: isFullPrecision
            ? `${mmUtm.gridZone}${mmUtm.easting}${mmUtm.northing}`
            : `${mmUtm.gridZone}${mmUtm.easting.padStart(5, "0")}${mmUtm.northing.padStart(
                  5,
                  "0"
              )}`,
        short: `${mmUtm.gridZone}${mmUtm.easting.substring(0, 3)}${mmUtm.northing.substring(0, 3)}`,
    };
};

const CoordinateConverter: React.FC = () => {
    const [coordinate, setCoordinate] = useState<string>("");
    const [result, setResult] = useState<ConversionResult | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LatLonCoordinates | null>(null);
    const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);

    useEffect(() => {
        if (conversionResult && conversionResult.isValid && conversionResult.latLon) {
            setSelectedLocation(conversionResult.latLon);
        } else {
            setSelectedLocation(null);
        }
    }, [conversionResult]);

    // Convert coordinates whenever input changes
    useEffect(() => {
        if (coordinate.trim()) {
            const result = convertCoordinates(coordinate.trim());
            setResult(result);
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
        setConversionResult(null);
        setSelectedLocation(null);
    };

    const loadLatLonExample = () => {
        setCoordinate("20.7779105,95.2207137");
    };

    const loadMMUTMExample = () => {
        setCoordinate("HT003999");
    };

    const loadMGRSExample = () => {
        setCoordinate("46QGJ9992500245");
    };

    // const handleConversion = () => {
    //     if (!coordinate.trim()) {
    //         setConversionResult(null);
    //         setSelectedLocation(null);
    //         return;
    //     }

    //     const result = convertCoordinates(coordinate);
    //     setConversionResult(result);
    // };

    const handleShowOnMap = () => {
        if (result?.isValid && result.latLon) {
            setSelectedLocation(result.latLon);
        }
    };

    // Prepare Lat/Lon result for display
    // const getLatLonFromResult = (): { lat: number; lng: number } | null => {
    //     if (!result?.isValid) return null;

    //     // If input is already lat/lon, extract from the original input
    //     if (result.inputFormat === "LATLON") {
    //         const coords = coordinate.split(/[,\t]/).map((s) => parseFloat(s.trim()));
    //         if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    //             return { lat: coords[0], lng: coords[1] };
    //         }
    //     }

    //     // For other formats, we need to convert back from MGRS
    //     if (result.mgrs) {
    //         try {
    //             const mgrs = require("mgrs");
    //             const latLonBounds = mgrs.inverse(result.mgrs.formatted);
    //             // Take the center of the bounding box
    //             const lat = (latLonBounds[1] + latLonBounds[3]) / 2;
    //             const lng = (latLonBounds[0] + latLonBounds[2]) / 2;
    //             return { lat, lng };
    //         } catch (error) {
    //             console.error("Error converting to lat/lon:", error);
    //             return null;
    //         }
    //     }

    //     return null;
    // };

    const latLonResult = result?.latLon
        ? `${result.latLon.latitude.toFixed(8)}, ${result.latLon.longitude.toFixed(8)}`
        : null;

    return (
        <div className="coordinate-converter">
            <div className="converter-card">
                <h1>LAT/LON &lt;--&gt; UTM Converter</h1>

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
                            placeholder="e.g., 16.123456, 96.123456 or JU1234567890 or JU123456"
                            className="coordinate-input"
                        />
                        <small>
                            Supports: Lat/Lon (comma separated), MM_UTM (၆ လုံးမြေပုံညွှန်း)
                        </small>
                        {/* (၁၀ လုံးမြေပုံညွှန်း) နှင့် */}
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

                <div className="map-container">
                    {selectedLocation && result && (
                        <>
                            <Map
                                center={{
                                    lat: selectedLocation.latitude,
                                    lng: selectedLocation.longitude,
                                }}
                                zoom={12}
                                markers={[
                                    {
                                        lat: selectedLocation.latitude,
                                        lng: selectedLocation.longitude,
                                    },
                                ]}
                                coordinateInfo={{
                                    utm: result.utm ? formatUTMCoordinates(result.utm) : undefined,
                                    mmUtm: result.mmUtm
                                        ? formatMMUTM(result.mmUtm).full
                                        : undefined,
                                    mgrs: result.mgrs?.formatted,
                                }}
                            />
                            <div className="map-info">
                                <p>
                                    <strong>Legend:</strong>
                                </p>
                                <ul>
                                    <li>
                                        <span style={{ color: "blue" }}>●</span> Blue Circle:
                                        Dynamic range radius (500 m)
                                    </li>
                                    <li>
                                        <span style={{ color: "red" }}>●</span> Red Circle: Fixed
                                        radius (100 m)
                                    </li>
                                    <li>
                                        <span style={{ color: "green" }}>●</span> Green Circle:
                                        Smaller range (50 m)
                                    </li>
                                </ul>
                                <p>Click on the marker to see detailed coordinate information.</p>
                            </div>
                        </>
                    )}
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
                                                        {result.latLon.latitude.toFixed(8)}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">Longitude:</span>
                                                    <span className="value">
                                                        {result.latLon.longitude.toFixed(8)}
                                                    </span>
                                                </div>
                                            </div>

                                                    <span className="format-label">
                                                        Decimal Degrees (DD):
                                                    </span>
                                            <div className="formatted-result">
                                                <strong>{latLonResult}</strong>
                                            </div>

                                            <div className="format-variants">
                                                {/* <div className="format-item">
                                                    <span className="format-label">
                                                        Decimal Degrees (DD):
                                                    </span>
                                                    <span className="format-value">
                                                        {result.latLon.latitude.toFixed(8)},{" "}
                                                        {result.latLon.longitude.toFixed(8)}
                                                    </span>
                                                </div> */}

                                                <div className="format-item">
                                                    <span className="format-label">
                                                        DMS Format:
                                                    </span>
                                                    <span className="format-value">
                                                        {convertDDToDMS(
                                                            result.latLon.latitude,
                                                            true
                                                        )}{" "}
                                                        (Lat),{" "}
                                                        {convertDDToDMS(
                                                            result.latLon.longitude,
                                                            false
                                                        )}{" "}
                                                        (Lon)
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => {
                                                        const { latitude, longitude } =
                                                            result.latLon!;
                                                        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                                                        window.open(url, "_blank");
                                                    }}
                                                >
                                                    📍 Open in Google Maps
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* MM_UTM Section - UPDATED */}
                                    {result.mmUtm && (
                                        <div className="format-section">
                                            <h3> Myanmar UTM</h3>

                                            <div className="result-grid">
                                                <div className="result-item">
                                                    <span className="label">Grid Zone:</span>
                                                    <span className="value">
                                                        {result.mmUtm.gridZone}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">Easting:</span>
                                                    <span className="value">
                                                        {result.mmUtm.easting}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">Northing:</span>
                                                    <span className="value">
                                                        {result.mmUtm.northing}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="formatted-result">
                                                {/* Use the new formatMMUTM helper */}
                                                {(() => {
                                                    const formatted = formatMMUTM(result.mmUtm);
                                                    return (
                                                            <div className="formatted-result">
                                                                <strong>
                                                                    ၆ လုံးမြေပုံညွှန်း:{" "}
                                                                    {formatted.short}
                                                                </strong>
                                                            </div>
                                                            // <div className="formatted-result">
                                                            //     <strong>
                                                            //         ၁၀ လုံးမြေပုံညွှန်း:{" "}
                                                            //         {formatted.full}
                                                            //     </strong>
                                                            // </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* MGRS Section - MOVED INSIDE results-grid */}
                                    {result.mgrs && (
                                        <div className="format-section">
                                            <h3>MGRS</h3>
                                            <div className="result-grid">
                                                <div className="result-item">
                                                    <span className="label">Zone:</span>
                                                    <span className="value">
                                                        {result.mgrs.zone}
                                                        {result.mgrs.latitudeBand}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">Grid Square:</span>
                                                    <span className="value">
                                                        {result.mgrs.gridSquare}
                                                    </span>
                                                </div>
                                                <div className="result-item">
                                                    <span className="label">Coordinates:</span>
                                                    <span className="value">
                                                        {result.mgrs.easting} {result.mgrs.northing}
                                                    </span>
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
                                <li>
                                    <strong>၆ လုံးမြေပုံညွှန်း</strong> - 6-digit format (100m
                                    precision)
                                </li>
                                {/* <li>
                                    <strong>၁၀ လုံးမြေပုံညွှန်း</strong> - 10-digit format (1m
                                    precision)
                                </li> */}
                                <li>Works with UTM zones 46 and 47.</li>
                                <li>Format: 2 letters (Grid Zone) + coordinates.</li>
                                <li>Grid zones map to specific UTM areas in Myanmar.</li>
                            </ul>
                        </div>
                        <div className="info-item">
                            <h4>MGRS (Military Grid Reference System)</h4>
                            <ul>
                                <li>Used primarily for military and surveying applications.</li>
                                <li>
                                    Format: Zone + Band + Grid + Coordinates (up to 15 characters).
                                </li>
                                <li>Included for complete conversion capability.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoordinateConverter;
