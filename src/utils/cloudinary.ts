import { Cloudinary } from '@cloudinary/url-gen';

// Cloudinary configuration
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !uploadPreset) {
  console.error('Cloudinary environment variables are not set');
}

// Initialize Cloudinary
export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName
  }
});

/**
 * Upload file to Cloudinary
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // Remove cloud_name from FormData - it goes in the URL
    // formData.append('cloud_name', cloudName); // This line is incorrect

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.secure_url) {
          resolve(data.secure_url); // Return just the URL string
        } else {
          reject(new Error(data.error?.message || 'Upload failed'));
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  // Cloudinary URL pattern: https://res.cloudinary.com/cloudname/image/upload/v1234567/public_id.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
};

/**
 * Generate optimized delivery URL
 */
export const getOptimizedUrl = (url: string, width?: number, height?: number): string => {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return url;

  let transformation = '';
  if (width) transformation += `w_${width},`;
  if (height) transformation += `h_${height},`;
  if (transformation) transformation += 'c_fill,q_auto,f_auto';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Helper to get public ID (if needed separately)
 */
export const getPublicIdFromUrl = (url: string): string => {
  return extractPublicIdFromUrl(url) || '';
};