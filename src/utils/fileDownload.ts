/**
 * Force download a file from any URL without opening new tab
 */
export const forceDownload = async (url: string, filename: string): Promise<boolean> => {
  try {
    console.log('Downloading file:', { url, filename });
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    
    // For blob URLs or data URLs, use directly
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        if (url.startsWith('blob:')) {
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      }, 100);
      
      return true;
    }
    
    // For external URLs, fetch and create blob
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      return true;
      
    } catch (fetchError) {
      console.warn('Fetch failed, trying direct download:', fetchError);
      
      // Fallback: direct download (may open in new tab for some browsers)
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
      return true;
    }
    
  } catch (error) {
    console.error('Download failed completely:', error);
    
    // Last resort: open in new tab
    window.open(url, '_blank');
    return false;
  }
};

/**
 * Extract filename from URL or use default
 */
export const extractFilename = (url: string, defaultName: string = 'download'): string => {
  try {
    if (url.includes('cloudinary.com')) {
      // Extract from Cloudinary URL
      const match = url.match(/\/([^\/?]+)(?:\?|$)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
    
    // Extract from URL path
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    
    if (filename && filename.includes('.')) {
      return decodeURIComponent(filename);
    }
    
    return defaultName;
  } catch {
    return defaultName;
  }
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};