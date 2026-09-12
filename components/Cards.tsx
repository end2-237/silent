"use client";

import { useState } from "react";
import { useLocalState } from "@/lib/useLocalState";
import Card3D from "./Card3D";
import CardBack from "./CardBack";
import HandSign from "./HandSign";
import { SIGNS, SPECIAL_RULES, type Sign } from "@/lib/data";

/** Deux couleurs de dos, comme deux jeux posés côte à côte. */
function backColor(sign: { id: number; safety?: boolean }): string {
  if (sign.safety) return "var(--accent)";
  return sign.id % 2 === 1 ? "var(--accent)" : "var(--indigo)";
}

function Corner({ sign, flip }: { sign: Sign; flip?: boolean }) {
  return (
    <span className={`pip${flip ? " pip--flip" : ""}`} aria-hidden="true">
      {sign.safety ? "✋" : sign.id}
    </span>
  );
}

function Front({ sign, hint }: { sign: Sign; hint: boolean }) {
  return (
    <>
      <Corner sign={sign} />
      <HandSign className="cardface__hand" id={sign.id} label={sign.label} />
      <span className="cardface__label">{sign.label}</span>
      <span className="cardface__gesture">{sign.gesture}</span>
      {hint ? <span className="cardface__flip">toucher pour retourner ↻</span> : null}
      <Corner sign={sign} flip />
    </>
  );
}

/** Verso : le dos ornementé, avec l'action dans un cartouche. */
function Back({ sign }: { sign: Sign }) {
  return (
    <>
      <CardBack className="cardface__pattern" />
      <span className="cartouche">
        <span className="cartouche__num">Action</span>
        <span className="cartouche__meaning">« {sign.meaning} »</span>
        <span className="cartouche__purpose">{sign.purpose}</span>
      </span>
    </>
  );
}

export default function Cards() {
  const [selected, setSelected] = useState<number>(SIGNS[1].id);
  const [flipped, setFlipped] = useState(false);
  /** L'indice de retournement disparaît une fois le geste compris. */
  const learned = useLocalState<boolean>("cards-flipped", false);
  const sign = SIGNS.find((item) => item.id === selected) ?? SIGNS[0];

  const flip = (next: boolean) => {
    setFlipped(next);
    if (next && !learned.value) learned.setValue(true);
  };

  const select = (id: number) => {
    if (id === selected) {
      flip(!flipped);
      return;
    }
    setSelected(id);
    setFlipped(false);
  };

  return (
    <>
      <header className="page-head">
        <h1>Le guide des signes</h1>
        <span className="page-head__sub">huit signes, tout le vocabulaire</span>
      </header>

      <div className="cards-layout">
        {/* La couleur du dos suit la parité de la carte, comme deux jeux mêlés. */}
        <div className="hero-glow" style={{ color: backColor(sign) }}>
          <Card3D
            size="hero"
            className={`card3d--paper${sign.safety ? " is-safety" : ""}`}
            label={sign.label}
            flipped={flipped}
            onFlip={flip}
            front={<Front sign={sign} hint={!learned.value} />}
            back={<Back sign={sign} />}
          />
        </div>

        <div className="cards-side">
          <p className="cards-side__meaning">« {sign.meaning} »</p>

          {/* Les cinq miniatures : dos ornementé tant que la carte dort. */}
          <div className="minis">
            {SIGNS.map((item) => {
              const isSelected = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mini${isSelected ? " is-selected" : ""}${item.safety ? " is-safety" : ""}`}
                  style={{ color: backColor(item) }}
                  onClick={() => select(item.id)}
                  aria-pressed={isSelected}
                  aria-label={`${item.label} — ${item.meaning}`}
                >
                  {isSelected ? (
                    <span className="mini__face">
                      <HandSign className="mini__hand" id={item.id} />
                      <span className="mini__num">{item.id}</span>
                    </span>
                  ) : (
                    <CardBack className="mini__back" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      <section className="section">
        <div className="panel__title">
          <h2 className="section__title">Règles spéciales</h2>
          <span className="panel__hint">au-delà des signes</span>
        </div>
        <div className="rules">
          {SPECIAL_RULES.map((rule) => (
            <div className="rule" key={rule.id}>
              <div className="rule__label">{rule.label}</div>
              <div className="rule__text">{rule.rule}</div>
              <div className="rule__text rule__text--accent">{rule.detail}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
