import React, { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    LayersControl,
    LayerGroup,
    Circle,
    FeatureGroup,
    Rectangle,
    useMap,
} from "react-leaflet";

// Ensure you import Leaflet CSS in your main CSS file or in index.js
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FullscreenControl from "./FullScreenControl";

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

const LeafletMapComponent: React.FC<MapProps> = ({ center, zoom, markers, coordinateInfo }) => {
    // Custom icon for markers
    const icon = new L.Icon({
        iconUrl: require("leaflet/dist/images/marker-icon.png"), // Using default Leaflet icon
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    // const center = [51.505, -0.09]
    const ChangeView: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
        const map = useMap(); // Get the current map instance

        // This useEffect runs every time the 'center' prop changes
        useEffect(() => {
            // use setView to update the map's center and potentially the zoom
            map.setView(center, map.getZoom());
        }, [center, map]); // Dependencies: center (from props) and map (the instance)

        // This component renders nothing, it only handles side effects (map movement)
        return null;
    };
    let rangeRadius = 500; // Default 500 meters
    const myanmarBounds = L.latLngBounds(
        [9.4333, 92.1719], // SW
        [28.5478, 101.1709] // NE
    );

    const baseMapLayers = {
        Google: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        "Google Hybrid": "https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
        "Google Satellite": "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        "Google Terrain": "https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
        "Google Traffic": "https://{s}.google.com/vt/lyrs=m@221097413,traffic&x={x}&y={y}&z={z}",
        OpenStreetMap: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "OpenStreetMap Satellite": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        "OpenStreetMap Satellite2": "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
        "OpenStreetMap.HOT": "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        CartoCDN: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    };

    return (
        <MapContainer center={center} zoom={zoom} style={{ height: "500px", width: "100%" }}>
            {/* <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            /> */}
            <ChangeView center={center} />{" "}
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Google">
                    <TileLayer
                        url={baseMapLayers.Google}
                        maxZoom={30}
                        minZoom={2}
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="© Google Street Map"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Google Hybrid">
                    <TileLayer
                        url={baseMapLayers["Google Hybrid"]}
                        maxZoom={30}
                        minZoom={2}
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="© Google Hybrid Map"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Google Satellite">
                    <TileLayer
                        url={baseMapLayers["Google Satellite"]}
                        maxZoom={30}
                        minZoom={2}
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="© Google Satellite Map"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="Google Terrain">
                    <TileLayer
                        url={baseMapLayers["Google Terrain"]}
                        maxZoom={30}
                        minZoom={2}
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="© Google Terrain Map"
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Google Traffic">
                    <TileLayer
                        url={baseMapLayers["Google Traffic"]}
                        maxZoom={30}
                        minZoom={2}
                        subdomains={["mt0", "mt1", "mt2", "mt3"]}
                        attribution="© Google Traffic Map"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="OpenStreetMap">
                    <TileLayer
                        url={baseMapLayers.OpenStreetMap}
                        maxZoom={30}
                        minZoom={2}
                        attribution="© OpenStreetMap"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="OpenStreetMap.HOT">
                    <TileLayer
                        url={baseMapLayers["OpenStreetMap.HOT"]}
                        maxZoom={30}
                        minZoom={2}
                        attribution="© OpenStreetMap"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="OpenStreetMap Satellite">
                    <TileLayer
                        url={baseMapLayers["OpenStreetMap Satellite"]}
                        maxZoom={30}
                        minZoom={2}
                        attribution="© OpenStreetMap"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="OpenStreetMap Satellite2">
                    <TileLayer
                        url={baseMapLayers["OpenStreetMap Satellite2"]}
                        maxZoom={30}
                        minZoom={2}
                        attribution="© OpenStreetMap"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="CartoCDN">
                    <TileLayer
                        url={baseMapLayers["CartoCDN"]}
                        maxZoom={30}
                        minZoom={2}
                        subdomains="abcd"
                        attribution=' © <a href="https://carto.com/attributions">CARTO</a>'
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            <LayersControl position="bottomright">
                {/* <LayersControl.Overlay name="Marker with popup">
                    <Marker position={center}>
                        <Popup>
                            A pretty CSS3 popup. <br /> Easily customizable.
                        </Popup>
                    </Marker>
                </LayersControl.Overlay> */}
                <LayersControl.Overlay name="Layer group with circles">
                    <LayerGroup>
                        <Circle
                            center={center}
                            pathOptions={{ fillColor: "blue" }}
                            radius={rangeRadius}
                        />
                        <Circle
                            center={center}
                            pathOptions={{ fillColor: "red" }}
                            radius={100}
                            stroke={false}
                        />
                        <LayerGroup>
                            <Circle
                                center={center}
                                pathOptions={{ color: "green", fillColor: "green" }}
                                radius={50}
                            />
                        </LayerGroup>
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Myanmar Bounded">
                    <FeatureGroup pathOptions={{ color: "purple" }}>
                        <Popup>မြန်မာပိုင်နက်အတွင်းရောက်နေပါသည်</Popup>
                        <Circle center={center} radius={200} />
                        <Rectangle bounds={myanmarBounds} fillOpacity={0} weight={2} />
                    </FeatureGroup>
                </LayersControl.Overlay>
            </LayersControl>
            {markers.map((position, index) => (
                <Marker key={index} position={position} icon={icon}>
                    <Popup>
                        <div style={{ padding: "8px", fontFamily: "Arial, sans-serif" }}>
                            <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>
                                Coordinate Information
                            </h3>
                            <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                                <strong>Lat/Lon:</strong> {position.lat.toFixed(6)},{" "}
                                {position.lng.toFixed(6)}
                                <br />
                                {coordinateInfo?.utm && (
                                    <>
                                        <strong>UTM:</strong> {coordinateInfo.utm}
                                        <br />
                                    </>
                                )}
                                {coordinateInfo?.mmUtm && (
                                    <>
                                        <strong>MM_UTM:</strong> {coordinateInfo.mmUtm}
                                        <br />
                                    </>
                                )}
                                {coordinateInfo?.mgrs && (
                                    <>
                                        <strong>MGRS:</strong> {coordinateInfo.mgrs}
                                    </>
                                )}
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
            <FullscreenControl />
        </MapContainer>
    );
};

const LeafletMap: React.FC<MapProps> = (props) => {
    return <LeafletMapComponent {...props} />;
};

export default LeafletMap;
