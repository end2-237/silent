#!/usr/bin/env python3
"""Découpe la planche des huit signes en illustrations détourées.

La source (tools/assets/signes.jfif) présente les mains en 4 colonnes sur
2 rangées, chacune surmontée de son intitulé. On isole la plus grosse tache
sombre de chaque case — la main, jamais le texte — puis on remplace le fond
par de la transparence : les filets clairs des phalanges deviennent des
creux, si bien que la main prend la couleur du support.

Usage : python3 tools/slice_hands.py
"""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "tools", "assets", "signes.jfif")
OUT = os.path.join(ROOT, "public", "hands")

# Ordre de lecture de la planche → identifiant de signe dans lib/data.ts.
ORDER = [0, 6, 7, 1, 2, 3, 4, 5]

DARK = 60      # en-dessous : plein
LIGHT = 205    # au-dessus : transparent
HEIGHT = 440   # hauteur finale, deux fois la taille d'affichage
PAD = 8


def bands(values, threshold=0):
    """Plages contiguës d'indices dont la valeur dépasse le seuil."""
    out, start = [], None
    for i, v in enumerate(values):
        if v > threshold and start is None:
            start = i
        elif v <= threshold and start is not None:
            out.append((start, i))
            start = None
    if start is not None:
        out.append((start, len(values)))
    return out


def cell_box(grey, box):
    """Boîte de la main dans une case : la bande la plus dense, texte exclu."""
    left, top, right, bottom = box
    crop = grey.crop(box)
    px = crop.load()
    w, h = crop.size

    rows = [sum(1 for x in range(w) if px[x, y] < 128) for y in range(h)]
    best = max(bands(rows, 1), key=lambda b: sum(rows[b[0]:b[1]]))
    y0, y1 = best

    cols = [sum(1 for y in range(y0, y1) if px[x, y] < 128) for x in range(w)]
    # On ignore les colonnes à peine marquées : ce sont les poussières de la
    # case voisine, pas la main.
    marks = [m for m in bands(cols, max(2, (y1 - y0) // 60)) if m[1] - m[0] > 8]
    x0, x1 = marks[0][0], marks[-1][1]
    return (left + x0, top + y0, left + x1, top + y1)


def cut_out(image):
    """Fond et filets clairs → transparence.

    On enregistre en niveaux de gris + alpha : l'image ne porte que la forme,
    ce qui divise son poids par deux par rapport à du RGBA.
    """
    grey = image.convert("L")
    alpha = Image.new("L", image.size)
    src, dst = grey.load(), alpha.load()
    span = LIGHT - DARK
    for y in range(image.height):
        for x in range(image.width):
            v = src[x, y]
            dst[x, y] = 0 if v >= LIGHT else (255 if v <= DARK else round(255 * (LIGHT - v) / span))
    return Image.merge("LA", (Image.new("L", image.size, 24), alpha))


def main():
    sheet = Image.open(SOURCE).convert("RGB")
    grey = sheet.convert("L")
    os.makedirs(OUT, exist_ok=True)
    w, h = sheet.size

    for index, sign in enumerate(ORDER):
        col, row = index % 4, index // 4
        box = (round(col * w / 4), round(row * h / 2), round((col + 1) * w / 4), round((row + 1) * h / 2))
        x0, y0, x1, y1 = cell_box(grey, box)
        hand = sheet.crop((max(0, x0 - PAD), max(0, y0 - PAD), min(w, x1 + PAD), min(h, y1 + PAD)))

        cut = cut_out(hand)
        scale = HEIGHT / cut.height
        cut = cut.resize((round(cut.width * scale), HEIGHT), Image.LANCZOS)

        path = os.path.join(OUT, f"{sign}.png")
        cut.save(path, "PNG", optimize=True)
        print("%s (%dx%d, %d o)" % (os.path.relpath(path, ROOT), cut.width, cut.height, os.path.getsize(path)))


if __name__ == "__main__":
    main()
