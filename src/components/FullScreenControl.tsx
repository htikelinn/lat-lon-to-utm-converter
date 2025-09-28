import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.fullscreen/Control.FullScreen.css";
import "leaflet.fullscreen";

// L.Control.Fullscreen.prototype.options.fullscreenControl = false;
function FullscreenControl() {
    const map = useMap();

    useEffect(() => {
        L.control
            .fullscreen({
                position: "topleft",
                title: "Toggle Fullscreen",
                titleCancel: "Exit Fullscreen",
                forceSeparateButton: true,
                forcePseudoFullscreen: false,
                fullscreenElement: false,
                // 👇 this is the key
                fullscreenControl: false,
            })
            .addTo(map);
    }, [map]);

    return null;
}

export default FullscreenControl;
