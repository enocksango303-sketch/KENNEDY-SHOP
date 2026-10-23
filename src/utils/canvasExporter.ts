import { PosterTemplate } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportPosterAsImage(
  poster: PosterTemplate,
  format: 'png' | 'jpeg' = 'png',
  dpiMultiplier: number = 2
): Promise<string> {
  const baseWidth = 1080;
  // Calculate height based on aspect ratio
  let baseHeight = 1350; // default 4:5
  if (poster.aspectRatio === '9:16') {
    baseHeight = 1920;
  } else if (poster.aspectRatio === '1:1') {
    baseHeight = 1080;
  }

  const width = baseWidth * dpiMultiplier;
  const height = baseHeight * dpiMultiplier;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible de créer le contexte 2D Canvas');

  // 1. Draw base gradient or background color
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  if (poster.palette.name.includes('Or')) {
    bgGradient.addColorStop(0, '#1c1917');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#1e1b4b');
  } else if (poster.palette.name.includes('Violet')) {
    bgGradient.addColorStop(0, '#3b0764');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#1e1b4b');
  } else if (poster.palette.name.includes('Émeraude')) {
    bgGradient.addColorStop(0, '#022c22');
    bgGradient.addColorStop(0.5, '#064e3b');
    bgGradient.addColorStop(1, '#020617');
  } else if (poster.palette.name.includes('Rouge')) {
    bgGradient.addColorStop(0, '#4c0519');
    bgGradient.addColorStop(0.5, '#18181b');
    bgGradient.addColorStop(1, '#09090b');
  } else {
    bgGradient.addColorStop(0, '#09090b');
    bgGradient.addColorStop(0.5, '#1e1b4b');
    bgGradient.addColorStop(1, '#020617');
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Hero Background Image if available
  if (poster.thumbnail) {
    try {
      const img = await loadImage(poster.thumbnail);
      ctx.save();
      // Draw image covering canvas top half or full with soft blend
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;
      let drawW = width;
      let drawH = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgAspect > canvasAspect) {
        drawH = height;
        drawW = height * imgAspect;
        offsetX = (width - drawW) / 2;
      } else {
        drawW = width;
        drawH = width / imgAspect;
        offsetY = (height - drawH) / 2;
      }

      ctx.globalAlpha = 0.55;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.warn('Canvas image loading skipped:', e);
    }
  }

  // 3. Dark gradient overlays for readable contrast
  const overlayGrad = ctx.createLinearGradient(0, 0, 0, height);
  overlayGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  overlayGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.3)');
  overlayGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.75)');
  overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
  ctx.fillStyle = overlayGrad;
  ctx.fillRect(0, 0, width, height);

  // 4. Subtle border stroke
  ctx.strokeStyle = poster.palette.accentColor;
  ctx.lineWidth = 14 * dpiMultiplier;
  ctx.strokeRect(
    20 * dpiMultiplier,
    20 * dpiMultiplier,
    width - 40 * dpiMultiplier,
    height - 40 * dpiMultiplier
  );

  // Inner thin border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2 * dpiMultiplier;
  ctx.strokeRect(
    32 * dpiMultiplier,
    32 * dpiMultiplier,
    width - 64 * dpiMultiplier,
    height - 64 * dpiMultiplier
  );

  // Helper font selection
  const isSerif = poster.fontFamily === 'serif';
  const fontMain = isSerif ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif';

  // 5. Draw Organizer Top Header
  ctx.textAlign = 'center';
  ctx.fillStyle = poster.palette.accentColor;
  ctx.font = `600 ${18 * dpiMultiplier}px ${fontMain}`;
  ctx.fillText(
    poster.organizer.toUpperCase(),
    width / 2,
    70 * dpiMultiplier
  );

  // 6. Draw Badge (Macaron)
  if (poster.badge) {
    const badgeText = poster.badge.toUpperCase();
    ctx.font = `bold ${16 * dpiMultiplier}px ${fontMain}`;
    const textMetrics = ctx.measureText(badgeText);
    const badgePaddingX = 24 * dpiMultiplier;
    const badgeW = textMetrics.width + badgePaddingX * 2;
    const badgeH = 38 * dpiMultiplier;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 96 * dpiMultiplier;

    // Rounded rectangle
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 19 * dpiMultiplier);
    ctx.fillStyle = poster.palette.badgeBg;
    ctx.fill();

    ctx.fillStyle = poster.palette.badgeText;
    ctx.fillText(badgeText, width / 2, badgeY + 25 * dpiMultiplier);
  }

  // 7. Main Title (Multi-line wrap)
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 20;
  ctx.font = `900 ${48 * dpiMultiplier}px ${fontMain}`;
  const titleY = (poster.aspectRatio === '9:16' ? 320 : 250) * dpiMultiplier;
  wrapText(ctx, poster.title, width / 2, titleY, width - 120 * dpiMultiplier, 56 * dpiMultiplier);
  ctx.shadowBlur = 0; // reset shadow

  // 8. Subtitle
  if (poster.subtitle) {
    ctx.fillStyle = poster.palette.primaryText;
    ctx.font = `500 ${22 * dpiMultiplier}px ${fontMain}`;
    wrapText(ctx, poster.subtitle, width / 2, (poster.aspectRatio === '9:16' ? 440 : 370) * dpiMultiplier, width - 140 * dpiMultiplier, 30 * dpiMultiplier);
  }

  // 9. Central Decorative Divider
  ctx.strokeStyle = poster.palette.accentColor;
  ctx.lineWidth = 4 * dpiMultiplier;
  const divY = (poster.aspectRatio === '9:16' ? 510 : 430) * dpiMultiplier;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80 * dpiMultiplier, divY);
  ctx.lineTo(width / 2 + 80 * dpiMultiplier, divY);
  ctx.stroke();

  // 10. Date, Time & Place Card
  const cardW = width - 100 * dpiMultiplier;
  const cardH = (poster.aspectRatio === '9:16' ? 240 : 190) * dpiMultiplier;
  const cardX = (width - cardW) / 2;
  const cardY = height - (poster.aspectRatio === '9:16' ? 420 : 350) * dpiMultiplier;

  roundRect(ctx, cardX, cardY, cardW, cardH, 20 * dpiMultiplier);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2 * dpiMultiplier;
  ctx.stroke();

  // Date and Time
  ctx.fillStyle = '#facc15';
  ctx.font = `bold ${24 * dpiMultiplier}px ${fontMain}`;
  ctx.fillText(
    `📅 ${poster.date.toUpperCase()}`,
    width / 2,
    cardY + 44 * dpiMultiplier
  );

  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${20 * dpiMultiplier}px ${fontMain}`;
  ctx.fillText(
    `⏰ ${poster.time}`,
    width / 2,
    cardY + 80 * dpiMultiplier
  );

  // Location
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `500 ${18 * dpiMultiplier}px ${fontMain}`;
  wrapText(ctx, `📍 ${poster.location}`, width / 2, cardY + 120 * dpiMultiplier, cardW - 40 * dpiMultiplier, 24 * dpiMultiplier);

  // Price badge inside card
  if (poster.price) {
    ctx.fillStyle = poster.palette.accentColor;
    ctx.font = `bold ${18 * dpiMultiplier}px ${fontMain}`;
    ctx.fillText(`🎟️ ${poster.price}`, width / 2, cardY + cardH - 18 * dpiMultiplier);
  }

  // 11. Bottom Infoline & WhatsApp Contact Bar
  const bottomBarY = height - 90 * dpiMultiplier;
  roundRect(ctx, 40 * dpiMultiplier, bottomBarY, width - 80 * dpiMultiplier, 54 * dpiMultiplier, 12 * dpiMultiplier);
  ctx.fillStyle = '#059669'; // WhatsApp emerald green
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${20 * dpiMultiplier}px ${fontMain}`;
  ctx.fillText(
    `💬 ${poster.contact}`,
    width / 2,
    bottomBarY + 34 * dpiMultiplier
  );

  // 12. Watermark / Brand stamp
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = `12 * dpiMultiplier}px ${fontMain}`;
  ctx.fillText(
    'Créé avec AffichePro.ci',
    width / 2,
    height - 12 * dpiMultiplier
  );

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, 0.95);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, curY);
}

