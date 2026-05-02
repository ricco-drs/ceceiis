/**
 * Converts a Google Drive sharing URL to a direct image URL.
 * 
 * Supports formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * 
 * Returns the original URL if it's not a Drive link.
 */
export function driveImageUrl(url: string): string {
  if (!url) return "";

  // Already a direct thumbnail URL
  if (url.includes("drive.google.com/thumbnail")) return url;

  // Extract file ID from various Drive URL formats
  let fileId = "";

  // Format: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }

  // Format: ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      fileId = idMatch[1];
    }
  }

  if (fileId) {
    // Use thumbnail endpoint - most reliable for displaying images
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  }

  // Not a Drive link, return as-is
  return url;
}
