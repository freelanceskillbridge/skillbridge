import { Cloudinary } from '@cloudinary/url-gen';

// Cloudinary configuration
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !uploadPreset) {
  console.error('Cloudinary environment variables are not set');
  console.log('Current env:', {
    cloudName,
    uploadPreset,
    hasCloudName: !!cloudName,
    hasUploadPreset: !!uploadPreset
  });
}

// Initialize Cloudinary
export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudName || 'demo'
  }
});

/**
 * Upload file to Cloudinary with better error handling
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if environment variables are set
    if (!cloudName || cloudName === 'undefined' || !uploadPreset) {
      const error = new Error('Cloudinary not configured. Please check your environment variables.');
      console.error('Cloudinary configuration error:', {
        cloudName,
        uploadPreset,
        file: file.name,
        size: file.size
      });
      reject(error);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    console.log('Uploading to Cloudinary:', {
      cloudName,
      uploadPreset,
      file: file.name,
      size: formatFileSize(file.size),
      type: file.type
    });

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.error('Cloudinary API error response:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        if (data.secure_url) {
          console.log('Upload successful:', {
            url: data.secure_url.substring(0, 100) + '...',
            size: data.bytes,
            format: data.format,
            publicId: data.public_id
          });
          resolve(data.secure_url);
        } else {
          console.error('Upload failed, no secure_url:', data);
          reject(new Error(data.error?.message || 'Upload failed - no URL returned'));
        }
      })
      .catch(error => {
        console.error('Upload network error:', error);
        reject(new Error(`Network error: ${error.message}`));
      });
  });
};

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  // Cloudinary URL patterns:
  // 1. https://res.cloudinary.com/cloudname/image/upload/v1234567/public_id.jpg
  // 2. https://res.cloudinary.com/cloudname/image/upload/public_id.jpg
  const match = url.match(/\/upload(?:\/[^\/]+)?\/([^.]+)/);
  return match ? match[1] : null;
};

/**
 * Generate optimized delivery URL
 */
export const getOptimizedUrl = (url: string, width?: number, height?: number): string => {
  if (!url || !cloudName) return url;
  
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return url;

  let transformation = '';
  if (width) transformation += `w_${width},`;
  if (height) transformation += `h_${height},`;
  if (transformation) transformation += 'c_fill,q_auto,f_auto';

  return transformation 
    ? `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`
    : url;
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

/**
 * Check if Cloudinary is properly configured
 */
export const checkCloudinaryConfig = (): boolean => {
  const isValid = !!(cloudName && cloudName !== 'undefined' && uploadPreset);
  if (!isValid) {
    console.warn('Cloudinary configuration check failed:', {
      cloudName,
      uploadPreset,
      isValid
    });
  }
  return isValid;
};