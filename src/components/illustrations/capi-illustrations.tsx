// Capibara Illustration Library
// Direction artistique : chaud, cosy, arrondi — palette corps brun doré / teal / or / vert sauge

const C = {
  body: "#8B6640",
  dark: "#5C3E20",
  light: "#B8895A",
  skin: "#D9A87A",
  cream: "#FFF8EF",
  teal: "#3fa8d0",
  tealMid: "#68c4e8",
  tealLight: "#c0e8f8",
  gold: "#dba54a",
  goldLight: "#f5d98a",
  goldPale: "#fdf0cc",
  sage: "#7aab72",
  sageLight: "#b3d4ad",
  sagePale: "#dff0dc",
  beige: "#f5ebd8",
  beigeDeep: "#e8d8bc",
} as const;

type IlluProps = { className?: string; style?: React.CSSProperties };

// ── Shared: tête capybara centrée sur cx,cy avec taille scale ──────────────
function CapiHead({
  cx, cy, sc = 1,
}: { cx: number; cy: number; sc?: number }) {
  const s = sc;
  return (
    <g>
      {/* Oreilles */}
      <ellipse cx={cx - 20 * s} cy={cy - 14 * s} rx={11 * s} ry={9 * s} fill={C.body} />
      <ellipse cx={cx + 20 * s} cy={cy - 14 * s} rx={11 * s} ry={9 * s} fill={C.body} />
      <ellipse cx={cx - 20 * s} cy={cy - 14 * s} rx={6.5 * s} ry={5 * s} fill={C.skin} opacity={0.7} />
      <ellipse cx={cx + 20 * s} cy={cy - 14 * s} rx={6.5 * s} ry={5 * s} fill={C.skin} opacity={0.7} />
      {/* Tête */}
      <ellipse cx={cx} cy={cy} rx={26 * s} ry={20 * s} fill={C.body} />
      {/* Yeux */}
      <circle cx={cx - 9 * s} cy={cy - 3 * s} r={5.5 * s} fill={C.cream} />
      <circle cx={cx + 9 * s} cy={cy - 3 * s} r={5.5 * s} fill={C.cream} />
      <circle cx={cx - 8 * s} cy={cy - 2 * s} r={3.2 * s} fill={C.dark} />
      <circle cx={cx + 10 * s} cy={cy - 2 * s} r={3.2 * s} fill={C.dark} />
      <circle cx={cx - 7 * s} cy={cy - 3.5 * s} r={1.1 * s} fill="white" />
      <circle cx={cx + 11 * s} cy={cy - 3.5 * s} r={1.1 * s} fill="white" />
      {/* Museau */}
      <ellipse cx={cx} cy={cy + 8 * s} rx={9 * s} ry={7 * s} fill={C.dark} />
      <ellipse cx={cx - 2 * s} cy={cy + 7 * s} rx={3 * s} ry={2 * s} fill={C.light} opacity={0.4} />
    </g>
  );
}

// ── CapyDecks — Capybara avec une pile de flashcards ─────────────────────────
export function CapyDecks({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond doux */}
      <circle cx="80" cy="95" r="62" fill={C.beige} opacity="0.55" />

      {/* Cartes en éventail (derrière) */}
      <rect x="56" y="98" width="50" height="36" rx="6" fill={C.gold} opacity="0.85" transform="rotate(-12 81 116)" />
      <rect x="56" y="98" width="50" height="36" rx="6" fill={C.teal} opacity="0.80" transform="rotate(-5 81 116)" />
      {/* Carte de devant */}
      <rect x="52" y="100" width="50" height="36" rx="6" fill={C.cream} stroke={C.beigeDeep} strokeWidth="1.5" />
      <line x1="62" y1="112" x2="92" y2="112" stroke={C.beigeDeep} strokeWidth="1.5" />
      <line x1="62" y1="119" x2="87" y2="119" stroke={C.beigeDeep} strokeWidth="1.3" />
      <line x1="62" y1="126" x2="90" y2="126" stroke={C.beigeDeep} strokeWidth="1.2" />

      {/* Corps */}
      <ellipse cx="80" cy="112" rx="38" ry="28" fill={C.body} />

      {/* Bras */}
      <path d="M45 104 Q36 112 42 120" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M115 104 Q124 112 118 120" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="134" rx="15" ry="9" fill={C.dark} />
      <ellipse cx="100" cy="134" rx="15" ry="9" fill={C.dark} />

      {/* Tête */}
      <CapiHead cx={80} cy={68} sc={1} />

      {/* Petites étoiles déco */}
      <circle cx="30" cy="60" r="3" fill={C.gold} opacity="0.7" />
      <circle cx="28" cy="68" r="1.8" fill={C.gold} opacity="0.5" />
      <circle cx="38" cy="54" r="1.8" fill={C.teal} opacity="0.6" />

      <circle cx="128" cy="55" r="3" fill={C.teal} opacity="0.7" />
      <circle cx="134" cy="64" r="1.8" fill={C.teal} opacity="0.5" />
      <circle cx="120" cy="52" r="2" fill={C.gold} opacity="0.5" />

      {/* Petite plante à droite */}
      <ellipse cx="142" cy="140" rx="9" ry="14" fill={C.sage} opacity="0.5" transform="rotate(15 142 140)" />
      <ellipse cx="135" cy="138" rx="7" ry="11" fill={C.sage} opacity="0.4" transform="rotate(-10 135 138)" />
      <rect x="139" y="148" width="4" height="12" rx="2" fill={C.dark} opacity="0.3" />
    </svg>
  );
}