/**
 * Exporte l'affiche au format PDF Haute Résolution (A4 ou A3) prêt pour l'impression professionnelle
 * Utilise jsPDF et html2canvas pour une fidélité d'affichage optimale à 300 DPI.
 */
export async function exportPosterAsPDF(
  poster: PosterTemplate,
  paperFormat: 'a4' | 'a3' = 'a4',
  elementToCapture?: HTMLElement | null
): Promise<void> {
  let imgData: string;

  if (elementToCapture) {
    try {
      const canvas = await html2canvas(elementToCapture, {
        scale: 3, // Ultra-HD 300 DPI
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      imgData = canvas.toDataURL('image/png', 1.0);
    } catch (e) {
      console.warn('Capture html2canvas ignorée, bascule vers le moteur haute résolution Canvas:', e);
      imgData = await exportPosterAsImage(poster, 'png', 3);
    }
  } else {
    // Rendu Canvas haute définition (3x base = 3240x4050 px)
    imgData = await exportPosterAsImage(poster, 'png', 3);
  }

  const isA3 = paperFormat === 'a3';
  const pdfWidth = isA3 ? 297 : 210;
  const pdfHeight = isA3 ? 420 : 297;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperFormat,
    compress: true,
  });

  // Insertion plein format (Full Bleed) pour l'imprimeur
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  // Métadonnées du document PDF en français
  pdf.setProperties({
    title: poster.title,
    subject: `Affiche Haute Résolution - ${poster.categoryLabel}`,
    author: 'AffichePro.ci',
    keywords: 'affiche, impression, PDF, haute résolution, Abidjan, Côte d\'Ivoire',
    creator: 'AffichePro Studio Graphique',
  });

  const cleanTitle = (poster.title || 'Affiche').slice(0, 25).replace(/[^a-zA-Z0-9àéèêç]/g, '_');
  pdf.save(`AffichePro_${cleanTitle}_${paperFormat.toUpperCase()}.pdf`);
}

