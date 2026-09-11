#!/usr/bin/env python3
"""Génère les icônes PNG de la PWA SILENT sans dépendance externe.

Un cœur (équation implicite) posé sur un fond nuit, rendu en supersampling 3x
puis encodé en PNG (zlib + chunks bruts). Usage : python3 tools/make_icons.py
"""
import math
import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "icons")

BG_EDGE = (5, 6, 11)
BG_CORE = (18, 21, 32)
HEART_TOP = (241, 122, 108)
HEART_BOTTOM = (196, 72, 92)
RING = (108, 122, 140)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def over(dst, src, alpha):
    return tuple(round(dst[i] * (1 - alpha) + src[i] * alpha) for i in range(3))


def heart_inside(x, y):
    """x, y normalisés dans [-1, 1] (y vers le haut)."""
    a = x * x + y * y - 1.0
    return a * a * a - x * x * y * y * y <= 0.0


def sample(px, py, size, scale, ring):
    """Couleur d'un sous-échantillon, coordonnées en pixels."""
    u = (px / size) * 2 - 1  # -1..1
    v = 1 - (py / size) * 2
    r = math.hypot(u, v)

    # Fond : dégradé radial nuit.
    col = lerp(BG_CORE, BG_EDGE, min(1.0, (r / 1.25) ** 1.15))

    # Anneau discret (le « silence » qui entoure).
    if ring:
        d = abs(r - 0.80)
        if d < 0.013:
            col = over(col, RING, 0.30 * (1 - d / 0.013))

    # Cœur.
    hx, hy = u / scale, (v - 0.06) / scale
    if heart_inside(hx, hy):
        t = min(1.0, max(0.0, (0.55 - hy) / 1.35))
        col = lerp(HEART_TOP, HEART_BOTTOM, t)
    return col


def render(size, scale=0.62, ring=True, ss=3):
    rows = []
    inv = 1.0 / (ss * ss)
    for y in range(size):
        row = bytearray()
        for x in range(size):
            acc = [0.0, 0.0, 0.0]
            for sy in range(ss):
                for sx in range(ss):
                    c = sample(x + (sx + 0.5) / ss, y + (sy + 0.5) / ss, size, scale, ring)
                    acc[0] += c[0]
                    acc[1] += c[1]
                    acc[2] += c[2]
            row += bytes((round(acc[0] * inv), round(acc[1] * inv), round(acc[2] * inv), 255))
        rows.append(bytes(row))
    return rows


def write_png(path, size, rows):
    raw = b"".join(b"\x00" + r for r in rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
    png += chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(png)
    print("%s (%dx%d, %d o)" % (os.path.relpath(path), size, size, len(png)))


def main():
    os.makedirs(OUT, exist_ok=True)
    write_png(os.path.join(OUT, "icon-192.png"), 192, render(192))
    write_png(os.path.join(OUT, "icon-512.png"), 512, render(512))
    # Maskable : cœur plus petit pour survivre au rognage circulaire (safe zone 80%).
    write_png(os.path.join(OUT, "icon-maskable-512.png"), 512, render(512, scale=0.44, ring=False))
    write_png(os.path.join(OUT, "apple-touch-icon.png"), 180, render(180, scale=0.58))


if __name__ == "__main__":
    main()