// ── CapyQuiz — Capybara avec un point d'interrogation et un crayon ────────────
export function CapyQuiz({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond */}
      <circle cx="80" cy="95" r="62" fill={C.tealLight} opacity="0.35" />

      {/* Grand ? */}
      <text x="92" y="60" fontSize="52" fontWeight="800" fill={C.teal} opacity="0.18" fontFamily="serif">?</text>

      {/* Crayon */}
      <g transform="rotate(-30 128 78)">
        <rect x="120" y="50" width="10" height="46" rx="3" fill={C.goldLight} />
        <rect x="120" y="50" width="10" height="10" rx="3" fill={C.gold} />
        <polygon points="120,96 130,96 125,108" fill={C.skin} />
        <polygon points="122,104 128,104 125,108" fill={C.dark} opacity="0.6" />
      </g>

      {/* Corps */}
      <ellipse cx="80" cy="115" rx="38" ry="28" fill={C.body} />

      {/* Bras droite levé */}
      <path d="M45 106 Q36 114 42 122" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M115 96 Q128 84 122 76" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="137" rx="15" ry="9" fill={C.dark} />
      <ellipse cx="100" cy="137" rx="15" ry="9" fill={C.dark} />

      {/* Tête légèrement inclinée */}
      <g transform="rotate(5 80 70)">
        <CapiHead cx={80} cy={70} sc={1} />
      </g>

      {/* Petit ? flottant */}
      <text x="44" y="48" fontSize="16" fontWeight="800" fill={C.teal} opacity="0.55" fontFamily="serif">?</text>
      <text x="110" y="48" fontSize="11" fontWeight="800" fill={C.gold} opacity="0.55" fontFamily="serif">?</text>

      {/* Étoiles */}
      <circle cx="34" cy="62" r="2.5" fill={C.teal} opacity="0.6" />
      <circle cx="30" cy="72" r="1.5" fill={C.teal} opacity="0.4" />
    </svg>
  );
}

