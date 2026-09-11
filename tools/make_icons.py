#!/usr/bin/env python3
"""Génère la marque SILENT et les icônes de la PWA.

La silhouette du couple (tools/assets/couple.jpg) est détourée, puis posée en
blanc sur un carré arrondi en dégradé ambre → corail.

Usage : python3 tools/make_icons.py   (nécessite Pillow)
"""
import os

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "tools", "assets", "couple.jpg")
OUT = os.path.join(ROOT, "public", "icons")

# Dégradé de l'identité : ambre → corail → braise.
STOPS = [(0.0, (255, 166, 92)), (0.46, (255, 90, 46)), (1.0, (223, 48, 22))]
SS = 3  # supersampling des coins arrondis


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size):
    """Dégradé diagonal, avec une lumière douce en haut à droite."""
    image = Image.new("RGB", (size, size))
    pixels = []
    for y in range(size):
        fy = y / (size - 1)
        for x in range(size):
            t = min(1.0, max(0.0, (x / (size - 1)) * 0.55 + fy * 0.45))
            for index in range(len(STOPS) - 1):
                t0, c0 = STOPS[index]
                t1, c1 = STOPS[index + 1]
                if t <= t1 or index == len(STOPS) - 2:
                    color = lerp(c0, c1, (t - t0) / (t1 - t0) if t1 > t0 else 0)
                    break
            # Halo clair : le même que derrière les écrans de l'application.
            dx, dy = (x - size * 0.78) / size, (y - size * 0.12) / size
            glow = max(0.0, 1.0 - (dx * dx + dy * dy) ** 0.5 / 0.55) ** 2 * 0.22
            pixels.append(tuple(min(255, round(c + 255 * glow)) for c in color))
    image.putdata(pixels)
    return image


def silhouette(bust=0.52):
    """Détoure la silhouette et garde le buste : deux têtes qui se rejoignent."""
    grey = Image.open(SOURCE).convert("L")
    mask = grey.point(lambda value: 255 if value < 128 else 0)
    box = mask.getbbox()
    if box is None:
        raise SystemExit("silhouette introuvable dans la source")
    left, top, right, bottom = box
    mask = mask.crop((left, top, right, top + round((bottom - top) * bust)))
    # Recadrage horizontal serré sur la partie conservée.
    tight = mask.getbbox()
    return mask.crop(tight) if tight else mask


def fade_bottom(mask, band=0.16):
    """Estompe la coupe basse du buste : pas de trait net qui flotte."""
    height = mask.height
    start = round(height * (1 - band))
    ramp = Image.new("L", (mask.width, height), 255)
    pixels = ramp.load()
    for y in range(start, height):
        value = round(255 * (1 - (y - start) / max(1, height - start)) ** 1.4)
        for x in range(mask.width):
            pixels[x, y] = value
    return ImageChops.multiply(mask, ramp)


def rounded_mask(size, radius_ratio):
    big = size * SS
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, big - 1, big - 1), radius=round(big * radius_ratio), fill=255
    )
    return mask.resize((size, size), Image.LANCZOS)


def compose(size, hscale, radius_ratio, bleed, bust=0.52):
    """Une icône : dégradé, silhouette blanche, coins arrondis.

    `hscale` hauteur de la silhouette en fraction de l'icône
    `bleed`  True : la silhouette déborde en bas du cadre
    """
    card = gradient(size).convert("RGBA")

    shape = silhouette(bust)
    height = round(size * hscale)
    width = round(shape.width * height / shape.height)
    if width > size * 0.98:  # jamais plus large que le cadre
        width = round(size * 0.98)
        height = round(shape.height * width / shape.width)
    shape = shape.resize((width, height), Image.LANCZOS)
    if not bleed:
        shape = fade_bottom(shape)

    x = (size - width) // 2
    y = size - height if bleed else round((size - height) / 2)

    # Ombre portée douce : donne du relief sans salir le dégradé.
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow.paste((120, 30, 10, 140), (x, y + round(size * 0.012)), shape)
    card.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(size * 0.018)))

    figure = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    figure.paste((255, 255, 255, 255), (x, y), shape)
    card.alpha_composite(figure)

    # Filet intérieur très discret, effet « verre ».
    edge = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(edge)
    inset = max(1, round(size * 0.012))
    draw.rounded_rectangle(
        (inset, inset, size - inset - 1, size - inset - 1),
        radius=round(size * radius_ratio * 0.9),
        outline=(255, 255, 255, 46),
        width=max(1, round(size * 0.006)),
    )
    card.alpha_composite(edge)

    if radius_ratio > 0:
        alpha = ImageChops.multiply(card.getchannel("A"), rounded_mask(size, radius_ratio))
        card.putalpha(alpha)
    return card


def save(image, name):
    path = os.path.join(OUT, name)
    image.save(path, "PNG", optimize=True)
    print("%s (%dx%d, %d o)" % (os.path.relpath(path, ROOT), image.width, image.height, os.path.getsize(path)))


def main():
    os.makedirs(OUT, exist_ok=True)
    # Icônes d'application : carré arrondi, silhouette débordante.
    # Silhouette centrée dans le cadre, jamais rognée.
    save(compose(512, 0.66, 0.22, False), "icon-512.png")
    save(compose(192, 0.66, 0.22, False), "icon-192.png")
    save(compose(128, 0.68, 0.24, False), "mark-128.png")
    save(compose(32, 0.72, 0.26, False), "favicon-32.png")
    # iOS applique son propre masque : fond plein bord à bord.
    save(compose(180, 0.62, 0.0, False), "apple-touch-icon.png")
    # Maskable : rognage circulaire, la silhouette reste dans la zone sûre.
    save(compose(512, 0.52, 0.0, False), "icon-maskable-512.png")


if __name__ == "__main__":
    main()
