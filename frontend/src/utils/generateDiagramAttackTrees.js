/* eslint-disable */
// ----------------------------------------------------------------------
// 1. ICON CONVERSION AND DEFINITIONS
// ----------------------------------------------------------------------

import { AttackIcon, CybersecurityIcon } from '../assets/icons';

const DEFAULT_ATTACK_ICON_SVG_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjg1YzVjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiPjwvY2lyY2xlPjxsaW5lIHgxPSIyMiIgeTE9IjEyIiB4Mj0iMTgiIHkyPSIxMiI+PC9saW5lPjxsaW5lIHgxPSI2IiB5MT0iMTIiIHgyPSIyIiB5Mj0iMTIiPjwvbGluZT48bGluZSB4MT0iMTIiIHkxPSI2IiB4Mj0iMTIiIHkyPSIyIj48L2xpbmU+PGxpbmUgeDE9IjEyIiB5MT0iMjIiIHgyPSIxMiIgeTI9IjE4Ij48L2xpbmU+PC9zdmc+';

const DEFAULT_CYBERSECURITY_ICON_SVG_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDc5MWRiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDIycy4gLThsLTIuNjY3LTguNjY3YzAgMC00LjMzMy0xLjMzMy04LjY2Ny0zLjMzMy0zLjMzMyA0LjE2Ny0uNjY3IDYuMTY3LS42NjYgMjIuMDAweiI+PC9wYXRoPjwvc3ZnPg==';

async function convertPNGtoSVG(pngDataURL, width = 24, height = 24, strokeColor = null) {
  try {
    if (pngDataURL.startsWith('data:image/svg+xml')) return pngDataURL;
    if (!pngDataURL.startsWith('data:')) pngDataURL = `data:image/png;base64,${pngDataURL}`;
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${strokeColor ? `<rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${strokeColor}" stroke-width="2" rx="4"/>` : ''}
  <image href="${pngDataURL}" width="${width - 4}" height="${height - 4}" x="2" y="2" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
  } catch (error) {
    return strokeColor === '#f85c5c' ? DEFAULT_ATTACK_ICON_SVG_BASE64 : DEFAULT_CYBERSECURITY_ICON_SVG_BASE64;
  }
}

function createSVGIcon(type, options = {}) {
  const { width = 24, height = 24, strokeColor = type === 'attack' ? '#f85c5c' : '#4791db', strokeWidth = 2, bgColor = 'none' } = options;
  let svgPath = '';
  if (type === 'attack') {
    svgPath = `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2 - 4}" /><line x1="${width / 2}" y1="4" x2="${width / 2}" y2="${height / 2 - 8}" /><line x1="${width / 2}" y1="${height - 4}" x2="${width / 2}" y2="${height / 2 + 8}" /><line x1="4" y1="${height / 2}" x2="${width / 2 - 8}" y2="${height / 2}" /><line x1="${width - 4}" y1="${height / 2}" x2="${width / 2 + 8}" y2="${height / 2}" />`;
  } else if (type === 'cybersecurity') {
    svgPath = `<path d="M${width * 0.3} ${height * 0.2} Q${width / 2} ${height * 0.1} ${width * 0.7} ${height * 0.2} Q${width * 0.9} ${height * 0.3} ${width * 0.9} ${height * 0.6} Q${width * 0.9} ${height * 0.85} ${width / 2} ${height * 0.95} Q${width * 0.1} ${height * 0.85} ${width * 0.1} ${height * 0.6} Q${width * 0.1} ${height * 0.3} ${width * 0.3} ${height * 0.2} Z" />`;
  }
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${bgColor !== 'none' ? `<rect width="${width}" height="${height}" fill="${bgColor}" rx="4"/>` : ''}
  <g fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${svgPath}</g>
</svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
}

let ATTACK_ICON_HREF = createSVGIcon('attack');
let REQ_ICON_HREF = createSVGIcon('cybersecurity');

(async function initIcons() {
  try {
    if (AttackIcon) ATTACK_ICON_HREF = await convertPNGtoSVG(AttackIcon, 24, 24, '#f85c5c');
    if (CybersecurityIcon) REQ_ICON_HREF = await convertPNGtoSVG(CybersecurityIcon, 24, 24, '#4791db');
  } catch (error) {
    console.warn('Could not load custom icons, using defaults:', error);
  }
})();

