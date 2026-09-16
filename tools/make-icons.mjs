// App icon generator. Draws the PNGs by hand (no third-party libraries),
// so the icon can be rebuilt with a single command: npm run icons
import { deflateSync } from 'node:zlib';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const OUT_DIR = fileURLToPath(new URL('../public/icons/', import.meta.url));

const RAINBOW = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#29B6F6', '#3949AB', '#8E24AA'];
const BG = [22, 16, 54];

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bits per channel
  ihdr[9] = 6;   // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type "none"
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));

/** Colour of a point in normalised 0..1 coordinates. */
function shade(x, y) {
  // rounded square
  const r = 0.22;
  const dx = Math.max(r - x, x - (1 - r), 0);
  const dy = Math.max(r - y, y - (1 - r), 0);
  if (Math.hypot(dx, dy) > r) return null;

  // the note: head (tilted ellipse) + stem
  const headX = 0.40, headY = 0.66, rx = 0.155, ry = 0.125, angle = -0.35;
  const px = x - headX, py = y - headY;
  const rxx = px * Math.cos(angle) - py * Math.sin(angle);
  const ryy = px * Math.sin(angle) + py * Math.cos(angle);
  const inHead = (rxx / rx) ** 2 + (ryy / ry) ** 2 <= 1;
  const inStem = x >= 0.515 && x <= 0.565 && y >= 0.24 && y <= 0.68;
  if (inHead || inStem) return [255, 255, 255];

  // rainbow stripes below, background on top
  const band = Math.floor(((y - 0.12) / 0.82) * RAINBOW.length);
  if (band < 0 || band >= RAINBOW.length) return BG;
  return hex(RAINBOW[band]);
}

function render(size) {
  const samples = 3; // edge antialiasing
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const color = shade((x + (sx + 0.5) / samples) / size, (y + (sy + 0.5) / samples) / size);
          if (color) {
            r += color[0]; g += color[1]; b += color[2]; a += 255;
          }
        }
      }
      const total = samples * samples;
      const i = (y * size + x) * 4;
      const opaque = a / 255 || 1;
      rgba[i] = Math.round(r / opaque);
      rgba[i + 1] = Math.round(g / opaque);
      rgba[i + 2] = Math.round(b / opaque);
      rgba[i + 3] = Math.round(a / total);
    }
  }
  return encodePng(size, size, rgba);
}

await mkdir(OUT_DIR, { recursive: true });
for (const size of [192, 512]) {
  const file = join(OUT_DIR, `icon-${size}.png`);
  await writeFile(file, render(size));
  console.log('created', file);
}
