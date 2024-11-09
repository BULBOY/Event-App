import React, { useEffect, useRef } from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
    // Create a ref for the map container div
    const mapRef = useRef(null);

    useEffect(() => {
        const map = L.map(mapRef.current).setView([51.505, -0.09], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        
        const marker = L.marker([51.5, -0.09]).addTo(map);
        marker.bindPopup('Welcome to <br> SOLENT <br> events').openPopup();

        // Cleanup function to remove the map on component unmount
        return () => {
            map.remove();
        };
    }, []);

    return (
        <div ref={mapRef} style={{ border: "1px solid black", height: "500px", width: "80%"}}></div>
    );
};

export default MapComponent;
