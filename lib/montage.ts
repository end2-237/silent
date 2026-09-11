"use client";

import { FINAL_QUESTION, STEPS } from "./data";
import type { Souvenir } from "./db";

/**
 * Montage récapitulatif : une planche verticale 1080×1920 assemblée dans un
 * canvas, prête à être enregistrée ou partagée à la fin du rituel.
 */

const W = 1080;
const H = 1920;
const SLOTS = 6;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";

async function frameFromVideo(blob: Blob): Promise<CanvasImageSource | null> {
  const url = URL.createObjectURL(blob);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      const fail = () => reject(new Error("vidéo illisible"));
      video.onloadeddata = () => resolve();
      video.onerror = fail;
      window.setTimeout(fail, 6000);
    });
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      video.currentTime = Math.min(0.2, (video.duration || 1) / 2);
      window.setTimeout(resolve, 2000);
    });
    const off = document.createElement("canvas");
    off.width = video.videoWidth || 640;
    off.height = video.videoHeight || 360;
    off.getContext("2d")?.drawImage(video, 0, 0, off.width, off.height);
    return off;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function decode(souvenir: Souvenir): Promise<CanvasImageSource | null> {
  if (souvenir.kind === "video") return frameFromVideo(souvenir.blob);
  try {
    return await createImageBitmap(souvenir.blob);
  } catch {
    return null;
  }
}

function sourceSize(src: CanvasImageSource): { w: number; h: number } {
  const anySrc = src as { width?: number; height?: number; videoWidth?: number; videoHeight?: number };
  return { w: anySrc.width ?? anySrc.videoWidth ?? 1, h: anySrc.height ?? anySrc.videoHeight ?? 1 };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Dessine la source en « cover » dans le rectangle donné. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const { w: sw, h: sh } = sourceSize(src);
  const scale = Math.max(w / sw, h / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.drawImage(src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Une entrée par étape d'abord, puis les suivantes par ordre chronologique. */
function pickSlots(souvenirs: Souvenir[]): Souvenir[] {
  const picked: Souvenir[] = [];
  const used = new Set<string>();
  for (const step of STEPS) {
    const first = souvenirs.find((s) => s.step === step.id && !used.has(s.id));
    if (first) {
      picked.push(first);
      used.add(first.id);
    }
  }
  for (const souvenir of souvenirs) {
    if (picked.length >= SLOTS) break;
    if (!used.has(souvenir.id)) {
      picked.push(souvenir);
      used.add(souvenir.id);
    }
  }
  return picked.slice(0, SLOTS).sort((a, b) => a.step - b.step || a.createdAt - b.createdAt);
}

export interface MontageOptions {
  /** Durée du silence en minutes, affichée en pied de planche. */
  silenceMinutes?: number;
  date?: Date;
}

export async function buildMontage(souvenirs: Souvenir[], options: MontageOptions = {}): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");

  // Fond nuit.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b0e18");
  bg.addColorStop(0.55, "#06070b");
  bg.addColorStop(1, "#120b10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const halo = ctx.createRadialGradient(W / 2, 250, 40, W / 2, 250, 720);
  halo.addColorStop(0, "rgba(233,99,90,0.20)");
  halo.addColorStop(1, "rgba(233,99,90,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, 900);

  // En-tête.
  ctx.textAlign = "center";
  ctx.fillStyle = "#ecece8";
  ctx.font = `600 96px ${SANS}`;
  ctx.letterSpacing = "26px";
  ctx.fillText("SILENT", W / 2 + 13, 180);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "rgba(236,236,232,0.62)";
  ctx.font = `italic 38px ${SERIF}`;
  ctx.fillText("S'aimer au-delà du bruit", W / 2, 240);

  const date = options.date ?? new Date();
  ctx.fillStyle = "rgba(236,236,232,0.38)";
  ctx.font = `26px ${SANS}`;
  ctx.letterSpacing = "6px";
  ctx.fillText(
    date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase(),
    W / 2,
    296,
  );
  ctx.letterSpacing = "0px";

  // Grille 2 × 3.
  const margin = 60;
  const gap = 24;
  const tileW = (W - margin * 2 - gap) / 2;
  const tileH = 430;
  const top = 360;
  const picked = pickSlots(souvenirs);

  for (let i = 0; i < SLOTS; i += 1) {
    const x = margin + (i % 2) * (tileW + gap);
    const y = top + Math.floor(i / 2) * (tileH + gap);
    const souvenir = picked[i];

    ctx.save();
    roundRect(ctx, x, y, tileW, tileH, 28);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(x, y, tileW, tileH);

    if (souvenir) {
      const src = await decode(souvenir);
      if (src) drawCover(ctx, src, x, y, tileW, tileH);
      const shade = ctx.createLinearGradient(0, y + tileH - 190, 0, y + tileH);
      shade.addColorStop(0, "rgba(6,7,11,0)");
      shade.addColorStop(1, "rgba(6,7,11,0.92)");
      ctx.fillStyle = shade;
      ctx.fillRect(x, y + tileH - 190, tileW, 190);

      const step = STEPS.find((s) => s.id === souvenir.step);
      ctx.textAlign = "left";
      ctx.fillStyle = "#e9635a";
      ctx.font = `600 22px ${SANS}`;
      ctx.letterSpacing = "4px";
      ctx.fillText(step ? `ÉTAPE ${step.id}` : "EMPREINTE", x + 26, y + tileH - 76);
      ctx.letterSpacing = "0px";
      ctx.fillStyle = "#ecece8";
      ctx.font = `500 30px ${SANS}`;
      const title = souvenir.caption || step?.title || "Instant";
      ctx.fillText(wrap(ctx, title, tileW - 52)[0] ?? title, x + 26, y + tileH - 34);
    } else {
      // Emplacement resté vide : on garde la trace de l'étape manquante.
      ctx.setLineDash([10, 12]);
      ctx.strokeStyle = "rgba(236,236,232,0.16)";
      ctx.lineWidth = 2;
      roundRect(ctx, x + 10, y + 10, tileW - 20, tileH - 20, 22);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(236,236,232,0.30)";
      ctx.font = `italic 28px ${SERIF}`;
      ctx.fillText("sans image", x + tileW / 2, y + tileH / 2 + 10);
    }
    ctx.restore();
  }

  // Pied de planche : la question du cœur.
  const footerTop = top + 3 * (tileH + gap) + 22;
  ctx.textAlign = "center";
  ctx.strokeStyle = "rgba(236,236,232,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, footerTop);
  ctx.lineTo(W - margin, footerTop);
  ctx.stroke();

  ctx.fillStyle = "rgba(236,236,232,0.80)";
  ctx.font = `italic 32px ${SERIF}`;
  const lines = wrap(ctx, `« ${FINAL_QUESTION} »`, W - margin * 2 - 40).slice(0, 5);
  lines.forEach((line, index) => ctx.fillText(line, W / 2, footerTop + 62 + index * 46));

  if (options.silenceMinutes && options.silenceMinutes > 0) {
    const h = Math.floor(options.silenceMinutes / 60);
    const m = options.silenceMinutes % 60;
    ctx.fillStyle = "rgba(236,236,232,0.40)";
    ctx.font = `24px ${SANS}`;
    ctx.letterSpacing = "4px";
    ctx.fillText(`SILENCE TENU ${h} H ${String(m).padStart(2, "0")}`.toUpperCase(), W / 2, H - 54);
    ctx.letterSpacing = "0px";
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export impossible"))),
      "image/jpeg",
      0.92,
    );
  });
}
