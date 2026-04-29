import { Star } from 'lucide-react';

export default function TrustScore({ score = 0, showNumber = true, size = 'md' }) {
    // Convert 0-100 score to 0-5 stars
    const stars = Math.round((score / 100) * 5);

    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`${sizeClasses[size]} ${i < stars
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                            }`}
                    />
                ))}
            </div>
            {showNumber && (
                <span className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400 ml-1`}>
                    ({score})
                </span>
            )}
        </div>
    );
}
