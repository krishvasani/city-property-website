// Pixel dimensions of a local image under public/ (PNG, JPEG, WebP, GIF) by
// reading the file header — no image library needed. Used for
// og:image:width/height. Returns undefined for remote or unknown files.
import { openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';

export interface Size { width: number; height: number }
const cache = new Map<string, Size | undefined>();

function readHead(path: string, bytes: number): Buffer | undefined {
  try {
    const fd = openSync(path, 'r');
    const buf = Buffer.alloc(bytes);
    const n = readSync(fd, buf, 0, bytes, 0);
    closeSync(fd);
    return buf.subarray(0, n);
  } catch { return undefined; }
}

function parse(buf: Buffer): Size | undefined {
  // PNG
  if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  // GIF
  if (buf.toString('ascii', 0, 3) === 'GIF') return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  // WebP (VP8 / VP8L / VP8X)
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') { const b = buf.readUInt32LE(21); return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 }; }
    if (chunk === 'VP8X') return { width: (buf.readUIntLE(24, 3)) + 1, height: (buf.readUIntLE(27, 3)) + 1 };
  }
  // JPEG: walk segments to the first SOFn
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0xff) { i += 2; continue; }
      const len = buf.readUInt16BE(i + 2);
      if ((marker >= 0xc0 && marker <= 0xcf) && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return undefined;
}

/** `src` is a root-relative path like "/uploads/x.jpg" or "/logo/y.png". */
export function imageSize(src: string): Size | undefined {
  if (!src.startsWith('/') || src.startsWith('//')) return undefined;
  if (cache.has(src)) return cache.get(src);
  const file = join(process.cwd(), 'public', decodeURIComponent(src.split('?')[0]));
  // 64 KB covers JPEGs with large EXIF/ICC blocks before the SOF marker.
  const head = readHead(file, 65536);
  const size = head ? parse(head) : undefined;
  cache.set(src, size);
  return size;
}
