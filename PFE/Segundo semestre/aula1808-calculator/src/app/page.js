"use client";

import { useState } from "react";
import styles from "./page.module.css";

const formatDisplay = (value) =>
  (value || "0")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/\^/g, "^");

function sanitizeExpression(expression) {
  if (!expression) return null;

  const normalized = expression
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  if (!/^[0-9+\-*/.^()\s√]+$/.test(normalized)) {
    return null;
  }

  if (/[+\-*/^]$/.test(normalized) || /[+\-*/^]{2,}/.test(normalized)) {
    return null;
  }

  if (/\d√/.test(normalized) || /\)\d/.test(normalized)) {
    return null;
  }

  let jsExpression = normalized.replace(/\^/g, "**");
  const rootMatches = [...jsExpression.matchAll(/√\s*([0-9]+(?:\.[0-9]+)?)/g)];

  if (rootMatches.length > 0) {
    jsExpression = jsExpression.replace(/√\s*([0-9]+(?:\.[0-9]+)?)/g, "Math.sqrt($1)");
  }

  if (jsExpression.includes("√")) {
    return null;
  }

  return jsExpression;
}

function calculateExpression(expression) {
  if (!expression) return "0";

  const sanitized = sanitizeExpression(expression);

  if (!sanitized) {
    return "Erro";
  }

  try {
    const result = Function(`"use strict"; return (${sanitized});`)();

    if (!Number.isFinite(result)) {
      return "Erro";
    }

    return Number.isInteger(result)
      ? String(result)
      : String(Number(result.toFixed(10)));
  } catch {
    return "Erro";
  }
}

export default function Home() {
  const [expression, setExpression] = useState("");

  const handleNumber = (value) => {
    if (value === ".") {
      const currentGroup = expression.split(/[+\-*/^√]/).at(-1);
      if (currentGroup.includes(".")) return;

      const next = expression === "" ? "0." : `${expression}.`;
      setExpression(next);
      return;
    }

    const next = expression === "0" ? value : `${expression}${value}`;
    setExpression(next);
  };

  const handleOperator = (operator) => {
    if (!expression) return;

    const lastChar = expression.slice(-1);
    const nextExpression = /[+\-*/^]/.test(lastChar)
      ? `${expression.slice(0, -1)}${operator}`
      : `${expression}${operator}`;

    setExpression(nextExpression);
  };

  const handleRoot = () => {
    const nextExpression = `${expression || ""}√`;
    setExpression(nextExpression);
  };

  const handleClear = () => setExpression("");

  const handleDelete = () => setExpression((current) => current.slice(0, -1));

  const handleEquals = () => {
    const result = calculateExpression(expression);
    setExpression(result);
  };

  const buttons = [
    ["C", "⌫", "√", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", "^", ".", "="],
  ];

  return (
    <main className={styles.page}>
      <section className={styles.calculator} aria-label="Calculadora">
        <div className={styles.display}>
          {formatDisplay(expression || "0")}
        </div>

        <div className={styles.buttons}>
          {buttons.flat().map((button) => {
            const isOperatorButton = ["÷", "×", "-", "+", "^"] .includes(button);
            const isEqualButton = button === "=";
            const isClearButton = button === "C";
            const isDeleteButton = button === "⌫";
            const isZeroButton = button === "0";
            const isDotButton = button === ".";

            return (
              <button
                key={button}
                type="button"
                className={[
                  styles.button,
                  isOperatorButton ? styles.operator : "",
                  isEqualButton ? styles.equal : "",
                  isClearButton ? styles.clear : "",
                  isDeleteButton ? styles.deleteButton : "",
                  isZeroButton ? styles.zero : "",
                  isDotButton ? styles.dot : "",
                ].join(" ")}
                onClick={() => {
                  if (button === "C") return handleClear();
                  if (button === "⌫") return handleDelete();
                  if (button === "=") return handleEquals();
                  if (button === "√") return handleRoot();
                  if (["÷", "×", "-", "+", "^"] .includes(button)) {
                    return handleOperator(
                      button === "÷" ? "/" : button === "×" ? "*" : button
                    );
                  }
                  return handleNumber(button);
                }}
              >
                {button}
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
