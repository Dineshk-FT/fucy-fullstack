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

  const handleMap = { a: 'top', b: 'left', c: 'bottom', d: 'right' };
  const resolveHandle = (h) => handleMap[h] || h;

  const escapeXML = (str) =>
    String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

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

    // Same-side adjustments
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

  const markerMap = new Map();
  edges.forEach((edge) => {
    if (edge.style?.start && edge.markerStart?.color) markerMap.set(`start-${edge.id}`, edge.markerStart.color);
    if (edge.style?.end && edge.markerEnd?.color) markerMap.set(`end-${edge.id}`, edge.markerEnd.color);
  });

  const getMarkerDefs = () => {
    let defs = '';
    for (const [id, color] of markerMap.entries()) {
      const [markerType, ...rest] = id.split('-');
      const edgeId = rest.join('-');
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) continue;

      const markerSize = 6;
      const arrowSize = markerSize / 2;

      const handle = markerType === 'start' ? edge.sourceHandle : edge.targetHandle;
      const resolved = resolveHandle(handle);

      let path, refX, refY, orient;

      switch (resolved) {
        case 'right':
          path = `M0,${arrowSize} L${markerSize},${markerSize} L${markerSize},0 Z`;
          refX = 0;
          refY = arrowSize;
          orient = '0';
          break;
        case 'left':
          path = `M0,0 L${markerSize},${arrowSize} L0,${markerSize} Z`;
          refX = markerSize;
          refY = arrowSize;
          orient = '0';
          break;
        case 'top':
          path = `M0,0 L${arrowSize},${markerSize} L${markerSize},0 Z`;
          refX = arrowSize;
          refY = markerSize;
          orient = '0';
          break;
        case 'bottom':
          path = `M0,${markerSize} L${arrowSize},0 L${markerSize},${markerSize} Z`;
          refX = arrowSize;
          refY = 0;
          orient = '0';
          break;
        default:
          path = `M0,0 L${markerSize},${arrowSize} L0,${markerSize} Z`;
          refX = 0;
          refY = arrowSize;
          orient = 'auto';
      }

      defs += `<marker id="${id}" markerWidth="${markerSize}" markerHeight="${markerSize}" refX="${refX}" refY="${refY}" orient="${orient}">
        <path d="${path}" fill="${color}"/></marker>`;
    }
    return defs;
  };

  const svgParts = [];
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" style="background: #F5F5F5">`);
  svgParts.push(`<defs>${getMarkerDefs()}</defs>`);
  svgParts.push(`<g transform="translate(${tx} ${ty}) scale(${zoom})">`);

  // Groups
  nodes
    .filter((n) => n.type === 'group')
    .forEach((group) => {
      const { x, y } = group.position;
      const { width, height } = group.style || group;
      const bg = group.data?.style?.background || 'rgba(33,150,243,0.05)';
      svgParts.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${bg}" stroke="#555" stroke-dasharray="4" rx="8" ry="8"/>`
      );
      svgParts.push(
        `<text x="${x + width / 2}" y="${
          y + 20
        }" font-family="Inter" font-size="16" text-anchor="middle" text-rendering="optimizeLegibility">${escapeXML(
          group.data?.label || 'Group'
        )}</text>`
      );
    });

  // Edges
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

    const stroke = edge.style?.stroke || '#000000';
    const markerStart = edge.style?.start && edge.markerStart?.color ? `url(#start-${edge.id})` : '';
    const markerEnd = edge.style?.end && edge.markerEnd?.color ? `url(#end-${edge.id})` : '';
    const label = edge.data?.label || '';
    const safeLabel = escapeXML(label);
    const labelPos = getLabelPosition(path);

    svgParts.push(
      `<path d="${path}" stroke="${stroke}" stroke-width="2" fill="none" ${markerStart ? `marker-start="${markerStart}"` : ''} ${
        markerEnd ? `marker-end="${markerEnd}"` : ''
      } />`
    );

    if (label) {
      svgParts.push(
        `<rect x="${labelPos.x - label.length * 3}" y="${labelPos.y - 8}" width="${
          label.length * 6
        }" height="16" rx="3" ry="3" fill="white" fill-opacity="0.85" stroke="none"/>`
      );
      svgParts.push(
        `<text x="${labelPos.x}" y="${labelPos.y}" font-family="Inter" font-size="10" fill="#333" text-anchor="middle" dominant-baseline="middle">${safeLabel}</text>`
      );
    }
  });

  // Nodes
  nodes
    .filter((n) => n.type !== 'group')
    .forEach((node) => {
      const { x, y } = node.position;
      const { width, height } = node;
      const s = node.data?.style || {};
      const {
        backgroundColor = '#dadada',
        borderColor = 'gray',
        borderWidth = 2,
        color = 'black',
        fontFamily = 'Inter',
        fontSize = '12px'
      } = s;

      const fontSizeNum = parseInt(fontSize) || 12;
      const rx = node.type === 'data' ? height / 2 : 3;

      svgParts.push(
        `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" />`
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
        `<text x="${
          x + width / 2
        }" y="${startY}" font-family="${fontFamily}" font-size="${fontSizeNum}" fill="${color}" text-anchor="middle">`
      );
      lines.forEach((line, idx) => {
        svgParts.push(`<tspan x="${x + width / 2}" dy="${idx === 0 ? 0 : fontSizeNum}">${escapeXML(line)}</tspan>`);
      });
      svgParts.push(`</text>`);
    });

  svgParts.push(`</g></svg>`);

  return svgParts.join('');
}