// ── CapyRanked — Capybara avec une coupe / épée ──────────────────────────────
export function CapyRanked({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond doré */}
      <circle cx="80" cy="95" r="62" fill={C.goldPale} opacity="0.55" />

      {/* Trophée */}
      <g transform="translate(50, 88)">
        {/* Coupe */}
        <path d="M20 0 Q4 4 4 18 Q4 36 20 42 Q36 36 36 18 Q36 4 20 0Z" fill={C.gold} />
        <path d="M20 0 Q8 4 8 18 Q8 34 20 40" fill={C.goldLight} opacity="0.5" />
        {/* Anses */}
        <path d="M4 10 Q-6 16 -2 26 Q2 30 4 26" stroke={C.gold} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M36 10 Q46 16 42 26 Q38 30 36 26" stroke={C.gold} strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Pied */}
        <rect x="14" y="42" width="12" height="6" rx="2" fill={C.gold} opacity="0.8" />
        <rect x="10" y="46" width="20" height="5" rx="2.5" fill={C.gold} />
        {/* Étoile sur coupe */}
        <text x="13" y="26" fontSize="14" fill={C.goldPale} opacity="0.9">★</text>
      </g>

      {/* Corps */}
      <ellipse cx="80" cy="112" rx="38" ry="28" fill={C.body} />

      {/* Bras */}
      <path d="M44 102 Q35 110 41 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M116 102 Q125 110 119 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="134" rx="15" ry="9" fill={C.dark} />
      <ellipse cx="100" cy="134" rx="15" ry="9" fill={C.dark} />

      {/* Tête fière */}
      <CapiHead cx={80} cy={66} sc={1} />

      {/* Couronne */}
      <g transform="translate(57, 38)">
        <polygon points="0,14 6,0 12,10 18,2 24,10 30,0 36,14" fill={C.gold} />
        <rect x="0" y="13" width="36" height="8" rx="3" fill={C.gold} />
        <circle cx="18" cy="4" r="3" fill={C.goldLight} />
        <circle cx="6" cy="6" r="2" fill={C.goldLight} opacity="0.8" />
        <circle cx="30" cy="6" r="2" fill={C.goldLight} opacity="0.8" />
      </g>

      {/* Confettis */}
      <rect x="22" y="58" width="6" height="6" rx="1" fill={C.teal} opacity="0.6" transform="rotate(20 25 61)" />
      <rect x="128" y="62" width="5" height="5" rx="1" fill={C.gold} opacity="0.7" transform="rotate(-15 130 64)" />
      <rect x="18" y="80" width="4" height="4" rx="1" fill={C.sage} opacity="0.6" transform="rotate(35 20 82)" />
      <rect x="136" y="78" width="4" height="4" rx="1" fill={C.teal} opacity="0.5" transform="rotate(-25 138 80)" />
    </svg>
  );
}

// ── CapyExplore — Capybara avec une boussole et une carte ─────────────────────
export function CapyExplore({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond aventure */}
      <circle cx="80" cy="95" r="62" fill={C.sagePale} opacity="0.5" />

      {/* Carte dépliée */}
      <rect x="36" y="92" width="52" height="40" rx="5" fill={C.goldPale} stroke={C.beigeDeep} strokeWidth="1.5" transform="rotate(-6 62 112)" />
      <line x1="40" y1="104" x2="80" y2="100" stroke={C.beigeDeep} strokeWidth="1" transform="rotate(-6 62 112)" />
      <line x1="40" y1="112" x2="75" y2="108" stroke={C.beigeDeep} strokeWidth="1" transform="rotate(-6 62 112)" />
      <path d="M48 96 Q54 102 52 110 Q58 108 56 116" stroke={C.teal} strokeWidth="1.5" fill="none" transform="rotate(-6 62 112)" opacity="0.6" />
      <circle cx="56" cy="110" r="3" fill={C.teal} opacity="0.5" transform="rotate(-6 62 112)" />

      {/* Boussole tenue */}
      <circle cx="110" cy="108" r="18" fill={C.cream} stroke={C.beigeDeep} strokeWidth="2" />
      <circle cx="110" cy="108" r="14" fill="white" opacity="0.6" />
      {/* Aiguille */}
      <polygon points="110,96 107,108 110,110 113,108" fill={C.teal} />
      <polygon points="110,120 107,108 110,106 113,108" fill={C.dark} opacity="0.5" />
      <circle cx="110" cy="108" r="3" fill={C.gold} />
      {/* N S E W */}
      <text x="107" y="102" fontSize="5" fill={C.dark} opacity="0.5" fontWeight="700">N</text>
      <text x="107" y="118" fontSize="5" fill={C.dark} opacity="0.4">S</text>
      <text x="120" y="110" fontSize="5" fill={C.dark} opacity="0.4">E</text>
      <text x="98" y="110" fontSize="5" fill={C.dark} opacity="0.4">O</text>

      {/* Corps */}
      <ellipse cx="80" cy="112" rx="36" ry="27" fill={C.body} />

      {/* Bras (un tient carte, un tient boussole) */}
      <path d="M46 100 Q36 106 40 116" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M114 102 Q122 108 118 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="133" rx="15" ry="9" fill={C.dark} />
      <ellipse cx="100" cy="133" rx="15" ry="9" fill={C.dark} />

      {/* Tête */}
      <CapiHead cx={80} cy={68} sc={1} />

      {/* Chapeau d'aventurier */}
      <ellipse cx="80" cy="50" rx="26" ry="5" fill={C.gold} opacity="0.85" />
      <path d="M62 50 Q66 34 80 30 Q94 34 98 50Z" fill={C.gold} opacity="0.75" />

      {/* Petites feuilles */}
      <ellipse cx="25" cy="120" rx="8" ry="13" fill={C.sage} opacity="0.5" transform="rotate(-20 25 120)" />
      <ellipse cx="18" cy="128" rx="6" ry="10" fill={C.sage} opacity="0.4" transform="rotate(10 18 128)" />
    </svg>
  );
}

