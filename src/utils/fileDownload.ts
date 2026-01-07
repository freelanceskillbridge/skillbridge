/**
 * Downloads a file from a Google Drive URL
 * @param url Google Drive shareable URL
 * @param fileName Optional custom file name
 */
export const downloadFileFromDrive = async (url: string, fileName?: string) => {
  try {
    // Extract file ID from Google Drive URL
    const match = url.match(/\/d\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid Google Drive URL');
    }
    
    const fileId = match[1];
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    // Create temporary anchor element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Set download attribute
    if (fileName) {
      link.download = fileName;
    } else {
      // Try to extract file name from URL
      link.download = url.split('/').pop() || 'download';
    }
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    window.open(url, '_blank');
    return false;
  }
};

/**
 * Formats file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};