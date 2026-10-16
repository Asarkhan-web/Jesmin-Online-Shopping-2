import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with scanline filter 0
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if inside rounded squircle / circle or bag shape
      if (dist <= radius) {
        // Gradient from teal (17, 153, 142) to emerald (56, 239, 125)
        const t = (x + y) / (width + height);
        const pr = Math.round(17 + t * (56 - 17));
        const pg = Math.round(153 + t * (239 - 153));
        const pb = Math.round(142 + t * (125 - 142));

        // Center white bag accent
        const bagLeft = cx - width * 0.22;
        const bagRight = cx + width * 0.22;
        const bagTop = cy - height * 0.12;
        const bagBottom = cy + height * 0.22;

        const isBagBody = x >= bagLeft && x <= bagRight && y >= bagTop && y <= bagBottom;
        const handleDist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - bagTop, 2));
        const isHandle = handleDist >= width * 0.1 && handleDist <= width * 0.15 && y <= bagTop;

        if (isBagBody || isHandle) {
          rawData[pixelOffset] = 255;
          rawData[pixelOffset + 1] = 255;
          rawData[pixelOffset + 2] = 255;
          rawData[pixelOffset + 3] = 255;
        } else {
          rawData[pixelOffset] = pr;
          rawData[pixelOffset + 1] = pg;
          rawData[pixelOffset + 2] = pb;
          rawData[pixelOffset + 3] = 255;
        }
      } else {
        // Transparent or maskable background
        rawData[pixelOffset] = 17;
        rawData[pixelOffset + 1] = 153;
        rawData[pixelOffset + 2] = 142;
        rawData[pixelOffset + 3] = r === 17 ? 255 : 0; // Maskable uses solid bg
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);

  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcInput), 0);

  return Buffer.concat([len, typeBuf, data, crcVal]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, 0, 0, 0));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, 0, 0, 0));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 17, 153, 142));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, 17, 153, 142));

// Generate icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#11998e" />
      <stop offset="100%" stop-color="#38ef7d" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#g)" />
  <!-- Shopping Bag outline -->
  <path d="M160 200 C160 140, 352 140, 352 200" stroke="#ffffff" stroke-width="28" stroke-linecap="round" fill="none"/>
  <rect x="120" y="200" width="272" height="232" rx="36" fill="#ffffff" />
  <circle cx="216" cy="280" r="14" fill="#11998e" />
  <circle cx="296" cy="280" r="14" fill="#11998e" />
  <path d="M216 324 Q256 360 296 324" stroke="#11998e" stroke-width="14" stroke-linecap="round" fill="none" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
console.log('Icons generated successfully in public/');
