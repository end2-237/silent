"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Echoes from "./Echoes";
import { FINAL_QUESTION } from "@/lib/data";
import { addSouvenir, newId } from "@/lib/db";
import { useLocalState } from "@/lib/useLocalState";

const HOLD_MS = 3000;
const GLOW = "255, 90, 46";

interface Point {
  x: number;
  y: number;
}

/**
 * Canvas de l'étape 5 : les deux mains se posent en même temps sur l'écran.
 * Trois secondes de contact simultané déclenchent la vibration, enregistrent
 * l'empreinte et révèlent la question du cœur.
 */
export default function HeartCanvas() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointers = useRef<Map<number, Point>>(new Map());
  const holdStart = useRef<number | null>(null);
  const saving = useRef(false);

  const [progress, setProgress] = useState(0);
  const [contacts, setContacts] = useState(0);
  const [saved, setSaved] = useState(false);
  const unlocked = useLocalState<boolean>("heart-unlocked", false);

  /** Deux contacts sur écran tactile, un seul à la souris (usage bureau). */
  const required = useCallback(
    () => (window.matchMedia("(pointer: coarse)").matches ? 2 : 1),
    [],
  );

  const complete = useCallback(async () => {
    if (saving.current) return;
    saving.current = true;
    if ("vibrate" in navigator) navigator.vibrate([120, 80, 120, 80, 260]);
    unlocked.setValue(true);

    const node = canvas.current;
    if (node) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => node.toBlob(resolve, "image/jpeg", 0.9));
        if (blob) {
          await addSouvenir({
            id: newId(),
            step: 0,
            kind: "image",
            mime: "image/jpeg",
            blob,
            caption: "Empreinte du cœur",
            createdAt: Date.now(),
          });
          setSaved(true);
        }
      } catch {
        /* l'empreinte est un bonus : on n'interrompt pas le rituel */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boucle de rendu : traînées persistantes + halo sous chaque doigt.
  useEffect(() => {
    const node = canvas.current;
    const box = stage.current;
    if (!node || !box) return;
    const ctx = node.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let lastPercent = -1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = box.getBoundingClientRect();
      node.width = Math.round(rect.width * dpr);
      node.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);

    const draw = () => {
      const rect = box.getBoundingClientRect();
      // Estompe la traînée en retirant de l'alpha : le canvas reste
      // transparent et laisse voir le halo du fond.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.035)";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = "source-over";

      const active = pointers.current;
      const enough = active.size >= required();

      if (enough) {
        if (holdStart.current === null) holdStart.current = performance.now();
      } else {
        holdStart.current = null;
      }

      const held = holdStart.current === null ? 0 : performance.now() - holdStart.current;
      const ratio = Math.min(1, held / HOLD_MS);
      const percent = Math.round(ratio * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        setProgress(ratio);
      }

      const pulse = 1 + Math.sin(performance.now() / 260) * 0.08;
      active.forEach((point) => {
        const radius = (34 + ratio * 46) * pulse;
        const glow = ctx.createRadialGradient(point.x, point.y, 2, point.x, point.y, radius);
        glow.addColorStop(0, `rgba(${GLOW}, ${0.5 + ratio * 0.45})`);
        glow.addColorStop(0.55, `rgba(${GLOW}, ${0.14 + ratio * 0.2})`);
        glow.addColorStop(1, `rgba(${GLOW}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Fil tendu entre les deux mains.
      if (active.size >= 2) {
        const [a, b] = Array.from(active.values());
        ctx.strokeStyle = `rgba(${GLOW}, ${0.16 + ratio * 0.34})`;
        ctx.lineWidth = 1 + ratio * 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      if (ratio >= 1) {
        holdStart.current = null;
        void complete();
      }

      raf = window.requestAnimationFrame(draw);
    };
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [complete, required]);

  const position = (event: React.PointerEvent): Point => {
    const rect = stage.current?.getBoundingClientRect();
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
  };

  const onDown = (event: React.PointerEvent) => {
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, position(event));
    setContacts(pointers.current.size);
  };

  const onMove = (event: React.PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, position(event));
  };

  const onUp = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    setContacts(pointers.current.size);
    saving.current = false;
  };

  const circumference = 2 * Math.PI * 15;

  return (
    <>
      <header className="page-head">
        <span className="page-head__kicker">Module 3 — Cœur / Canvas</span>
        <h1>L&apos;empreinte et la question</h1>
        <p>
          Posez vos deux mains sur l&apos;écran, en même temps, pendant trois secondes. À la fin du compte,
          l&apos;empreinte est gardée et la question du cœur apparaît.
        </p>
      </header>

      <div
        className="canvas-stage"
        ref={stage}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        role="application"
        aria-label="Zone tactile de l'empreinte du cœur"
      >
        <canvas ref={canvas} />
        {contacts === 0 && !unlocked.value ? (
          <div className="canvas-stage__guides" aria-hidden="true">
            <span />
            <span />
          </div>
        ) : null}
        <svg className="canvas-stage__ring" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(58,34,24,0.18)" strokeWidth="2.5" />
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke={`rgb(${GLOW})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform="rotate(-90 20 20)"
          />
        </svg>
        <p className="canvas-stage__hint">
          {progress >= 1 || (unlocked.value && contacts === 0)
            ? "Empreinte gardée."
            : contacts === 0
              ? "Posez vos mains, ensemble."
              : progress > 0
                ? `Ne bougez plus… ${Math.ceil((1 - progress) * 3)} s`
                : "Il manque une main."}
        </p>
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            const node = canvas.current;
            const ctx = node?.getContext("2d");
            if (node && ctx) ctx.clearRect(0, 0, node.width, node.height);
            setProgress(0);
            saving.current = false;
            setSaved(false);
          }}
        >
          Effacer la trace
        </button>
        {unlocked.value ? (
          <button type="button" className="btn btn--quiet" onClick={() => unlocked.setValue(false)}>
            Refermer la question
          </button>
        ) : null}
        {saved ? <span className="tag tag--accent">Empreinte ajoutée aux souvenirs</span> : null}
      </div>

      <Echoes />

      {unlocked.value ? (
        <section className="reveal" style={{ marginTop: 22 }}>
          <span className="page-head__kicker">Le dernier joker</span>
          <p className="quote" style={{ marginTop: 10 }}>
            « {FINAL_QUESTION} »
          </p>
          <p className="note" style={{ marginBottom: 0 }}>
            Le silence ne se rompt que pour cette question. Écoutez la réponse sans rien ajouter.
          </p>
        </section>
      ) : (
        <p className="note" style={{ marginTop: 18 }}>
          La question reste scellée tant que l&apos;empreinte n&apos;est pas complète. Sur ordinateur, un seul
          contact suffit&nbsp;: maintenez le clic trois secondes.
        </p>
      )}
    </>
  );
}
