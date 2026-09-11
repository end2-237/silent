"use client";

import { useState } from "react";
import Card3D from "./Card3D";
import CardBack from "./CardBack";
import HandSign from "./HandSign";
import { SIGNS, SPECIAL_RULES, type Sign } from "@/lib/data";

/** Deux couleurs de dos, comme deux jeux posés côte à côte. */
function backColor(id: number): string {
  return id % 2 === 1 ? "var(--ember)" : "var(--indigo)";
}

function Corner({ sign, flip }: { sign: Sign; flip?: boolean }) {
  return (
    <span className={`pip${flip ? " pip--flip" : ""}`} aria-hidden="true">
      <span className="pip__num">{sign.id}</span>
      <HandSign className="pip__hand" fingers={sign.fingers} spread={sign.spread} title="" />
    </span>
  );
}

function Front({ sign }: { sign: Sign }) {
  return (
    <>
      <Corner sign={sign} />
      <HandSign className="cardface__hand" fingers={sign.fingers} spread={sign.spread} title={sign.label} />
      <span className="cardface__label">{sign.label}</span>
      <span className="cardface__gesture">{sign.gesture}</span>
      <span className="cardface__flip">toucher pour retourner ↻</span>
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
  const [selected, setSelected] = useState<number>(SIGNS[0].id);
  const [flipped, setFlipped] = useState(false);
  const sign = SIGNS.find((item) => item.id === selected) ?? SIGNS[0];

  const select = (id: number) => {
    if (id === selected) {
      setFlipped((current) => !current);
      return;
    }
    setSelected(id);
    setFlipped(false);
  };

  return (
    <>
      <header className="page-head">
        <span className="page-head__kicker">Module 1 — Cartes</span>
        <h1>Le guide des signes</h1>
        <p>
          Cinq signes, cinq intentions. Le recto montre le geste, le verso donne l&apos;action. Touchez une
          carte pour la retourner&nbsp;: c&apos;est tout le vocabulaire de la journée.
        </p>
      </header>

      <div className="cards-layout">
        {/* La couleur du dos suit la parité de la carte, comme deux jeux mêlés. */}
        <div style={{ color: backColor(sign.id) }}>
          <Card3D
            size="hero"
            className="card3d--paper"
            label={sign.label}
            flipped={flipped}
            onFlip={setFlipped}
            front={<Front sign={sign} />}
            back={<Back sign={sign} />}
          />
        </div>

        <div className="cards-side">
          <div className="row">
            <span className="tag tag--ember">{sign.meaning}</span>
            <span className="tag">{sign.purpose}</span>
          </div>

          {/* Les cinq miniatures : dos ornementé tant que la carte dort. */}
          <div className="minis">
            {SIGNS.map((item) => {
              const isSelected = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mini${isSelected ? " is-selected" : ""}`}
                  style={{ color: backColor(item.id) }}
                  onClick={() => select(item.id)}
                  aria-pressed={isSelected}
                  aria-label={`${item.label} — ${item.meaning}`}
                >
                  {isSelected ? (
                    <span className="mini__face">
                      <HandSign
                        className="mini__hand"
                        fingers={item.fingers}
                        spread={item.spread}
                        title=""
                      />
                      <span className="mini__num">{item.id}</span>
                    </span>
                  ) : (
                    <CardBack className="mini__back" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="note" style={{ margin: 0 }}>
            Sélectionnez une miniature pour l&apos;afficher en grand ; touchez-la à nouveau pour la retourner.
          </p>
        </div>
      </div>

      <section style={{ marginTop: 30 }}>
        <div className="panel__title">
          <h2 style={{ fontSize: "1.05rem" }}>Règles spéciales</h2>
          <span className="panel__hint">hors des cinq signes</span>
        </div>
        <div className="rules">
          {SPECIAL_RULES.map((rule) => (
            <div className="rule" key={rule.id}>
              <span className="rule__icon" aria-hidden="true">
                {rule.icon}
              </span>
              <div>
                <div className="rule__label">{rule.label}</div>
                <div className="rule__text">{rule.rule}</div>
                <div className="rule__text" style={{ color: "var(--ember)" }}>
                  {rule.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