// ── CapySocial — Deux capybaras côte à côte ──────────────────────────────────
export function CapySocial({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond */}
      <circle cx="80" cy="95" r="62" fill="#fce8e8" opacity="0.4" />

      {/* Capybara gauche */}
      <ellipse cx="52" cy="118" rx="28" ry="22" fill={C.body} />
      <ellipse cx="38" cy="134" rx="11" ry="7" fill={C.dark} />
      <ellipse cx="66" cy="134" rx="11" ry="7" fill={C.dark} />
      <CapiHead cx={52} cy={80} sc={0.82} />

      {/* Capybara droite (légèrement différent) */}
      <ellipse cx="108" cy="118" rx="28" ry="22" fill={C.light} />
      <ellipse cx="94" cy="134" rx="11" ry="7" fill={C.dark} />
      <ellipse cx="122" cy="134" rx="11" ry="7" fill={C.dark} />
      {/* Tête capi 2 (même forme, couleur light) */}
      <ellipse cx={108 - 16} cy={80 - 14} rx={9} ry={7} fill={C.light} />
      <ellipse cx={108 + 16} cy={80 - 14} rx={9} ry={7} fill={C.light} />
      <ellipse cx={108 - 16} cy={80 - 14} rx={5.5} ry={4} fill={C.skin} opacity={0.7} />
      <ellipse cx={108 + 16} cy={80 - 14} rx={5.5} ry={4} fill={C.skin} opacity={0.7} />
      <ellipse cx={108} cy={80} rx={21.5} ry={16.5} fill={C.light} />
      <circle cx={108 - 7} cy={80 - 3} r={4.5} fill={C.cream} />
      <circle cx={108 + 7} cy={80 - 3} r={4.5} fill={C.cream} />
      <circle cx={108 - 6} cy={80 - 2} r={2.6} fill={C.dark} />
      <circle cx={108 + 8} cy={80 - 2} r={2.6} fill={C.dark} />
      <circle cx={108 - 5} cy={80 - 3.5} r={0.9} fill="white" />
      <circle cx={108 + 9} cy={80 - 3.5} r={0.9} fill="white" />
      <ellipse cx={108} cy={80 + 7} rx={7.5} ry={5.5} fill={C.dark} />

      {/* Cœur entre les deux */}
      <path d="M80 88 C80 84 74 80 74 86 C74 90 80 96 80 96 C80 96 86 90 86 86 C86 80 80 84 80 88Z" fill="#e87878" opacity="0.8" />

      {/* Bras enlacés */}
      <path d="M78 110 Q80 106 82 110" stroke={C.dark} strokeWidth="8" strokeLinecap="round" fill="none" />

      {/* Petits points déco */}
      <circle cx="28" cy="70" r="3" fill="#e87878" opacity="0.5" />
      <circle cx="130" cy="72" r="3" fill="#e87878" opacity="0.5" />
      <circle cx="22" cy="80" r="2" fill={C.gold} opacity="0.4" />
      <circle cx="136" cy="82" r="2" fill={C.gold} opacity="0.4" />

      {/* Petites fleurs */}
      <circle cx="145" cy="130" r="5" fill="#f2bebe" opacity="0.6" />
      <circle cx="150" cy="136" r="3.5" fill="#f2bebe" opacity="0.5" />
      <circle cx="140" cy="138" r="4" fill="#f9d0d0" opacity="0.5" />
    </svg>
  );
}

