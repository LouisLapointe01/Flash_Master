// Éléments décoratifs ambiants — direction artistique capibara
// Ces composants se placent librement sur les pages pour ajouter de la vie

type AmbientProps = { className?: string; style?: React.CSSProperties };

// ── Empreinte de patte ──────────────────────────────────────────────────────
export function CapyPaw({ className, style }: AmbientProps) {
  return (
    <svg viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Paume */}
      <ellipse cx="16" cy="18" rx="9" ry="7" fill="#8B6640" opacity="0.22" />
      {/* Orteils */}
      <circle cx="8"  cy="11" r="3.5" fill="#8B6640" opacity="0.18" />
      <circle cx="13" cy="8"  r="3.8" fill="#8B6640" opacity="0.2"  />
      <circle cx="19" cy="8"  r="3.8" fill="#8B6640" opacity="0.2"  />
      <circle cx="24" cy="11" r="3.5" fill="#8B6640" opacity="0.18" />
    </svg>
  );
}

// ── Petite feuille simple ───────────────────────────────────────────────────
export function TinyLeaf({ className, style }: AmbientProps) {
  return (
    <svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M12 30 Q2 20 4 10 Q8 2 12 4 Q16 2 20 10 Q22 20 12 30Z" fill="#7aab72" opacity="0.55" />
      <line x1="12" y1="30" x2="12" y2="8" stroke="#5a8a54" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Grappe de feuilles ──────────────────────────────────────────────────────
export function LeafCluster({ className, style }: AmbientProps) {
  return (
    <svg viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Tige centrale */}
      <line x1="32" y1="72" x2="32" y2="18" stroke="#5a8a54" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Feuilles */}
      <path d="M32 42 Q12 36 10 20 Q16 12 32 22Z" fill="#7aab72" opacity="0.6" />
      <path d="M32 42 Q52 36 54 20 Q48 12 32 22Z" fill="#7aab72" opacity="0.55" />
      <path d="M32 26 Q14 18 14 6 Q20 0 32 12Z"  fill="#b3d4ad" opacity="0.6" />
      <path d="M32 26 Q50 18 50 6 Q44 0 32 12Z"  fill="#b3d4ad" opacity="0.55" />
      {/* Bouton sommital */}
      <circle cx="32" cy="16" r="4" fill="#7aab72" opacity="0.6" />
    </svg>
  );
}

// ── Petite fleur ────────────────────────────────────────────────────────────
export function TinyFlower({ className, style, color = "#dba54a" }: AmbientProps & { color?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <ellipse
          key={i}
          cx="14" cy="7" rx="4" ry="6"
          fill={color} opacity="0.55"
          transform={`rotate(${deg} 14 14)`}
        />
      ))}
      <circle cx="14" cy="14" r="5" fill={color} opacity="0.85" />
      <circle cx="14" cy="14" r="2.5" fill="#fff8ef" opacity="0.8" />
    </svg>
  );
}

// ── Étoile scintillante ─────────────────────────────────────────────────────
export function Twinkle({ className, style, color = "#dba54a" }: AmbientProps & { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path d="M12 2 L13.2 10 L20 12 L13.2 14 L12 22 L10.8 14 L4 12 L10.8 10 Z" fill={color} opacity="0.8" />
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.6" />
    </svg>
  );
}

// ── Bulle de pensée ─────────────────────────────────────────────────────────
export function ThinkBubble({ className, style, children }: AmbientProps & { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Bulle principale */}
      <rect x="2" y="2" width="56" height="38" rx="16" fill="white" opacity="0.88" stroke="#e8dcc8" strokeWidth="1.5"/>
      {/* Petites bulles de queue */}
      <circle cx="20" cy="44" r="4.5" fill="white" opacity="0.7" stroke="#e8dcc8" strokeWidth="1"/>
      <circle cx="13" cy="50" r="2.5" fill="white" opacity="0.6" stroke="#e8dcc8" strokeWidth="0.8"/>
      {/* Points de réflexion */}
      <circle cx="22" cy="21" r="3.5" fill="#c8b898" opacity="0.5" />
      <circle cx="32" cy="21" r="3.5" fill="#c8b898" opacity="0.5" />
      <circle cx="42" cy="21" r="3.5" fill="#c8b898" opacity="0.5" />
    </svg>
  );
}

// ── Mini capybara doodle (tout petit, pour parsemer les pages) ───────────────
export function MiniCapi({ className, style }: AmbientProps) {
  return (
    <svg viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Corps */}
      <ellipse cx="26" cy="24" rx="16" ry="12" fill="#8B6640" opacity="0.3" />
      {/* Tête */}
      <ellipse cx="14" cy="18" rx="11" ry="9"  fill="#8B6640" opacity="0.32" />
      {/* Oreilles */}
      <ellipse cx="8"  cy="12" rx="4.5" ry="3.5" fill="#8B6640" opacity="0.28" />
      <ellipse cx="18" cy="11" rx="4"   ry="3.2" fill="#8B6640" opacity="0.28" />
      {/* Museau rectangulaire */}
      <rect x="8" y="19" width="10" height="6" rx="3" fill="#6B4820" opacity="0.25" />
      {/* Œil */}
      <circle cx="11" cy="16" r="2" fill="#3A2010" opacity="0.35" />
      <circle cx="11.5" cy="15.5" r="0.6" fill="white" opacity="0.5" />
      {/* Pattes */}
      <ellipse cx="16" cy="34" rx="5" ry="3" fill="#5C3E20" opacity="0.22" />
      <ellipse cx="32" cy="34" rx="5" ry="3" fill="#5C3E20" opacity="0.22" />
      <ellipse cx="38" cy="34" rx="5" ry="3" fill="#5C3E20" opacity="0.22" />
    </svg>
  );
}

// ── Bande décorative de confettis ──────────────────────────────────────────
export function ConfettiBand({ className, style }: AmbientProps) {
  const dots = [
    { cx: 8,   cy: 12, r: 3,   fill: "#dba54a", rot: 0   },
    { cx: 22,  cy: 6,  r: 2.5, fill: "#3fa8d0", rot: 15  },
    { cx: 36,  cy: 14, r: 3,   fill: "#7aab72", rot: -10 },
    { cx: 50,  cy: 4,  r: 2.5, fill: "#dba54a", rot: 20  },
    { cx: 64,  cy: 12, r: 3,   fill: "#3fa8d0", rot: -5  },
    { cx: 78,  cy: 6,  r: 2.5, fill: "#7aab72", rot: 10  },
    { cx: 92,  cy: 14, r: 3,   fill: "#dba54a", rot: -15 },
    { cx: 106, cy: 4,  r: 2.5, fill: "#3fa8d0", rot: 5   },
    { cx: 120, cy: 12, r: 3,   fill: "#7aab72", rot: -20 },
  ];
  return (
    <svg viewBox="0 0 128 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {dots.map((d, i) => (
        <rect
          key={i}
          x={d.cx - d.r} y={d.cy - d.r}
          width={d.r * 2} height={d.r * 2}
          rx={d.r * 0.6}
          fill={d.fill} opacity="0.55"
          transform={`rotate(${d.rot} ${d.cx} ${d.cy})`}
        />
      ))}
    </svg>
  );
}
