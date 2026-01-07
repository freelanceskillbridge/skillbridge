/**
 * Helper functions for Google Drive operations
 */

// Google Drive API configuration
const GOOGLE_DRIVE_FOLDER_ID = '1ZupjjMFTZ048AlnOmsqZHjzP0Hs-7JEk';

/**
 * Extracts file ID from Google Drive URL
 */
export const extractFileIdFromUrl = (url: string): string | null => {
  const patterns = [
    /\/d\/([^\/]+)/, // https://drive.google.com/file/d/FILE_ID/view
    /id=([^&]+)/,    // https://drive.google.com/open?id=FILE_ID
    /\/folders\/([^\/]+)/, // Folder URL
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Creates a direct download link from Google Drive URL
 */
export const createDirectDownloadLink = (googleDriveUrl: string): string => {
  const fileId = extractFileIdFromUrl(googleDriveUrl);
  if (!fileId) return googleDriveUrl;
  
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Downloads a file from Google Drive URL
 */
export const downloadFileFromDrive = (url: string, fileName?: string): boolean => {
  try {
    const downloadUrl = createDirectDownloadLink(url);
    
    // Create a temporary iframe for silent download
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);
    
    // Also create a direct link as fallback
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (fileName) {
      link.download = fileName;
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Remove iframe after some time
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('Download error:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
    return false;
  }
};