"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BUDGET,
  BUDGET_TOTAL,
  FINAL_QUESTION,
  STEPS,
  RITUAL_MINUTES,
  TOTAL_MINUTES,
  formatDuration,
  formatFcfa,
} from "@/lib/data";
import { useLocalState } from "@/lib/useLocalState";

interface Chrono {
  startedAt: number | null;
  endedAt: number | null;
}

interface Note {
  id: string;
  text: string;
  at: number;
}

interface JokerLog {
  index: number;
  phrase: string;
  at: number;
}

const JOKERS = 3;
const MAX_WORDS_NOTE = 3;
const MAX_WORDS_JOKER = 10;

function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Ritual() {
  const chrono = useLocalState<Chrono>("chrono", { startedAt: null, endedAt: null });
  const done = useLocalState<number[]>("steps-done", []);
  const jokers = useLocalState<JokerLog[]>("jokers", []);
  const notes = useLocalState<Note[]>("notes", []);

  const [open, setOpen] = useState<number | null>(1);
  const [now, setNow] = useState(() => Date.now());
  const [draft, setDraft] = useState("");
  const [jokerDraft, setJokerDraft] = useState<{ index: number; phrase: string } | null>(null);

  const running = chrono.value.startedAt !== null && chrono.value.endedAt === null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsed = useMemo(() => {
    const { startedAt, endedAt } = chrono.value;
    if (startedAt === null) return 0;
    return (endedAt ?? now) - startedAt;
  }, [chrono.value, now]);

  const progress = Math.min(100, (elapsed / (RITUAL_MINUTES * 60_000)) * 100);
  const noteWords = words(draft);
  const noteTooLong = noteWords.length > MAX_WORDS_NOTE;
  const jokerWords = jokerDraft ? words(jokerDraft.phrase) : [];

  const toggleDone = (id: number) =>
    done.setValue((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  const addNote = () => {
    if (!noteWords.length || noteTooLong) return;
    notes.setValue((current) => [
      { id: `${Date.now()}`, text: noteWords.join(" "), at: Date.now() },
      ...current,
    ]);
    setDraft("");
  };

  const usedJoker = (index: number) => jokers.value.some((joker) => joker.index === index);

  const saveJoker = () => {
    if (!jokerDraft) return;
    const phrase = jokerWords.slice(0, MAX_WORDS_JOKER).join(" ");
    jokers.setValue((current) => [...current, { index: jokerDraft.index, phrase, at: Date.now() }]);
    setJokerDraft(null);
  };

  return (
    <>
      <div className="banner">
        <header className="page-head">
          <span className="page-head__kicker">Rituel — environ {formatDuration(RITUAL_MINUTES)}</span>
          <h1>La journée, geste après geste</h1>
          <span className="page-head__sub">5 étapes · 5 signes · 1 question</span>
          <p>
            La parole mal maîtrisée crée du bruit. Pendant cinq heures, le cerveau désactive ses réponses
            automatiques&nbsp;: on observe, on ressent, on mesure l&apos;impact de chaque geste avant de le
            poser.
          </p>
        </header>
        <div className="banner__meta">
          <span className="tag">{formatDuration(TOTAL_MINUTES)} d&apos;étapes</span>
          <span className="tag">{done.value.length}/{STEPS.length} franchies</span>
          <span className="tag">
            {formatFcfa(BUDGET_TOTAL.min).replace(" FCFA", "")} – {formatFcfa(BUDGET_TOTAL.max)}
          </span>
        </div>
      </div>

      <div className="hero">
        {/* Chronomètre du silence */}
        <section className="panel">
          <div className="panel__title">
            <span>Chronomètre du silence</span>
            <span className="panel__hint">objectif {formatDuration(RITUAL_MINUTES)}</span>
          </div>
          <div className="chrono">
            <div className="chrono__value">{clock(elapsed)}</div>
            <div className="chrono__state">
              {chrono.value.startedAt === null
                ? "Le silence n'a pas commencé"
                : running
                  ? "Silence en cours"
                  : "Silence rompu"}
            </div>
            <div className="progress" style={{ width: "100%" }}>
              <div className="progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="row">
              {!running ? (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setNow(Date.now());
                    chrono.setValue({ startedAt: Date.now(), endedAt: null });
                  }}
                >
                  {chrono.value.startedAt === null ? "Commencer le silence" : "Relancer"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => chrono.setValue((c) => ({ ...c, endedAt: Date.now() }))}
                >
                  Rompre le silence
                </button>
              )}
              {chrono.value.startedAt !== null ? (
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => chrono.setValue({ startedAt: null, endedAt: null })}
                >
                  Réinitialiser
                </button>
              ) : null}
            </div>
            <p className="note" style={{ margin: 0 }}>
              Il démarre à la dernière bouchée du goûter et ne s&apos;arrête qu&apos;à l&apos;étape 5.
            </p>
          </div>
        </section>

        {/* Jokers */}
        <section className="panel">
          <div className="panel__title">
            <span>Jokers Parle</span>
            <span className="panel__hint">
              {JOKERS - jokers.value.length} restant{JOKERS - jokers.value.length > 1 ? "s" : ""}
            </span>
          </div>
          <p className="note">
            Main posée sur le cœur pendant 3 secondes&nbsp;: une seule phrase orale, {MAX_WORDS_JOKER} mots maximum.
            Le dernier joker est réservé à la question du cœur.
          </p>
          <div className="jokers">
            {Array.from({ length: JOKERS }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`joker-dot${usedJoker(index) ? " is-used" : ""}`}
                aria-label={`Joker ${index + 1}${usedJoker(index) ? " (utilisé)" : ""}`}
                onClick={() =>
                  usedJoker(index)
                    ? jokers.setValue((current) => current.filter((joker) => joker.index !== index))
                    : setJokerDraft({ index, phrase: "" })
                }
              >
                🤍
              </button>
            ))}
          </div>

          {jokerDraft ? (
            <div className="field" style={{ marginTop: 14 }}>
              <span className="input-wrap">
                <span className="input-wrap__icon" aria-hidden="true">
                  🤍
                </span>
                <input
                  className="input"
                  autoFocus
                  placeholder="La phrase prononcée…"
                  value={jokerDraft.phrase}
                  onChange={(event) => setJokerDraft({ ...jokerDraft, phrase: event.target.value })}
                  onKeyDown={(event) => event.key === "Enter" && saveJoker()}
                />
              </span>
              <button type="button" className="btn" onClick={saveJoker} disabled={!jokerWords.length}>
                Noter
              </button>
              <span className="counter" aria-live="polite">
                {jokerWords.length}/{MAX_WORDS_JOKER}
              </span>
            </div>
          ) : null}

          {jokers.value.length ? (
            <div className="notes">
              {jokers.value.map((joker) => (
                <div className="note-item" key={joker.at}>
                  <span>« {joker.phrase || "…" } »</span>
                  <time>{new Date(joker.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {/* Déroulement */}
      <section style={{ marginTop: 26 }}>
        <div className="panel__title">
          <h2 style={{ fontSize: "1.05rem" }}>Déroulement</h2>
          <span className="panel__hint">
            {done.value.length}/{STEPS.length} étapes franchies
          </span>
        </div>
        <div className="steps">
          {STEPS.map((step) => {
            const isDone = done.value.includes(step.id);
            const isOpen = open === step.id;
            return (
              <article
                key={step.id}
                className={`step${isDone ? " is-done" : ""}${isOpen ? " is-open" : ""}`}
              >
                <button
                  type="button"
                  className="step__head"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : step.id)}
                >
                  <span className="step__num">{isDone ? "✓" : step.id}</span>
                  <span>
                    <span className="step__title">{step.title}</span>
                    <br />
                    <span className="step__meta">
                      {formatDuration(step.minutes)} · {step.summary}
                    </span>
                  </span>
                  <span className="step__chev" aria-hidden="true">
                    ⌄
                  </span>
                </button>
                {isOpen ? (
                  <div className="step__body">
                    <ul>
                      {step.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                    <div className="row">
                      <button
                        type="button"
                        className={isDone ? "btn btn--ghost" : "btn"}
                        onClick={() => toggleDone(step.id)}
                      >
                        {isDone ? "Rouvrir l'étape" : "Étape franchie"}
                      </button>
                      <Link className="btn btn--quiet" href="/souvenirs/">
                        📸 Capturer un souvenir
                      </Link>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {/* Carnet de poche */}
      <section className="panel" style={{ marginTop: 26 }}>
        <div className="panel__title">
          <span>Carnet de poche</span>
          <span className="panel__hint">3 mots maximum par note</span>
        </div>
        <div className="field">
          <span className="input-wrap">
            <span className="input-wrap__icon" aria-hidden="true">
              ✎
            </span>
            <input
              className="input"
              placeholder="Trois mots, pas un de plus"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addNote()}
              aria-invalid={noteTooLong}
            />
          </span>
          <button type="button" className="btn" onClick={addNote} disabled={!noteWords.length || noteTooLong}>
            Noter
          </button>
          <span className={`counter${noteTooLong ? " is-over" : ""}`} aria-live="polite">
            {noteWords.length}/{MAX_WORDS_NOTE}
          </span>
        </div>
        {noteTooLong ? (
          <p className="note" style={{ color: "var(--accent)", marginTop: 8 }}>
            Trop long. La contrainte fait la valeur de la note.
          </p>
        ) : null}
        {notes.value.length ? (
          <div className="notes">
            {notes.value.map((note) => (
              <div className="note-item" key={note.id}>
                <span>{note.text}</span>
                <time>{new Date(note.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</time>
                <button
                  type="button"
                  className="btn btn--quiet"
                  aria-label={`Supprimer la note ${note.text}`}
                  onClick={() => notes.setValue((current) => current.filter((item) => item.id !== note.id))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="note" style={{ marginTop: 12, marginBottom: 0 }}>
            Aucune note pour l&apos;instant. Observer d&apos;abord, écrire ensuite.
          </p>
        )}
      </section>

      {/* Budget */}
      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel__title">
          <span>Grille budgétaire prévisionnelle</span>
          <span className="panel__hint">FCFA</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Poste</th>
                <th scope="col">Description</th>
                <th scope="col">Budget estimé</th>
              </tr>
            </thead>
            <tbody>
              {BUDGET.map((line) => (
                <tr key={line.post}>
                  <td>{line.post}</td>
                  <td style={{ color: "var(--muted)" }}>{line.description}</td>
                  <td>
                    {line.min.toLocaleString("fr-FR")} – {line.max.toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td style={{ color: "var(--muted)" }}>Expérience complète</td>
                <td>
                  {formatFcfa(BUDGET_TOTAL.min).replace(" FCFA", "")} – {formatFcfa(BUDGET_TOTAL.max)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel__title">
          <span>Question du cœur</span>
          <span className="panel__hint">étape 5</span>
        </div>
        <p className="quote">« {FINAL_QUESTION} »</p>
        <Link className="btn" href="/coeur/">
          ❤️ Ouvrir le canvas
        </Link>
      </section>
    </>
  );
}
