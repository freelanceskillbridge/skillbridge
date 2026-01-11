/**
 * File utility functions for handling downloads and file operations
 */

/**
 * Force download any file from URL
 */
export const forceDownload = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    // Don't revoke URL if it's a Cloudinary URL
    if (url.startsWith('blob:')) {
      window.URL.revokeObjectURL(url);
    }
  }, 100);
};

/**
 * Check if URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com');
};

/**
 * Get file extension from URL or filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Get appropriate icon for file type
 */
export const getFileIcon = (filename: string): string => {
  const ext = getFileExtension(filename);
  
  switch (ext) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'zip':
    case 'rar':
      return '📦';
    default:
      return '📎';
  }
};