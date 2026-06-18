// utils/generateDiagramSVG.js
export default function generateDiagramSVG(
  nodes,
  edges,
  getRectOfNodes,
  getTransformForBounds,
  imageWidth = 1000,
  imageHeight // optional
) {
  if (!imageHeight) {
    const defaultHeight = 800;
    const defaultWidth = 1000;
    imageHeight = (imageWidth / defaultWidth) * defaultHeight;
  }

  const [tx, ty, zoom] = getTransformForBounds(getRectOfNodes(nodes), imageWidth, imageHeight, 0.5, 2);

  const handleMap = { a: 'top', b: 'left', c: 'bottom', d: 'right', t: 'top', l: 'left', r: 'right', btm: 'bottom' };
  const resolveHandle = (h) => handleMap[h?.toLowerCase()] || h;

  const escapeXML = (str) =>
    String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  // Helper to ensure PDF svglib doesn't break on rgba colors
  const sanitizeColorForPDF = (colorStr, fallback) => {
    if (!colorStr) return fallback;
    if (colorStr.includes('rgba')) return fallback; // SVGLib hates alpha channels
    return colorStr;
  };

  const getAbsolutePosition = (node) => {
    let x = node.position.x;
    let y = node.position.y;

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

  const getHandlePoint = (node, handle) => {
    let [x, y] = getAbsolutePosition(node);
    const w = node.width;
    const h = node.height;

    switch (resolveHandle(handle)) {
      case 'top':
        return [x + w / 2, y];
      case 'bottom':
        return [x + w / 2, y + h];
      case 'left':
        return [x, y + h / 2];
      case 'right':
        return [x + w, y + h / 2];
      default:
        return [x + w / 2, y + h / 2];
    }
  };

  const getDistance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  const getStepPath = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, edge }) => {
    sourcePosition = resolveHandle(sourcePosition);
    targetPosition = resolveHandle(targetPosition);

    const distance = getDistance(sourceX, sourceY, targetX, targetY);

    let dynamicOffset = 40;
    if (distance > 150) dynamicOffset = 20;

    const maxXOffset = Math.abs(targetX - sourceX) / 2;
    const maxYOffset = Math.abs(targetY - sourceY) / 2;

    let offsetX = Math.min(dynamicOffset, maxXOffset);
    let offsetY = Math.min(dynamicOffset, maxYOffset);

    let p1x = sourceX;
    let p1y = sourceY;

    if (sourcePosition === 'top') p1y -= offsetY;
    if (sourcePosition === 'bottom') p1y += offsetY;
    if (sourcePosition === 'left') p1x -= offsetX;
    if (sourcePosition === 'right') p1x += offsetX;

    let p4x = targetX;
    let p4y = targetY;

    if (targetPosition === 'top') p4y -= offsetY;
    if (targetPosition === 'bottom') p4y += offsetY;
    if (targetPosition === 'left') p4x -= offsetX;
    if (targetPosition === 'right') p4x += offsetX;

    if ((sourcePosition === 'left' && targetPosition === 'left') || (sourcePosition === 'right' && targetPosition === 'right')) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourceWidth = sourceNode?.width || 0;
      const targetWidth = targetNode?.width || 0;

      const gapX = Math.abs(targetX - sourceX);
      const widthAvg = (sourceWidth + targetWidth) / 2;

      const pushExtra = Math.min(55, Math.max(35, gapX / 2, widthAvg / 3));

      if (sourcePosition === 'right' && targetX > sourceX) p1x += pushExtra;
      if (sourcePosition === 'left' && targetX < sourceX) p1x -= pushExtra;
    }

    if ((sourcePosition === 'top' && targetPosition === 'top') || (sourcePosition === 'bottom' && targetPosition === 'bottom')) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourceHeight = sourceNode?.height || 0;
      const targetHeight = targetNode?.height || 0;

      const gapY = Math.abs(targetY - sourceY);
      const heightAvg = (sourceHeight + targetHeight) / 2;

      const pushExtra = Math.min(55, Math.max(35, gapY / 2, heightAvg / 3));

      if (sourcePosition === 'bottom' && targetY > sourceY) p1y += pushExtra;
      if (sourcePosition === 'top' && targetY < sourceY) p1y -= pushExtra;
    }

    const horizontal = ['left', 'right'].includes(sourcePosition);
    const vertical = ['top', 'bottom'].includes(sourcePosition);

    const points = [`M ${sourceX} ${sourceY}`];

    if (horizontal) {
      const midY = p4y;
      points.push(`L ${p1x} ${sourceY}`);
      points.push(`L ${p1x} ${midY}`);
      points.push(`L ${p4x} ${midY}`);
      points.push(`L ${targetX} ${targetY}`);
    } else if (vertical) {
      const midX = p4x;
      points.push(`L ${sourceX} ${p1y}`);
      points.push(`L ${midX} ${p1y}`);
      points.push(`L ${midX} ${p4y}`);
      points.push(`L ${targetX} ${targetY}`);
    } else {
      points.push(`L ${targetX} ${targetY}`);
    }

    return points.join(' ');
  };

  const getLabelPosition = (path) => {
    const commands = path.split(/[A-Z]/).filter((cmd) => cmd.trim());
    const segments = [];
    for (let i = 1; i < commands.length; i++) {
      const prev = commands[i - 1].trim().split(/[ ,]/).filter(Number);
      const curr = commands[i].trim().split(/[ ,]/).filter(Number);
      if (prev.length >= 2 && curr.length >= 2) {
        segments.push({
          x1: parseFloat(prev[0]),
          y1: parseFloat(prev[1]),
          x2: parseFloat(curr[0]),
          y2: parseFloat(curr[1]),
          length: Math.hypot(curr[0] - prev[0], curr[1] - prev[1])
        });
      }
    }
    if (segments.length === 0) return { x: 0, y: 0 };
    const longestSegment = segments.reduce((max, seg) => (seg.length > max.length ? seg : max));
    return { x: (longestSegment.x1 + longestSegment.x2) / 2, y: (longestSegment.y1 + longestSegment.y2) / 2 };
  };

  // EXPLICIT POLYGON ARROWS
  const drawArrowHead = (x, y, handleLocation, color) => {
    const size = 12; // Arrow length
    const width = 6; // Arrow half-width

    const resolved = resolveHandle(handleLocation);
    let p1, p2, p3;

    if (resolved === 'top') {
      p1 = `${x},${y}`;
      p2 = `${x - width},${y - size}`;
      p3 = `${x + width},${y - size}`;
    } else if (resolved === 'bottom') {
      p1 = `${x},${y}`;
      p2 = `${x - width},${y + size}`;
      p3 = `${x + width},${y + size}`;
    } else if (resolved === 'left') {
      p1 = `${x},${y}`;
      p2 = `${x - size},${y - width}`;
      p3 = `${x - size},${y + width}`;
    } else {
      // right
      p1 = `${x},${y}`;
      p2 = `${x + size},${y - width}`;
      p3 = `${x + size},${y + width}`;
    }

    return `<polygon points="${p1} ${p2} ${p3}" fill="${color}" stroke="${color}" stroke-width="1" />`;
  };

  const svgParts = [];
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" style="background: #F5F5F5">`);
  svgParts.push(`<g transform="translate(${tx} ${ty}) scale(${zoom})">`);

  // GROUPS
  nodes
    .filter((n) => n.type === 'group')
    .forEach((group) => {
      const { x, y } = group.position;
      const { width, height } = group.style || group;
      const s = group.data?.style || {};

      const rawBg = s.backgroundColor || s.background || '#EFEFEF';
      const bg = sanitizeColorForPDF(rawBg, '#EFEFEF');
      const strokeColor = sanitizeColorForPDF(s.borderColor, '#2196F3');

      let strokeDash = '';
      if (s.borderStyle === 'dashed') strokeDash = 'stroke-dasharray="8,4"';
      else if (s.borderStyle === 'dotted') strokeDash = 'stroke-dasharray="4,4"';
      else strokeDash = 'stroke-dasharray="4"'; // fallback

      const borderWidth = s.borderWidth ? parseInt(s.borderWidth, 10) : 2;
      const labelColor = sanitizeColorForPDF(s.color, '#333333');
      const fontFamily = s.fontFamily || 'Inter';
      const fontSize = s.fontSize ? parseInt(s.fontSize, 10) : 14;
      const fontWeight = s.fontWeight || 'normal';

      svgParts.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${bg}" stroke="${strokeColor}" stroke-width="${borderWidth}" ${strokeDash} rx="8" ry="8"/>`
      );
      svgParts.push(
        `<text x="${x + width / 2}" y="${y + fontSize + 4}" font-family="${fontFamily}" font-size="${fontSize}" fill="${labelColor}" font-weight="${fontWeight}" text-anchor="middle" text-rendering="optimizeLegibility">${escapeXML(group.data?.label || 'Group')}</text>`
      );
    });

  // EDGES
  edges.forEach((edge) => {
    const s = nodes.find((n) => n.id === edge.source);
    const t = nodes.find((n) => n.id === edge.target);
    if (!s || !t) return;

    const validHandles = ['top', 'left', 'bottom', 'right'];
    const sourceHandleOk = !edge.sourceHandle || validHandles.includes(resolveHandle(edge.sourceHandle));
    const targetHandleOk = !edge.targetHandle || validHandles.includes(resolveHandle(edge.targetHandle));
    if (!sourceHandleOk || !targetHandleOk) return;

    const [sx, sy] = getHandlePoint(s, edge.sourceHandle);
    const [tx2, ty2] = getHandlePoint(t, edge.targetHandle);

    const path = getStepPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx2,
      targetY: ty2,
      sourcePosition: edge.sourceHandle,
      targetPosition: edge.targetHandle,
      edge
    });

    // 1. Line Styling Extraction
    const edgeStyle = edge.style || {};
    const stroke = sanitizeColorForPDF(edgeStyle.stroke, '#808080');
    const strokeWidth = edgeStyle.strokeWidth || 2;

    let strokeDash = '';
    if (edgeStyle.strokeDasharray && edgeStyle.strokeDasharray !== '0') {
      strokeDash = `stroke-dasharray="${edgeStyle.strokeDasharray}"`;
    }

    // 2. Draw the Line Path
    svgParts.push(`<path d="${path}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" ${strokeDash} />`);

    // 3. Arrow Boolean Validation (Don't draw if explicitly false)
    const showStart = edgeStyle.start === true || (edgeStyle.start !== false && !!edge.markerStart);
    const showEnd = edgeStyle.end === true || (edgeStyle.end !== false && !!edge.markerEnd);

    // 4. Draw Start Arrow (if enabled)
    if (showStart) {
      // Prioritize marker color, fallback to line stroke color
      const color = sanitizeColorForPDF(edge.markerStart?.color, stroke);
      svgParts.push(drawArrowHead(sx, sy, edge.sourceHandle || 'bottom', color));
    }

    // 5. Draw End Arrow (if enabled)
    if (showEnd) {
      // Prioritize marker color, fallback to line stroke color
      const color = sanitizeColorForPDF(edge.markerEnd?.color, stroke);
      svgParts.push(drawArrowHead(tx2, ty2, edge.targetHandle || 'top', color));
    }

    const label = edge.data?.label || '';
    const safeLabel = escapeXML(label);
    const labelPos = getLabelPosition(path);

    if (label) {
      svgParts.push(
        `<rect x="${labelPos.x - label.length * 3}" y="${labelPos.y - 8}" width="${label.length * 6}" height="16" rx="3" ry="3" fill="white" fill-opacity="0.85" stroke="none"/>`
      );
      svgParts.push(
        `<text x="${labelPos.x}" y="${labelPos.y}" font-family="Inter" font-size="10" fill="#333" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text>`
      );
    }
  });

  // NODES (Normal)
  nodes
    .filter((n) => n.type !== 'group')
    .forEach((node) => {
      const { x, y } = node.position;
      const { width, height } = node;
      const s = node.data?.style || {};

      const backgroundColor = sanitizeColorForPDF(s.backgroundColor, '#dadada');
      const borderColor = sanitizeColorForPDF(s.borderColor, 'gray');
      const color = sanitizeColorForPDF(s.color, 'black');

      const borderWidth = s.borderWidth ? parseInt(s.borderWidth, 10) : 2;
      const fontFamily = s.fontFamily || 'Inter';
      const fontSizeNum = parseInt(s.fontSize) || 12;

      const rx = node.type === 'data' ? height / 2 : 3;

      let strokeDash = '';
      if (s.borderStyle === 'dashed') strokeDash = 'stroke-dasharray="6,4"';
      else if (s.borderStyle === 'dotted') strokeDash = 'stroke-dasharray="3,3"';

      svgParts.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" ${strokeDash} />`
      );

      const label = node.data?.label || '';
      const safeLabel = escapeXML(label);

      const approxCharWidth = fontSizeNum * 0.55;
      const maxCharsPerLine = Math.floor(width / approxCharWidth);

      const words = safeLabel.split(' ');
      const lines = [];
      let line = '';

      words.forEach((word) => {
        if ((line + ' ' + word).trim().length <= maxCharsPerLine) {
          line += (line ? ' ' : '') + word;
        } else {
          if (line) lines.push(line);
          line = word;
        }
      });
      if (line) lines.push(line);

      const totalTextHeight = lines.length * fontSizeNum;
      const startY = y + height / 2 - totalTextHeight / 2 + fontSizeNum * 0.8;

      svgParts.push(
        `<text x="${x + width / 2}" y="${startY}" font-family="${fontFamily}" font-size="${fontSizeNum}" fill="${color}" text-anchor="middle">`
      );
      lines.forEach((line, idx) => {
        svgParts.push(`<tspan x="${x + width / 2}" dy="${idx === 0 ? 0 : fontSizeNum}">${escapeXML(line)}</tspan>`);
      });
      svgParts.push(`</text>`);
    });

  svgParts.push(`</g></svg>`);

  return svgParts.join('');
}
