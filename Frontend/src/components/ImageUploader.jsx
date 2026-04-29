import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({ images = [], onImagesChange, onChange, maxImages = 5 }) {
    const [uploading, setUploading] = useState(false);
    // support both prop names
    const handleChange = onImagesChange || onChange || (() => { });

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > maxImages) {
            alert(`You can only upload up to ${maxImages} images`);
            return;
        }

        setUploading(true);

        try {
            const newImages = [];

            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert(`${file.name} is not an image file`);
                    continue;
                }

                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert(`${file.name} is too large. Maximum size is 5MB`);
                    continue;
                }

                // Convert to base64
                const base64 = await fileToBase64(file);
                newImages.push(base64);
            }

            handleChange([...images, ...newImages]);
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        handleChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={img}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                    Cover
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {images.length < maxImages && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    PNG, JPG, GIF up to 5MB ({images.length}/{maxImages})
                                </p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                </label>
            )}

            {images.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No images uploaded yet</p>
                </div>
            )}
        </div>
    );
}
