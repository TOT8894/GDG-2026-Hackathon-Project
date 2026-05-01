import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            const newPos = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);
        },
    });

    return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ onLocationSelect, initialLocation, address }) {
    const [position, setPosition] = useState(initialLocation || [9.03, 38.74]); // Addis Ababa default

    useEffect(() => {
        if (onLocationSelect) {
            onLocationSelect({
                latitude: position[0],
                longitude: position[1],
            });
        }
    }, [position, onLocationSelect]);

    return (
        <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Click on the map to select location
            </div>
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                className="z-0"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
            {address && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Address:</strong> {address}
                </div>
            )}
            <div className="text-xs text-gray-500">
                Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
        </div>
    );
}