// ── CapyStats — Capybara avec un graphique ──────────────────────────────────
export function CapyStats({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond */}
      <circle cx="80" cy="95" r="62" fill={C.tealLight} opacity="0.3" />

      {/* Tableau graphique */}
      <rect x="30" y="90" width="72" height="50" rx="6" fill={C.cream} stroke={C.beigeDeep} strokeWidth="1.5" />
      {/* Barres */}
      <rect x="40" y="118" width="10" height="16" rx="3" fill={C.teal} opacity="0.7" />
      <rect x="56" y="108" width="10" height="26" rx="3" fill={C.gold} opacity="0.75" />
      <rect x="72" y="100" width="10" height="34" rx="3" fill={C.sage} opacity="0.7" />
      <rect x="88" y="112" width="10" height="22" rx="3" fill={C.teal} opacity="0.55" />
      {/* Axe */}
      <line x1="36" y1="134" x2="96" y2="134" stroke={C.beigeDeep} strokeWidth="1.5" />
      {/* Ligne de tendance */}
      <path d="M40 126 Q56 114 72 106 Q84 102 92 108" stroke={C.gold} strokeWidth="2" fill="none" strokeDasharray="4 3" opacity="0.6" />
      <circle cx="92" cy="108" r="3" fill={C.gold} opacity="0.8" />

      {/* Corps */}
      <ellipse cx="80" cy="112" rx="36" ry="26" fill={C.body} />

      {/* Bras (un pointe le graphique) */}
      <path d="M44 100 Q34 108 40 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M116 100 Q126 108 120 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="132" rx="14" ry="8.5" fill={C.dark} />
      <ellipse cx="100" cy="132" rx="14" ry="8.5" fill={C.dark} />

      {/* Tête avec lunettes */}
      <CapiHead cx={80} cy={68} sc={1} />
      {/* Lunettes */}
      <circle cx="71" cy="66" r="7" fill="none" stroke={C.dark} strokeWidth="2" opacity="0.5" />
      <circle cx="89" cy="66" r="7" fill="none" stroke={C.dark} strokeWidth="2" opacity="0.5" />
      <line x1="78" y1="66" x2="82" y2="66" stroke={C.dark} strokeWidth="2" opacity="0.5" />
      <line x1="64" y1="64" x2="58" y2="62" stroke={C.dark} strokeWidth="2" opacity="0.5" />
      <line x1="96" y1="64" x2="102" y2="62" stroke={C.dark} strokeWidth="2" opacity="0.5" />

      {/* Étoiles */}
      <circle cx="130" cy="60" r="3" fill={C.gold} opacity="0.7" />
      <circle cx="136" cy="68" r="1.8" fill={C.teal} opacity="0.5" />
      <circle cx="26" cy="65" r="2.5" fill={C.teal} opacity="0.6" />
    </svg>
  );
}

// ── CapyCheck — Capybara avec un bouclier et une coche ───────────────────────
export function CapyCheck({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond */}
      <circle cx="80" cy="95" r="62" fill={C.tealLight} opacity="0.3" />

      {/* Bouclier */}
      <path d="M80 88 L54 98 L54 118 Q54 136 80 146 Q106 136 106 118 L106 98 Z" fill={C.teal} opacity="0.2" />
      <path d="M80 92 L58 100 L58 118 Q58 132 80 142 Q102 132 102 118 L102 100 Z" fill={C.teal} opacity="0.35" />
      {/* Coche */}
      <path d="M66 118 L75 128 L96 106" stroke={C.teal} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Corps */}
      <ellipse cx="80" cy="112" rx="36" ry="26" fill={C.body} />

      {/* Bras */}
      <path d="M46 102 Q36 110 42 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M114 102 Q124 110 118 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="132" rx="14" ry="8.5" fill={C.dark} />
      <ellipse cx="100" cy="132" rx="14" ry="8.5" fill={C.dark} />

      {/* Tête sérieuse / appliquée */}
      <CapiHead cx={80} cy={68} sc={1} />

      {/* Petites étoiles */}
      <circle cx="26" cy="72" r="3" fill={C.teal} opacity="0.55" />
      <circle cx="22" cy="82" r="1.8" fill={C.gold} opacity="0.5" />
      <circle cx="130" cy="68" r="2.5" fill={C.gold} opacity="0.6" />
      <circle cx="136" cy="78" r="1.8" fill={C.teal} opacity="0.4" />

      {/* Petite plante gauche */}
      <ellipse cx="18" cy="138" rx="8" ry="13" fill={C.sage} opacity="0.45" transform="rotate(-15 18 138)" />
      <ellipse cx="24" cy="144" rx="6" ry="10" fill={C.sage} opacity="0.35" transform="rotate(10 24 144)" />
    </svg>
  );
}

