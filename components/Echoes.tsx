"use client";

import { useState } from "react";
import { STEPS } from "@/lib/data";
import { useLocalState } from "@/lib/useLocalState";

/** Les deux façons de demander. Rien de frontal : une phrase, et on attend. */
const ASKS = [
  "J'ai été ébloui par le moment",
  "J'ai entendu ton cœur battre",
] as const;

type Side = "a" | "b";

interface EchoState {
  names: Record<Side, string>;
  notes: Record<Side, Record<string, string>>;
  ask: Record<Side, string | null>;
  open: Record<Side, boolean>;
}

const EMPTY: EchoState = {
  names: { a: "Toi", b: "Moi" },
  notes: { a: {}, b: {} },
  ask: { a: null, b: null },
  open: { a: false, b: false },
};

const other = (side: Side): Side => (side === "a" ? "b" : "a");

/**
 * Les échos : chacun note les activités de son côté, puis demande à lire
 * celles de l'autre — jamais en exigeant, seulement en disant ce qu'il a
 * ressenti.
 */
export default function Echoes() {
  const state = useLocalState<EchoState>("echoes", EMPTY);
  const [side, setSide] = useState<Side>("a");
  const [renaming, setRenaming] = useState<Side | null>(null);

  const { names, notes, ask, open } = state.value;
  const mine = side;
  const theirs = other(side);
  const theirNotes = notes[theirs] ?? {};
  const written = Object.values(notes[mine] ?? {}).filter((text) => text.trim()).length;
  const theirWritten = Object.values(theirNotes).filter((text) => text.trim()).length;

  const setNote = (step: number, text: string) =>
    state.setValue((current) => ({
      ...current,
      notes: { ...current.notes, [mine]: { ...current.notes[mine], [step]: text } },
    }));

  const askFor = (phrase: string) =>
    state.setValue((current) => ({ ...current, ask: { ...current.ask, [mine]: phrase } }));

  const openMine = () =>
    state.setValue((current) => ({ ...current, open: { ...current.open, [mine]: true } }));

  const rename = (value: string) =>
    state.setValue((current) => ({
      ...current,
      names: { ...current.names, [renaming ?? mine]: value.slice(0, 14) || current.names[mine] },
    }));

  return (
    <section className="panel echoes" id="echos" style={{ marginTop: 22 }}>
      <div className="panel__title">
        <span>Les échos</span>
        <span className="panel__hint">chacun de son côté, puis l&apos;échange</span>
      </div>
      <p className="note">
        Notez chaque activité de votre côté, sans regarder l&apos;autre écrire. Pour lire ses notes, il
        faut demander — et la demande ne se fait pas avec « montre-moi ».
      </p>

      {/* Qui tient l'appareil */}
      <div className="switch" role="tablist" aria-label="Qui écrit">
        {(["a", "b"] as Side[]).map((key) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={side === key}
            className={`switch__btn${side === key ? " is-active" : ""}`}
            onClick={() => setSide(key)}
            onDoubleClick={() => setRenaming(key)}
          >
            {names[key]}
          </button>
        ))}
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => setRenaming(renaming ? null : mine)}
          aria-label="Changer le prénom"
        >
          ✎
        </button>
      </div>

      {renaming ? (
        <div className="field" style={{ marginTop: 12 }}>
          <span className="input-wrap">
            <span className="input-wrap__icon" aria-hidden="true">
              ✎
            </span>
            <input
              className="input"
              autoFocus
              defaultValue={names[renaming]}
              placeholder="Prénom"
              onChange={(event) => rename(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && setRenaming(null)}
            />
          </span>
          <button type="button" className="btn" onClick={() => setRenaming(null)}>
            Fermer
          </button>
        </div>
      ) : null}

      {/* Les notes de la personne qui tient l'appareil */}
      <div className="echoes__mine">
        {STEPS.map((step) => (
          <label className="echo-row" key={step.id}>
            <span className="echo-row__step">
              <span className="step__num">{step.id}</span>
              <span className="echo-row__title">{step.title}</span>
            </span>
            <input
              className="input"
              placeholder="Ce que j'en garde…"
              maxLength={140}
              value={notes[mine]?.[step.id] ?? ""}
              onChange={(event) => setNote(step.id, event.target.value)}
            />
          </label>
        ))}
      </div>

      {/* La demande de l'autre, s'il en a posé une */}
      {ask[theirs] && !open[mine] ? (
        <div className="echoes__ask" role="status">
          <p className="quote" style={{ margin: 0 }}>
            {names[theirs]} vous dit&nbsp;: « {ask[theirs]} »
          </p>
          <button type="button" className="btn" onClick={openMine}>
            Lui ouvrir mes notes
          </button>
        </div>
      ) : null}

      {/* Les notes de l'autre : scellées tant qu'il ne les a pas ouvertes */}
      <div className="echoes__theirs">
        <div className="panel__title" style={{ marginBottom: 10 }}>
          <span>Les notes de {names[theirs]}</span>
          <span className="panel__hint">
            {open[theirs] ? `${theirWritten}/${STEPS.length} écrites` : "scellées"}
          </span>
        </div>

        {open[theirs] ? (
          <div className="notes reveal">
            {STEPS.map((step) => {
              const text = (theirNotes[step.id] ?? "").trim();
              return (
                <div className="note-item" key={step.id}>
                  <span className="step__num">{step.id}</span>
                  <span>{text || "— rien d'écrit —"}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="echoes__sealed" aria-hidden="true">
              {STEPS.map((step) => (
                <span className="echoes__blur" key={step.id}>
                  {step.title}
                </span>
              ))}
            </div>
            <p className="note">
              {ask[mine]
                ? `Votre demande est posée : « ${ask[mine]} ». Passez l'appareil, et attendez.`
                : "Pour les lire, dites-lui d'abord ce que vous avez ressenti."}
            </p>
            <div className="echoes__buttons">
              {ASKS.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  className={`ask-btn${ask[mine] === phrase ? " is-active" : ""}`}
                  onClick={() => askFor(phrase)}
                >
                  <span className="ask-btn__mark" aria-hidden="true">
                    {phrase === ASKS[0] ? "✦" : "❤"}
                  </span>
                  {phrase}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {open.a && open.b ? (
        <p className="note" style={{ marginTop: 14, color: "var(--accent)" }}>
          Vous avez échangé. {written + theirWritten} notes lues, aucune arrachée.
        </p>
      ) : null}
    </section>
  );
}
