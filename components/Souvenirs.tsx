"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STEPS } from "@/lib/data";
import {
  addSouvenir,
  clearSouvenirs,
  deleteSouvenir,
  listSouvenirs,
  newId,
  type Souvenir,
} from "@/lib/db";
import { buildMontage } from "@/lib/montage";

const MAX_BYTES = 60 * 1024 * 1024;

/** Un souvenir accompagné de l'URL d'objet qui l'affiche. */
type Item = Souvenir & { url: string };

interface Chrono {
  startedAt: number | null;
  endedAt: number | null;
}

function readChrono(): Chrono {
  try {
    const raw = window.localStorage.getItem("silent:chrono");
    return raw ? (JSON.parse(raw) as Chrono) : { startedAt: null, endedAt: null };
  } catch {
    return { startedAt: null, endedAt: null };
  }
}

function StepCapture({
  step,
  title,
  subtitle,
  items,
  onAdd,
  onDelete,
}: {
  step: number;
  title: string;
  subtitle: string;
  items: Item[];
  onAdd: (step: number, files: FileList | null) => void;
  onDelete: (id: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <section className="capture">
      <div className="capture__head">
        <span className="step__num">{step === 0 ? "❤" : step}</span>
        <div>
          <div className="capture__title">{title}</div>
          <div className="capture__sub">{subtitle}</div>
        </div>
        <span className="capture__count">
          {items.length} souvenir{items.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="thumbs">
        {items.map((item) => (
          <figure className="thumb" key={item.id} style={{ margin: 0 }}>
            {item.kind === "video" ? (
              <video src={item.url} muted playsInline preload="metadata" />
            ) : (
              // Blob local : next/image ne sait pas optimiser une URL d'objet.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.caption || title} />
            )}
            <span className="thumb__badge">
              {new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <button
              type="button"
              className="thumb__del"
              aria-label="Supprimer ce souvenir"
              onClick={() => onDelete(item.id)}
            >
              ✕
            </button>
          </figure>
        ))}

        {step > 0 ? (
          <>
            <button
              type="button"
              className={`dropzone${over ? " is-over" : ""}`}
              onClick={() => input.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(true);
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setOver(false);
                onAdd(step, event.dataTransfer.files);
              }}
            >
              <span className="dropzone__plus" aria-hidden="true">
                ＋
              </span>
              Photo ou vidéo
            </button>
            <input
              ref={input}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              multiple
              hidden
              onChange={(event) => {
                onAdd(step, event.target.files);
                event.target.value = "";
              }}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}

export default function Souvenirs() {
  const [items, setItems] = useState<Item[]>([]);
  const [montage, setMontage] = useState<{ url: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** URL d'objet vivante pour chaque souvenir, révoquée dès qu'il disparaît. */
  const urls = useRef<Map<string, string>>(new Map());

  const refresh = useCallback(async () => {
    let stored: Souvenir[];
    try {
      stored = await listSouvenirs();
    } catch {
      setError("Le stockage local est indisponible sur cet appareil (mode privé ?).");
      return;
    }
    const live = urls.current;
    const next = new Map<string, string>();
    const decorated = stored.map((item) => {
      const url = live.get(item.id) ?? URL.createObjectURL(item.blob);
      next.set(item.id, url);
      return { ...item, url };
    });
    live.forEach((url, id) => {
      if (!next.has(id)) URL.revokeObjectURL(url);
    });
    urls.current = next;
    setItems(decorated);
  }, []);

  useEffect(() => {
    // Première lecture d'IndexedDB : l'état ne peut arriver qu'après montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const live = urls.current;
    return () => live.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const add = useCallback(
    async (step: number, files: FileList | null) => {
      if (!files?.length) return;
      setError(null);
      for (const file of Array.from(files)) {
        if (file.size > MAX_BYTES) {
          setError(`« ${file.name} » dépasse 60 Mo : gardez des vidéos courtes.`);
          continue;
        }
        const kind: Souvenir["kind"] = file.type.startsWith("video") ? "video" : "image";
        try {
          await addSouvenir({
            id: newId(),
            step,
            kind,
            mime: file.type || (kind === "video" ? "video/mp4" : "image/jpeg"),
            blob: file,
            caption: STEPS.find((s) => s.id === step)?.title ?? "",
            createdAt: Date.now(),
          });
        } catch {
          setError("Enregistrement impossible : stockage plein ou indisponible.");
        }
      }
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteSouvenir(id);
      await refresh();
    },
    [refresh],
  );

  const exportMontage = async () => {
    setBusy(true);
    setError(null);
    try {
      const { startedAt, endedAt } = readChrono();
      const silenceMinutes =
        startedAt === null ? 0 : Math.round(((endedAt ?? Date.now()) - startedAt) / 60_000);
      const blob = await buildMontage(items, { silenceMinutes });
      setMontage((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return { blob, url: URL.createObjectURL(blob) };
      });
    } catch {
      setError("Le montage n'a pas pu être généré.");
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!montage) return;
    const link = document.createElement("a");
    link.href = montage.url;
    link.download = `silent-${new Date().toISOString().slice(0, 10)}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const share = async () => {
    if (!montage) return;
    const file = new File([montage.blob], "silent.jpg", { type: "image/jpeg" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "SILENT" });
      } catch {
        /* partage annulé par la personne */
      }
    } else {
      download();
    }
  };

  const imprints = items.filter((item) => item.step === 0);

  return (
    <>
      <header className="page-head">
        <span className="page-head__kicker">Module 2 — Souvenirs</span>
        <h1>Une trace par étape</h1>
        <p>
          Une photo ou une vidéo courte par étape, rien de plus. Tout reste sur l&apos;appareil&nbsp;: aucune
          image n&apos;est envoyée sur un serveur. À la fin, SILENT assemble le montage récapitulatif.
        </p>
      </header>

      {error ? (
        <p className="note" style={{ color: "var(--ember)" }} role="alert">
          {error}
        </p>
      ) : null}

      <div className="souvenirs">
        {STEPS.map((step) => (
          <StepCapture
            key={step.id}
            step={step.id}
            title={step.title}
            subtitle={step.summary}
            items={items.filter((item) => item.step === step.id)}
            onAdd={add}
            onDelete={remove}
          />
        ))}

        {imprints.length ? (
          <StepCapture
            step={0}
            title="Empreintes du cœur"
            subtitle="Enregistrées depuis le canvas de l'étape 5."
            items={imprints}
            onAdd={add}
            onDelete={remove}
          />
        ) : null}
      </div>

      <section className="panel" style={{ marginTop: 22 }}>
        <div className="panel__title">
          <span>Montage récapitulatif</span>
          <span className="panel__hint">planche 1080 × 1920</span>
        </div>
        <div className="row">
          <button type="button" className="btn" onClick={exportMontage} disabled={busy || !items.length}>
            {busy ? "Assemblage…" : "Générer le montage"}
          </button>
          {montage ? (
            <>
              <button type="button" className="btn btn--ghost" onClick={download}>
                Enregistrer
              </button>
              <button type="button" className="btn btn--ghost" onClick={share}>
                Partager
              </button>
            </>
          ) : null}
          {items.length ? (
            <button
              type="button"
              className="btn btn--quiet"
              onClick={async () => {
                if (!window.confirm("Effacer tous les souvenirs de cet appareil ?")) return;
                await clearSouvenirs();
                await refresh();
              }}
            >
              Tout effacer
            </button>
          ) : null}
        </div>
        {!items.length ? (
          <p className="note" style={{ marginTop: 12, marginBottom: 0 }}>
            Ajoutez au moins un souvenir pour générer la planche.
          </p>
        ) : null}
        {montage ? (
          // Aperçu d'un JPEG assemblé en mémoire : pas d'optimisation possible.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="export-preview"
            src={montage.url}
            alt="Aperçu du montage récapitulatif"
            style={{ marginTop: 16 }}
          />
        ) : null}
      </section>
    </>
  );
}