// ── CapyNotif — Capybara avec une cloche ────────────────────────────────────
export function CapyNotif({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond */}
      <circle cx="80" cy="95" r="62" fill={C.goldPale} opacity="0.45" />

      {/* Cloche */}
      <path d="M80 84 Q62 88 60 108 L60 120 L100 120 L100 108 Q98 88 80 84Z" fill={C.gold} opacity="0.75" />
      <rect x="70" y="120" width="20" height="5" rx="2.5" fill={C.gold} opacity="0.6" />
      <ellipse cx="80" cy="127" rx="7" ry="5" fill={C.gold} opacity="0.55" />
      {/* Trait de la cloche */}
      <path d="M80 84 Q62 88 60 108 L60 120" stroke={C.dark} strokeWidth="1" fill="none" opacity="0.2" />
      {/* Petit point d'onde */}
      <path d="M90 78 Q96 74 98 68" stroke={C.gold} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M86 76 Q90 70 90 64" stroke={C.gold} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Corps */}
      <ellipse cx="80" cy="112" rx="36" ry="26" fill={C.body} />

      {/* Bras */}
      <path d="M46 102 Q36 110 42 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M114 102 Q124 110 118 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="132" rx="14" ry="8.5" fill={C.dark} />
      <ellipse cx="100" cy="132" rx="14" ry="8.5" fill={C.dark} />

      {/* Tête */}
      <CapiHead cx={80} cy={68} sc={1} />

      {/* Petits cercles dorés flottants */}
      <circle cx="28" cy="68" r="5" fill={C.gold} opacity="0.3" />
      <circle cx="26" cy="80" r="3" fill={C.gold} opacity="0.4" />
      <circle cx="34" cy="58" r="3" fill={C.teal} opacity="0.3" />

      <circle cx="128" cy="64" r="4" fill={C.gold} opacity="0.4" />
      <circle cx="134" cy="74" r="2.5" fill={C.gold} opacity="0.3" />
    </svg>
  );
}

// ── CapyDashboard — Capybara entouré d'étoiles et de plantes (accueil) ───────
export function CapyDashboard({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Grand cercle doux */}
      <circle cx="80" cy="90" r="68" fill={C.beige} opacity="0.45" />

      {/* Plantes gauche */}
      <ellipse cx="22" cy="135" rx="10" ry="18" fill={C.sage} opacity="0.5" transform="rotate(-20 22 135)" />
      <ellipse cx="14" cy="145" rx="8" ry="14" fill={C.sage} opacity="0.4" transform="rotate(12 14 145)" />
      <ellipse cx="30" cy="148" rx="7" ry="12" fill={C.sageLight} opacity="0.4" transform="rotate(-5 30 148)" />
      <rect x="20" y="152" width="5" height="10" rx="2" fill={C.dark} opacity="0.25" />

      {/* Plantes droite */}
      <ellipse cx="140" cy="130" rx="10" ry="18" fill={C.sage} opacity="0.5" transform="rotate(20 140 130)" />
      <ellipse cx="148" cy="142" rx="8" ry="14" fill={C.sage} opacity="0.4" transform="rotate(-12 148 142)" />
      <ellipse cx="132" cy="145" rx="7" ry="12" fill={C.sageLight} opacity="0.4" transform="rotate(5 132 145)" />
      <rect x="136" y="152" width="5" height="10" rx="2" fill={C.dark} opacity="0.25" />

      {/* Corps */}
      <ellipse cx="80" cy="116" rx="40" ry="30" fill={C.body} />

      {/* Bras étendus (accueil) */}
      <path d="M42 106 Q28 100 22 92" stroke={C.dark} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M118 106 Q132 100 138 92" stroke={C.dark} strokeWidth="12" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="140" rx="16" ry="10" fill={C.dark} />
      <ellipse cx="100" cy="140" rx="16" ry="10" fill={C.dark} />

      {/* Tête */}
      <CapiHead cx={80} cy={70} sc={1.05} />

      {/* Étoiles et étincelles */}
      {/* ★ dorées */}
      <polygon points="28,55 30,48 32,55 38,55 33,59 35,66 30,62 25,66 27,59 22,55" fill={C.gold} opacity="0.65" />
      <polygon points="130,48 132,42 134,48 140,48 135,52 137,58 132,54 127,58 129,52 124,48" fill={C.gold} opacity="0.6" />

      {/* ◆ teal petits */}
      <polygon points="148,70 150,64 152,70 148,74 152,74" fill={C.teal} opacity="0.5" transform="rotate(0 150 70)" />
      <circle cx="22" cy="78" r="3.5" fill={C.teal} opacity="0.45" />

      {/* Petits cercles flottants */}
      <circle cx="138" cy="56" r="5" fill={C.tealLight} opacity="0.5" />
      <circle cx="144" cy="64" r="3" fill={C.tealLight} opacity="0.4" />
      <circle cx="16" cy="60" r="4" fill={C.goldPale} opacity="0.6" />
      <circle cx="12" cy="70" r="2.5" fill={C.goldPale} opacity="0.5" />
    </svg>
  );
}

