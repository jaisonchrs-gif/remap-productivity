import fs from 'fs';
import zlib from 'zlib';

// Minimal PNG encoder in pure Node.js (no dependencies required)
function createPNG(width, height, drawPixelFn) {
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowBytes);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression method: 0
  ihdr[11] = 0; // Filter method: 0
  ihdr[12] = 0; // Interlace method: 0
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crc.writeUInt32BE(crcVal >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Standard CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Icon design: Warm editorial background with a modern bookmark / resume chevron emblem in cobalt (#1F5EFF) and graphite (#171717)
function renderIcon(isMaskable) {
  return (x, y, w, h) => {
    const nx = x / w;
    const ny = y / h;

    // Background: #F7F6F2
    const bgR = 0xf7, bgG = 0xf6, bgB = 0xf2;
    const accentR = 0x1f, accentG = 0x5e, accentB = 0xff; // #1F5EFF
    const darkR = 0x17, darkG = 0x17, darkB = 0x17; // #171717

    // Safe area calculation for maskable icons
    const pad = isMaskable ? 0.18 : 0.12;
    const minX = pad, maxX = 1 - pad;
    const minY = pad, maxY = 1 - pad;

    // Corner radius for standard app icon
    if (!isMaskable) {
      const rx = 0.22;
      const dx = Math.max(0, Math.max(rx - nx, nx - (1 - rx)));
      const dy = Math.max(0, Math.max(rx - ny, ny - (1 - rx)));
      if (dx * dx + dy * dy > rx * rx) {
        return [0, 0, 0, 0]; // Transparent outer edge
      }
    }

    // Centered bookmark ribbon motif
    // Vertical ribbon between x: 0.36 to 0.64, y: 0.22 to 0.76
    // With a chevron cutout at bottom
    const rx1 = 0.34;
    const rx2 = 0.66;
    const ry1 = isMaskable ? 0.26 : 0.22;
    const ry2 = isMaskable ? 0.74 : 0.76;
    const chevronCut = 0.12;

    const inRibbonX = nx >= rx1 && nx <= rx2;
    const inRibbonTop = ny >= ry1 && ny <= ry2;
    
    // Bottom chevron point
    const midX = (rx1 + rx2) / 2;
    const distFromMid = Math.abs(nx - midX) / ((rx2 - rx1) / 2);
    const bottomYLimit = ry2 - (1 - distFromMid) * chevronCut;

    if (inRibbonX && inRibbonTop && ny <= bottomYLimit) {
      // Inner subtle detail: left side graphite, right accent band
      if (nx >= rx2 - 0.08) {
        return [accentR, accentG, accentB, 255];
      }
      return [darkR, darkG, darkB, 255];
    }

    // Subtle horizontal indicator lines on the card
    // Line 1: y around 0.32, x from 0.24 to 0.30
    if (ny >= 0.35 && ny <= 0.37 && nx >= (isMaskable ? 0.22 : 0.20) && nx <= (isMaskable ? 0.30 : 0.28)) {
      return [0xaa, 0xa9, 0xa4, 255];
    }
    // Line 2: y around 0.44
    if (ny >= 0.44 && ny <= 0.46 && nx >= (isMaskable ? 0.22 : 0.20) && nx <= (isMaskable ? 0.30 : 0.28)) {
      return [0xaa, 0xa9, 0xa4, 255];
    }

    return [bgR, bgG, bgB, 255];
  };
}

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

// Generate PNGs
fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192, renderIcon(false)));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512, renderIcon(false)));
fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180, renderIcon(false)));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512, renderIcon(true)));

console.log('PNG Icons generated successfully.');
