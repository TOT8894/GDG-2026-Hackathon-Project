import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MarketplaceMap({ listings, center = [9.03, 38.74], zoom = 12 }) {
    const navigate = useNavigate();

    if (!listings || listings.length === 0) {
        return (
            <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No listings to display on map</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '600px', width: '100%', borderRadius: '8px' }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {listings.map((listing) => {
                if (!listing.location?.latitude || !listing.location?.longitude) return null;

                return (
                    <Marker
                        key={listing._id}
                        position={[listing.location.latitude, listing.location.longitude]}
                    >
                        <Popup>
                            <div className="w-48 cursor-pointer" onClick={() => navigate(`/listing/${listing._id}`)}>
                                {listing.images && listing.images[0] && (
                                    <img
                                        src={listing.images[0]}
                                        alt={listing.title}
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                )}
                                <h3 className="font-bold text-sm mb-1">{listing.title}</h3>
                                <p className="text-green-600 font-semibold">
                                    {listing.price} {listing.currency || 'ETB'}
                                </p>
                                {listing.location?.address && (
                                    <p className="text-xs text-gray-600 mt-1">{listing.location.address}</p>
                                )}
                                <button className="text-blue-600 text-sm mt-2 hover:underline">
                                    View Details →
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