export async function updateIconsWithPNG(icons) {
  if (icons.attackIcon) ATTACK_ICON_HREF = await convertPNGtoSVG(icons.attackIcon, 24, 24, '#f85c5c');
  if (icons.cybersecurityIcon) REQ_ICON_HREF = await convertPNGtoSVG(icons.cybersecurityIcon, 24, 24, '#4791db');
}

export function resetIconsToDefault() {
  ATTACK_ICON_HREF = createSVGIcon('attack');
  REQ_ICON_HREF = createSVGIcon('cybersecurity');
}

export const RatingColor = (value) => {
  const mapped = { High: 'red', Medium: 'orange', Low: 'green', 'Very low': 'lightgreen', NA: 'grey' };
  if (value === 'Medium') return 'yellow';
  return mapped[value] || 'transparent';
};

/* =========================================================
   MAIN GENERATOR
   ========================================================= */
export default function generateDiagramAttackTree(nodes, edges, overallRating, attacksList = [], requirementsList = []) {
  if (!nodes || nodes.length === 0) return `<svg xmlns="http://www.w3.org/2000/svg"><text>No nodes to render</text></svg>`;

  const escapeXML = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const handleMap = { a: 'top', b: 'left', c: 'bottom', d: 'right' };
  const resolveHandle = (h) => handleMap[h] || h || 'bottom';
  const parsePx = (val) => (typeof val === 'number' ? val : val ? parseInt(val.replace('px', ''), 10) : 0);
  const getStrokeDashArray = (style) => (style === 'dashed' ? '5,5' : style === 'dotted' ? '2,2' : 'none');

  const getAbsolutePosition = (node) => {
    let x = node.position?.x || 0;
    let y = node.position?.y || 0;
    if (node.parentNode) {
      const parent = nodes.find((n) => n.id === node.parentNode);
      if (parent) {
        const [px, py] = getAbsolutePosition(parent);
        x += px;
        y += py;
      }
    }
    return [x, y];
  };

  // --- NODE SIZING & PAD COMPENSATIONS ---
  const getNodeSize = (n) => {
    if (['AND Gate', 'OR Gate', 'Voting Gate', 'Transfer Gate'].includes(n.type)) {
      return { width: 100, height: 100 };
    }
    const styleWidth = n.data?.style?.width ? parsePx(n.data.style.width) : null;
    const styleHeight = n.data?.style?.height ? parsePx(n.data.style.height) : null;

    let w = styleWidth || n.width || n.measured?.width || 150;
    let h = styleHeight || n.height || n.measured?.height || 60;

    // +30px Padding logic restored
    if (n.type === 'default' || n.type === 'Event' || !n.type) {
      w += 30;
      h += 30;
    }
    return { width: w, height: h };
  };

  const getPos = (n) => {
    const [absX, absY] = getAbsolutePosition(n);
    let x = absX;
    let y = absY;

    // Shift coordinate anchor back by half the padding so nodes remain visually centered
    if (n.type === 'default' || n.type === 'Event' || !n.type) {
      x -= 15;
      y -= 15;
    }
    return { x, y };
  };

  const getHandlePoint = (node, handle) => {
    const { x, y } = getPos(node);
    const { width, height } = getNodeSize(node);

    if (['AND Gate', 'OR Gate', 'Voting Gate', 'Transfer Gate'].includes(node.type)) {
      return [x + width / 2, y + height / 2];
    }

    switch (resolveHandle(handle)) {
      case 'top':
        return [x + width / 2, y];
      case 'bottom':
        return [x + width / 2, y + height];
      case 'left':
        return [x, y + height / 2];
      case 'right':
        return [x + width, y + height / 2];
      default:
        return [x + width / 2, y + height / 2];
    }
  };

  /* =========================
     BOUNDING BOX CALCULATION
     ========================= */
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Calculate the highest and lowest dimensions of all elements
  nodes.forEach((n) => {
    const { x, y } = getPos(n);
    const { width, height } = getNodeSize(n);

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  // Add a generous 80px padding so edges and markers are never cropped
  const padding = 80;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  /* =========================
     TEXT WRAPPING
     ========================= */
  const wrapText = (text, maxWidth, fontSize) => {
    if (!text) return [];
    const approxCharWidth = fontSize * 0.6;
    const maxChars = Math.max(1, Math.floor(maxWidth / approxCharWidth));
    const words = text.split(' ');
    const lines = [];
    let line = '';
    words.forEach((w) => {
      if ((line + ' ' + w).trim().length <= maxChars) {
        line += (line ? ' ' : '') + w;
      } else {
        if (line) lines.push(line);
        line = w;
      }
    });
    if (line) lines.push(line);
    return lines;
  };

  /* =========================
     EDGE ROUTING
     ========================= */
  const getStepPath = ({ sx, sy, tx, ty, sPos, tPos }) => {
    const dx = Math.abs(tx - sx);
    const dy = Math.abs(ty - sy);
    const offset = Math.min(35, Math.max(dx, dy) / 2);

    let p1x = sx,
      p1y = sy,
      p4x = tx,
      p4y = ty;

    if (sPos === 'top') p1y -= offset;
    if (sPos === 'bottom') p1y += offset;
    if (sPos === 'left') p1x -= offset;
    if (sPos === 'right') p1x += offset;

    if (tPos === 'top') p4y -= offset;
    if (tPos === 'bottom') p4y += offset;
    if (tPos === 'left') p4x -= offset;
    if (tPos === 'right') p4x += offset;

    const d = [`M ${sx} ${sy}`];
    if (['left', 'right'].includes(sPos)) {
      d.push(`L ${p1x} ${sy} L ${p1x} ${p4y} L ${p4x} ${p4y}`);
    } else {
      d.push(`L ${sx} ${p1y} L ${p4x} ${p1y} L ${p4x} ${p4y}`);
    }
    d.push(`L ${tx} ${ty}`);
    return d.join(' ');
  };

  /* =========================
     SVG GENERATION
     ========================= */
  const svg = [];

  // Use viewBox based on exact boundary calculations.
  // Python svglib understands this perfectly without clipping.
  svg.push(`
    <svg xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         width="${contentWidth}"
         height="${contentHeight}"
         viewBox="${minX} ${minY} ${contentWidth} ${contentHeight}"
         style="background-color: #f5f5f5; font-family: 'Inter', sans-serif;">
  `);

  svg.push(`
    <defs>
      <marker id="marker-arrow-end" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="black" />
      </marker>
      <marker id="marker-arrow-start" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M9,0 L9,6 L0,3 z" fill="black" />
      </marker>
    </defs>
  `);

  // -- EDGES --
  svg.push(`<g id="edges-layer">`);
  edges.forEach((e) => {
    const source = nodes.find((n) => n.id === e.source);
    const target = nodes.find((n) => n.id === e.target);
    if (!source || !target) return;

    const sPos = resolveHandle(e.sourceHandle || 'bottom');
    const tPos = resolveHandle(e.targetHandle || 'top');
    const [sx, sy] = getHandlePoint(source, sPos);
    const [tx2, ty2] = getHandlePoint(target, tPos);

    const stroke = e.style?.stroke || 'black';
    const strokeWidth = e.style?.strokeWidth || 2;
    const markerStart = e.markerStart ? `marker-start="url(#marker-arrow-start)"` : '';
    const markerEnd = e.markerEnd ? `marker-end="url(#marker-arrow-end)"` : '';

    svg.push(`
      <path
        d="${getStepPath({ sx, sy, tx: tx2, ty: ty2, sPos, tPos })}"
        fill="none"
        stroke="${stroke}"
        stroke-width="${strokeWidth}"
        ${markerStart}
        ${markerEnd}
      />
    `);
  });
  svg.push(`</g>`);

  // -- NODES --
  svg.push(`<g id="nodes-layer">`);

  nodes.forEach((n) => {
    const { x, y } = getPos(n);
    const { width, height } = getNodeSize(n);
    const s = n.data?.style || {};

    let borderColor = s.borderColor || 'black';

    if (n.isEnabled === true || n.data?.isEnabled === true) {
      borderColor = 'green';
    } else {
      let ratingVal = null;
      if (n.type === 'default' && overallRating) ratingVal = overallRating;
      else if (n.type === 'Event' && n.data?.rating) ratingVal = n.data.rating;

      if (ratingVal) {
        const c = RatingColor(ratingVal);
        if (c && c !== 'transparent') borderColor = c;
      }
    }

    const bgColor = s.backgroundColor || 'white';
    const borderWidth = parsePx(s.borderWidth) || 2;
    const borderDash = getStrokeDashArray(s.borderStyle);
    const textColor = 'black';
    const fontSize = parsePx(s.fontSize) || 16;
    const fontFamily = s.fontFamily || 'Inter, sans-serif';
    const fontWeight = s.fontWeight || 500;
    const fontStyle = s.fontStyle || 'normal';

    const isAttack = attacksList?.some((scene) => scene.ID === n.id || scene.ID === n.data?.nodeId);
    const isRequirement = requirementsList?.some((scene) => scene.ID === n.id || scene.ID === n.data?.nodeId);

    // -- GATE RENDERERS --
    if (['AND Gate', 'OR Gate', 'Voting Gate', 'Transfer Gate'].includes(n.type)) {
      const gateX = x + (width - 100) / 2;
      const gateY = y + (height - 100) / 2;
      const gateFill = bgColor === 'transparent' ? 'white' : bgColor;
      const commonGateAttrs = `fill="${gateFill}" stroke="${borderColor}" stroke-width="6" transform="rotate(-90 256 256)"`;

      let pathD = '';
      let extraSvg = '';

      if (n.type === 'AND Gate') {
        pathD = 'M105 105v302h151c148 0 148-302 0-302H105z';
      } else if (n.type === 'OR Gate') {
        pathD =
          'M116.6 407c40-45.9 60.4-98.4 60.4-151 0-52.6-20.4-105.1-60.4-151H192c34.1 0 81.9 34 119.3 71.4 18.7 18.6 35.1 37.9 46.6 53.3 5.8 7.6 10.4 14.4 13.4 19.4 1.4 2.5 2.5 4.7 3.2 6.1 0 .3-.1.5-.2.9-.6 1.4-1.7 3.5-3.2 6-3 5.1-7.5 11.8-13.2 19.5-11.3 15.4-27.5 34.6-46.1 53.2C274.8 373 227.1 407 192 407z';
      } else if (n.type === 'Voting Gate') {
        pathD = 'M105 105v302h151c148 0 148-302 0-302H105z';
        extraSvg = `<path fill="none" stroke="${borderColor}" stroke-width="6" d="M105 407 L350 165"/>`;
      } else if (n.type === 'Transfer Gate') {
        pathD = 'M105 111.3V400.7L365.5 256Z';
        const label = escapeXML(n.data?.label || '');
        svg.push(`
          <text x="${x + width / 2}" y="${y - 10}"
            font-size="${fontSize}" font-family="${fontFamily}"
            text-anchor="middle" fill="${textColor}">
            ${label}
          </text>
        `);
      }

      svg.push(`
        <g transform="translate(${gateX} ${gateY}) scale(0.195)">
          <path d="${pathD}" ${commonGateAttrs} />
          ${extraSvg}
        </g>
      `);
      return;
    }

    // -- RECTANGLE NODES (Event, Default, Others) --
    if (n.type === 'Event' || n.type === 'default' || !n.type) {
      const labelText = n.data?.label || '';
      const lines = wrapText(labelText, width - 16, fontSize);
      const lineHeight = fontSize * 1.2;
      const totalTextHeight = lines.length * lineHeight;
      const textStartY = y + height / 2 - totalTextHeight / 2 + fontSize * 0.8;

      let iconSvg = '';
      const iconSize = 16;
      const iconXOffset = 10;
      const iconYOffset = 18;
      const iconSpacing = 15;

      const attackText = isAttack
        ? `<text x="${x + iconXOffset}" y="${y + iconYOffset}" font-size="${iconSize}" font-weight="700" fill="red" text-anchor="middle" dominant-baseline="middle">A</text>`
        : '';

      const requirementText = isRequirement
        ? `<text x="${x + (isAttack ? iconXOffset + iconSpacing : iconXOffset)}" y="${y + iconYOffset}" font-size="${iconSize}" font-weight="700" fill="#1976d2" text-anchor="middle" dominant-baseline="middle">R</text>`
        : '';

      iconSvg = attackText + requirementText;

      svg.push(`
        <g>
          <rect 
            x="${x}" y="${y}" 
            width="${width}" height="${height}"
            rx="6" ry="6"
            fill="${bgColor}"
            stroke="${borderColor}"
            stroke-width="${borderWidth}"
            stroke-dasharray="${borderDash}"
          />
          ${iconSvg}
          <text
            x="${x + width / 2}"
            y="${textStartY}"
            font-family="${fontFamily}"
            font-size="${fontSize}"
            font-weight="${fontWeight}"
            font-style="${fontStyle}"
            fill="${textColor}"
            text-anchor="middle"
          >
            ${lines.map((l, i) => `<tspan x="${x + width / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXML(l)}</tspan>`).join('')}
          </text>
        </g>
      `);
    }
  });

  svg.push(`</g>`);
  svg.push(`</svg>`);

  return svg.join('');
}

export { convertPNGtoSVG, createSVGIcon };
