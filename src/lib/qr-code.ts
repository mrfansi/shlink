import QRCode from 'qrcode';

interface QRCodeOptions {
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  logoUrl?: string;
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
    logoUrl,
  } = options;

  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin,
      color,
      errorCorrectionLevel: 'H', // High error correction to allow for logo embedding
    });

    if (logoUrl) {
        return embedLogoInQR(svg, logoUrl);
    }

    return svg;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Embeds a logo into a QR code SVG string.
 */
export function embedLogoInQR(svg: string, logoUrl: string, logoSizePercentage = 20): string {
  // Extract viewBox to calculate center
  const viewBoxMatch = svg.match(/viewBox="([\d\s\.-]+)"/);
  if (!viewBoxMatch) return svg;

  const parts = viewBoxMatch[1].split(/\s+/).map(Number);
  if (parts.length < 4) return svg;

  // viewBox = min-x min-y width height
  const [vx, vy, vw, vh] = parts;
  
  // Calculate Logo dimensions and position
  // We assume square QR
  const logoSize = vw * (logoSizePercentage / 100);
  const x = vx + (vw - logoSize) / 2;
  const y = vy + (vh - logoSize) / 2;

  // Create Image Tag
  // Using both href (modern) and xlink:href (legacy) for compatibility
  // Also we add a white background rect behind the logo for better visibility
  const bgSize = logoSize * 1.1;
  const bgX = vx + (vw - bgSize) / 2;
  const bgY = vy + (vh - bgSize) / 2;

  const bgRect = `<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" fill="white" rx="${bgSize * 0.1}"/>`;
  const imageTag = `<image href="${logoUrl}" xlink:href="${logoUrl}" x="${x}" y="${y}" height="${logoSize}" width="${logoSize}" preserveAspectRatio="xMidYMid slice"/>`;
  
  // Inject before close tag
  return svg.replace('</svg>', `${bgRect}${imageTag}</svg>`);
}
