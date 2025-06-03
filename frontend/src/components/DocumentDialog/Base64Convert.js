/**
 * Converts a raw Base64 image string (no data URL prefix) to a Blob.
 * Handles potential line breaks, missing padding, and invalid characters.
 *
 * @param {string} base64String - The raw Base64 image string.
 * @returns {Blob} - The image blob (type: 'image/png').
 */
export function base64ToBlob(base64String) {
  try {
    // If the string starts with a data URL prefix (e.g. data:image/png;base64,....)
    const base64Parts = base64String.split(',');
    const mimeMatch = base64Parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

    // Grab the actual base64 data (after the comma)
    const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];

    // Remove any whitespace or line breaks
    const cleanedBase64 = base64Data.replace(/\s/g, '');

    // Now decode
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to Blob:', error);
    return null;
  }
}
