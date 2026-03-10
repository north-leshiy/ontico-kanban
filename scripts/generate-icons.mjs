#!/usr/bin/env node
// Generates PNG icons using raw PNG encoding (no external dependencies).
// Icon design: blue rounded square with a white 2×3 grid (kanban board).

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function createPNG(size) {
  const pixels = new Uint8Array(size * size * 4);

  const bg = [59, 130, 246, 255];    // blue-500
  const card = [255, 255, 255, 220]; // semi-white cards
  const radius = Math.round(size * 0.15);

  // Helper: distance-based rounded corner fill
  function inRoundedRect(x, y, rx, ry, rw, rh, r) {
    const cx = Math.max(rx + r, Math.min(rx + rw - r, x));
    const cy = Math.max(ry + r, Math.min(ry + rh - r, y));
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  }

  // Fill background (rounded square)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      if (inRoundedRect(x, y, 0, 0, size, size, radius)) {
        pixels[idx]     = bg[0];
        pixels[idx + 1] = bg[1];
        pixels[idx + 2] = bg[2];
        pixels[idx + 3] = bg[3];
      }
    }
  }

  // Draw kanban cards: 2 columns × 3 rows
  const cols = 2, rows = 3;
  const pad = Math.round(size * 0.12);
  const gap = Math.round(size * 0.06);
  const colW = Math.floor((size - pad * 2 - gap * (cols - 1)) / cols);
  const rowH = Math.floor((size - pad * 2 - gap * (rows - 1)) / rows);
  const cardR = Math.max(1, Math.round(size * 0.04));

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const rx = pad + col * (colW + gap);
      const ry = pad + row * (rowH + gap);
      for (let y = ry; y < ry + rowH; y++) {
        for (let x = rx; x < rx + colW; x++) {
          if (x < 0 || x >= size || y < 0 || y >= size) continue;
          if (inRoundedRect(x, y, rx, ry, colW, rowH, cardR)) {
            const idx = (y * size + x) * 4;
            pixels[idx]     = card[0];
            pixels[idx + 1] = card[1];
            pixels[idx + 2] = card[2];
            pixels[idx + 3] = card[3];
          }
        }
      }
    }
  }

  return encodePNG(pixels, size, size);
}

// --- Minimal PNG encoder (no dependencies) ---

function encodePNG(rgba, width, height) {
  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const typeBytes = new TextEncoder().encode(type);
    const len = new Uint8Array(4);
    new DataView(len.buffer).setUint32(0, data.length, false);
    const crcData = new Uint8Array(typeBytes.length + data.length);
    crcData.set(typeBytes);
    crcData.set(data, typeBytes.length);
    const crc = new Uint8Array(4);
    new DataView(crc.buffer).setUint32(0, crc32(crcData), false);
    return concat([len, typeBytes, data, crc]);
  }

  // IHDR
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width, false);
  dv.setUint32(4, height, false);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB (we'll handle alpha via filter)
  // Actually use RGBA (color type 6)
  ihdr[9] = 6;
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw scanlines with filter byte 0
  const raw = new Uint8Array(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]     = rgba[src];
      raw[dst + 1] = rgba[src + 1];
      raw[dst + 2] = rgba[src + 2];
      raw[dst + 3] = rgba[src + 3];
    }
  }

  const compressed = deflate(raw);

  const idat = compressed;
  const iend = new Uint8Array(0);

  return concat([signature, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', iend)]);
}

function concat(arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

// zlib deflate (store method, no compression — valid PNG)
function deflate(data) {
  // zlib header: CMF=0x78, FLG computed for no compression
  const BSIZE = 65535;
  const blocks = Math.ceil(data.length / BSIZE) || 1;
  const out = new Uint8Array(2 + data.length + blocks * 5 + 4);
  out[0] = 0x78; out[1] = 0x01; // zlib header (deflate, no compression)
  let pos = 2;
  for (let i = 0; i < blocks; i++) {
    const start = i * BSIZE;
    const end = Math.min(start + BSIZE, data.length);
    const isLast = i === blocks - 1 ? 1 : 0;
    const len = end - start;
    out[pos++] = isLast;
    out[pos++] = len & 0xff;
    out[pos++] = (len >> 8) & 0xff;
    out[pos++] = (~len) & 0xff;
    out[pos++] = ((~len) >> 8) & 0xff;
    out.set(data.subarray(start, end), pos);
    pos += len;
  }
  // Adler-32
  let s1 = 1, s2 = 0;
  for (let i = 0; i < data.length; i++) {
    s1 = (s1 + data[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  const adler = (s2 << 16) | s1;
  out[pos++] = (adler >> 24) & 0xff;
  out[pos++] = (adler >> 16) & 0xff;
  out[pos++] = (adler >> 8) & 0xff;
  out[pos++] = adler & 0xff;
  return out.subarray(0, pos);
}

// CRC-32 table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(data) {
  let c = 0xffffffff;
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Generate icons
for (const size of [16, 48, 128]) {
  const png = createPNG(size);
  const outPath = join(outDir, `icon${size}.png`);
  writeFileSync(outPath, png);
  console.log(`Generated ${outPath} (${png.length} bytes)`);
}