// ── CapySettings — Capybara avec une clé et un engrenage ────────────────────
export function CapySettings({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 160 168" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond */}
      <circle cx="80" cy="95" r="62" fill={C.beige} opacity="0.5" />

      {/* Engrenage */}
      <g transform="translate(88, 90)">
        <circle cx="22" cy="22" r="14" fill={C.beigeDeep} stroke={C.light} strokeWidth="2" />
        <circle cx="22" cy="22" r="6" fill={C.cream} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="19"
            y="4"
            width="6"
            height="8"
            rx="2"
            fill={C.light}
            transform={`rotate(${angle} 22 22)`}
          />
        ))}
      </g>

      {/* Clé */}
      <g transform="rotate(-35 60 100)" opacity="0.75">
        <circle cx="42" cy="90" r="12" fill="none" stroke={C.gold} strokeWidth="4" />
        <line x1="50" y1="96" x2="70" y2="116" stroke={C.gold} strokeWidth="4" strokeLinecap="round" />
        <line x1="64" y1="110" x2="68" y2="106" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />
        <line x1="68" y1="114" x2="72" y2="110" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Corps */}
      <ellipse cx="80" cy="112" rx="36" ry="26" fill={C.body} />

      {/* Bras */}
      <path d="M46 102 Q36 110 42 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M114 102 Q124 110 118 118" stroke={C.dark} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Pattes */}
      <ellipse cx="60" cy="132" rx="14" ry="8.5" fill={C.dark} />
      <ellipse cx="100" cy="132" rx="14" ry="8.5" fill={C.dark} />

      {/* Tête */}
      <CapiHead cx={80} cy={68} sc={1} />

      {/* Déco */}
      <circle cx="26" cy="62" r="3" fill={C.gold} opacity="0.5" />
      <circle cx="132" cy="60" r="3" fill={C.teal} opacity="0.5" />
    </svg>
  );
}

// ── LeafSprig — Élément décoratif : tige avec feuilles ────────────────────
export function LeafSprig({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <line x1="30" y1="80" x2="30" y2="20" stroke={C.dark} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <ellipse cx="18" cy="50" rx="14" ry="8" fill={C.sage} opacity="0.6" transform="rotate(-25 18 50)" />
      <ellipse cx="42" cy="40" rx="14" ry="8" fill={C.sage} opacity="0.55" transform="rotate(20 42 40)" />
      <ellipse cx="22" cy="28" rx="12" ry="7" fill={C.sageLight} opacity="0.6" transform="rotate(-15 22 28)" />
    </svg>
  );
}

// ── StarBurst — Petite rafale d'étoiles décoratives ──────────────────────────
export function StarBurst({ className, style, color = C.gold }: IlluProps & { color?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="20" cy="20" r="4" fill={color} opacity="0.8" />
      <line x1="20" y1="10" x2="20" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="20" y1="30" x2="20" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="10" y1="20" x2="4" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="30" y1="20" x2="36" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="13" y1="13" x2="9" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="27" y1="13" x2="31" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="13" y1="27" x2="9" y2="31" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="27" y1="27" x2="31" y2="31" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
