import { MapPin, Eye, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TrustScore from './TrustScore';

export default function ListingCard({ listing }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/listing/${listing._id}`)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {listing.images && listing.images[0] ? (
                    <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
                {listing.isBoosted && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Boosted
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white line-clamp-1">
                    {listing.title}
                </h3>

                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {listing.price} {listing.currency || 'ETB'}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {listing.description}
                </p>

                {/* Location */}
                {listing.location?.address && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{listing.location.address}</span>
                    </div>
                )}

                {/* Seller Info */}
                {listing.sellerId && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                        {listing.sellerId.avatar ? (
                            <img
                                src={listing.sellerId.avatar}
                                alt={listing.sellerId.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold">
                                {listing.sellerId.fullName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {listing.sellerId.fullName}
                            </p>
                            <TrustScore score={listing.sellerId.trustScore || 0} size="sm" showNumber={false} />
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {listing.likes || 0}
                        </span>
                    </div>
                    <span className="text-xs">
                        {listing.category}
                    </span>
                </div>
            </div>
        </div>
    );
}
