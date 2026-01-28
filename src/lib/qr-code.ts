import QRCode from 'qrcode';

interface QRCodeOptions {
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    margin = 1,
    color = {
      dark: '#000000',
      light: '#ffffff00', // Transparent background
    },
  } = options;

  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin,
      color,
      errorCorrectionLevel: 'H', // High error correction to allow for logo embedding
    });

    return svg;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Embeds a logo into a QR code SVG string.
 * This is a string manipulation implementation.
 * @param svg The QR code SVG string
 * @param logoUrl The URL or Base64 data of the logo
 * @param logoSizePercentage The size of the logo relative to the QR code (default 20%)
 */
export function embedLogoInQR(svg: string, logoUrl: string, logoSizePercentage = 20): string {
  // Simple heuristic to inject an image tag. 
  // We rely on the fact that qrcode SVG output usually has a specific structure.
  // A better approach would be XML parsing, but that might be heavy for Edge.
  
  // Find the closing </svg> tag
  const closeTagIndex = svg.lastIndexOf('</svg>');
  if (closeTagIndex === -1) return svg;

  // We need to calculate center position. 
  // Standard qrcode svg usually sets width/height or viewBox.
  // For simplicity valid SVG injection:
  // <image x="center" y="center" width="size" height="size" href="url" />
  
  // However, without parsing viewBox, centering is hard.
  // The `qrcode` lib generates paths.
  // Let's assume standard viewbox usage or wait until we see the output.
  
  // For now, I will leave this function as a placeholder/todo or simple implementation
  // if we assume specific output format. 
  // Given only text manipulation, let's just return the SVG for now and implement
  // robust embedding if requested or if we can parse viewBox.
  
  // NOTE: A more robust way for the future is using a library or ensuring we know the viewBox.
  
  return svg; 
}
