// ═══════════════════════════════════════════════════════════════════
//  Capibara Illustration Library  —  v2 "x100"
//  Direction artistique : chaud / cosy / arrondi
//  Chaque illustration est une mini scène avec dégradés, ombres, vie
// ═══════════════════════════════════════════════════════════════════

type IlluProps = { className?: string; style?: React.CSSProperties };

// ─── Palette ──────────────────────────────────────────────────────
//  Corps   : dégradé radial  #BA8D5C → #8C6840 → #5A3A1A
//  Museau  : #6B4820  (rectangulaire — trait distinctif du capybara)
//  Oreille : #C4915E inner
//  Yeux    : #FFF8EF sclère · #2A1A08 iris
//  Accent1 : teal  #3fa8d0 / light #8ed5f0
//  Accent2 : or    #dba54a / light #f5d898
//  Nature  : sauge #7aab72 / light #b3d4ad
// ──────────────────────────────────────────────────────────────────

// ── CapyDecks ─────────────────────────────────────────────────────
export function CapyDecks({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="dk_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8f0e8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c8f0e8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dk_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="dk_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
        <linearGradient id="dk_c1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8e09a" /><stop offset="100%" stopColor="#dba54a" />
        </linearGradient>
        <linearGradient id="dk_c2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#90daf4" /><stop offset="100%" stopColor="#3fa8d0" />
        </linearGradient>
        <linearGradient id="dk_c3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8dcb4" /><stop offset="100%" stopColor="#7aab72" />
        </linearGradient>
        <linearGradient id="dk_c4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f4c0c0" /><stop offset="100%" stopColor="#d88080" />
        </linearGradient>
      </defs>

      {/* Fond blob teal */}
      <circle cx="100" cy="118" r="88" fill="url(#dk_bg)" />

      {/* Ombre au sol */}
      <ellipse cx="100" cy="204" rx="52" ry="9" fill="#3E2510" opacity="0.1" />

      {/* ── Cartes en éventail ── */}
      <g transform="rotate(-22 94 138)">
        <rect x="50" y="108" width="52" height="38" rx="7" fill="url(#dk_c4)" />
      </g>
      <g transform="rotate(-12 94 138)">
        <rect x="50" y="108" width="52" height="38" rx="7" fill="url(#dk_c3)" />
      </g>
      <g transform="rotate(-4 94 138)">
        <rect x="50" y="108" width="52" height="38" rx="7" fill="url(#dk_c2)" />
      </g>
      <g transform="rotate(5 94 138)">
        <rect x="50" y="108" width="52" height="38" rx="7" fill="url(#dk_c1)" />
      </g>
      {/* Carte blanche (devant) */}
      <g transform="rotate(13 94 138)">
        <rect x="50" y="108" width="52" height="38" rx="7" fill="#fffdf8" stroke="#e8dcc8" strokeWidth="1.5" />
        <line x1="60" y1="120" x2="94" y2="120" stroke="#ddd0b8" strokeWidth="1.5" />
        <line x1="60" y1="128" x2="90" y2="128" stroke="#ddd0b8" strokeWidth="1.3" />
        <line x1="60" y1="135" x2="92" y2="135" stroke="#ddd0b8" strokeWidth="1.2" />
      </g>

      {/* ── Personnage ── */}
      <g className="capi-illus-bob">
        {/* Corps */}
        <ellipse cx="100" cy="150" rx="42" ry="34" fill="url(#dk_body)" />
        <ellipse cx="86"  cy="138" rx="18" ry="11" fill="#BA8D5C" opacity="0.28" />

        {/* Pattes arrière */}
        <ellipse cx="66"  cy="176" rx="17" ry="10" fill="url(#dk_limb)" />
        <ellipse cx="134" cy="176" rx="17" ry="10" fill="url(#dk_limb)" />

        {/* Bras (tenant les cartes par dessous) */}
        <path d="M60 150 Q44 148 46 132 Q48 122 58 124"
          stroke="#4E3015" strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M140 150 Q156 148 154 132 Q152 122 142 124"
          stroke="#4E3015" strokeWidth="16" strokeLinecap="round" fill="none" />

        {/* Oreilles */}
        <ellipse cx="70"  cy="88" rx="14" ry="11" fill="url(#dk_body)" />
        <ellipse cx="130" cy="88" rx="14" ry="11" fill="url(#dk_body)" />
        <ellipse cx="70"  cy="88" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="88" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />

        {/* Tête */}
        <ellipse cx="100" cy="108" rx="34" ry="26" fill="url(#dk_body)" />
        <ellipse cx="88"  cy="98"  rx="14" ry="9"  fill="#BA8D5C" opacity="0.28" />

        {/* Museau plat rectangulaire (trait distinctif du capybara) */}
        <rect x="80" y="112" width="40" height="22" rx="11" fill="#6B4820" />
        <rect x="82" y="114" width="16" height="10" rx="5" fill="#8C6840" opacity="0.35" />
        {/* Naseaux */}
        <circle cx="91" cy="120" r="2.5" fill="#3E2010" opacity="0.5" />
        <circle cx="109" cy="120" r="2.5" fill="#3E2010" opacity="0.5" />

        {/* Yeux */}
        <circle cx="86"  cy="103" r="7.5" fill="#FFF8EF" />
        <circle cx="114" cy="103" r="7.5" fill="#FFF8EF" />
        <circle cx="87"  cy="104" r="4.8" fill="#2A1A08" />
        <circle cx="115" cy="104" r="4.8" fill="#2A1A08" />
        <circle cx="89"  cy="102" r="1.8" fill="white"  opacity="0.92" />
        <circle cx="117" cy="102" r="1.8" fill="white"  opacity="0.92" />

        {/* Sourire */}
        <path d="M88 124 Q100 132 112 124"
          stroke="#3E2010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" />
      </g>

      {/* ── Déco ── */}
      {/* Étoile or gauche */}
      <g opacity="0.75">
        <line x1="24" y1="64" x2="24" y2="54" stroke="#dba54a" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="19" y1="59" x2="29" y2="59" stroke="#dba54a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="59" r="3" fill="#dba54a" />
      </g>
      {/* Étoile teal droite */}
      <g opacity="0.65">
        <line x1="174" y1="72" x2="174" y2="64" stroke="#3fa8d0" strokeWidth="2" strokeLinecap="round" />
        <line x1="170" y1="68" x2="178" y2="68" stroke="#3fa8d0" strokeWidth="2" strokeLinecap="round" />
        <circle cx="174" cy="68" r="2.5" fill="#3fa8d0" />
      </g>
      <circle cx="168" cy="60" r="3.5" fill="#3fa8d0" opacity="0.35" />
      <circle cx="30"  cy="74" r="2.5" fill="#dba54a" opacity="0.4"  />
      {/* Plante bas-gauche */}
      <ellipse cx="18"  cy="194" rx="9"  ry="15" fill="#7aab72" opacity="0.45" transform="rotate(-22 18 194)" />
      <ellipse cx="10"  cy="204" rx="7"  ry="12" fill="#b3d4ad" opacity="0.4"  transform="rotate(10 10 204)" />
      {/* Plante bas-droite */}
      <ellipse cx="180" cy="188" rx="9"  ry="14" fill="#7aab72" opacity="0.4"  transform="rotate(18 180 188)" />
    </svg>
  );
}

// ── CapyQuiz ──────────────────────────────────────────────────────
export function CapyQuiz({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="qz_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8dff8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c8dff8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="qz_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="qz_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
        <radialGradient id="qz_qmark" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#8ed5f0" />
          <stop offset="100%" stopColor="#2588b0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#qz_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Grand ? illuminé */}
      <text x="118" y="108" fontSize="72" fontWeight="900"
        fill="url(#qz_qmark)" opacity="0.2" fontFamily="Georgia,serif">?</text>
      {/* ? plus net */}
      <text x="122" y="100" fontSize="58" fontWeight="900"
        fill="#3fa8d0" opacity="0.18" fontFamily="Georgia,serif">?</text>

      {/* Crayon flottant */}
      <g transform="rotate(-30 152 70)">
        <rect x="144" y="42" width="14" height="56" rx="4" fill="#f5d898" />
        <rect x="144" y="42" width="14" height="14" rx="4" fill="#e8a040" />
        <polygon points="144,98 158,98 151,116" fill="#f4c080" />
        <polygon points="146,110 156,110 151,116" fill="#2A1A08" opacity="0.7" />
        {/* Métal */}
        <rect x="144" y="88" width="14" height="8" rx="2" fill="#c8c8c8" opacity="0.8" />
      </g>

      {/* Petite ampoule */}
      <g transform="translate(30, 48)">
        <ellipse cx="16" cy="16" rx="12" ry="12" fill="#f5d898" opacity="0.7" />
        <rect x="11" y="24" width="10" height="5" rx="2" fill="#e8c878" opacity="0.7" />
        <rect x="12" y="28" width="8"  height="4" rx="1.5" fill="#c8a850" opacity="0.6" />
        <line x1="16" y1="6"  x2="16" y2="2"  stroke="#dba54a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="24" y1="10" x2="27" y2="8"  stroke="#dba54a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="8"  y1="10" x2="5"  y2="8"  stroke="#dba54a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* ── Personnage (légèrement incliné, bras droit levé) ── */}
      <g className="capi-illus-bob" transform="rotate(4 100 130)">
        <ellipse cx="100" cy="152" rx="40" ry="32" fill="url(#qz_body)" />
        <ellipse cx="86" cy="140" rx="16" ry="10" fill="#BA8D5C" opacity="0.28" />

        <ellipse cx="64"  cy="176" rx="16" ry="10" fill="url(#qz_limb)" />
        <ellipse cx="136" cy="176" rx="16" ry="10" fill="url(#qz_limb)" />

        {/* Bras gauche normal */}
        <path d="M62 148 Q48 148 50 134"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />
        {/* Bras droit levé (enthousiaste) */}
        <path d="M138 148 Q152 140 148 118 Q146 108 136 108"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />

        <ellipse cx="70"  cy="90" rx="14" ry="11" fill="url(#qz_body)" />
        <ellipse cx="130" cy="90" rx="14" ry="11" fill="url(#qz_body)" />
        <ellipse cx="70"  cy="90" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="90" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />

        <ellipse cx="100" cy="110" rx="34" ry="26" fill="url(#qz_body)" />
        <ellipse cx="88"  cy="100" rx="14" ry="9"  fill="#BA8D5C" opacity="0.26" />

        <rect x="80" y="114" width="40" height="22" rx="11" fill="#6B4820" />
        <rect x="82" y="116" width="16" height="10" rx="5" fill="#8C6840" opacity="0.35" />
        <circle cx="91"  cy="122" r="2.5" fill="#3E2010" opacity="0.5" />
        <circle cx="109" cy="122" r="2.5" fill="#3E2010" opacity="0.5" />

        <circle cx="86"  cy="105" r="7.5" fill="#FFF8EF" />
        <circle cx="114" cy="105" r="7.5" fill="#FFF8EF" />
        <circle cx="87"  cy="106" r="4.8" fill="#2A1A08" />
        <circle cx="115" cy="106" r="4.8" fill="#2A1A08" />
        <circle cx="89"  cy="104" r="1.8" fill="white" opacity="0.92" />
        <circle cx="117" cy="104" r="1.8" fill="white" opacity="0.92" />

        {/* Expression : sourcil levé */}
        <path d="M80 98 Q86 94 92 97" stroke="#4E3015" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
        {/* Sourire ouvert */}
        <path d="M88 126 Q100 136 112 126"
          stroke="#3E2010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Petits ? déco */}
      <text x="40"  y="52" fontSize="16" fontWeight="800" fill="#3fa8d0" opacity="0.5" fontFamily="Georgia,serif">?</text>
      <text x="166" y="52" fontSize="12" fontWeight="800" fill="#dba54a" opacity="0.5" fontFamily="Georgia,serif">?</text>
      <circle cx="42"  cy="80" r="3"   fill="#3fa8d0" opacity="0.4" />
      <circle cx="158" cy="76" r="2.5" fill="#dba54a" opacity="0.4" />
    </svg>
  );
}

// ── CapyRanked ────────────────────────────────────────────────────
export function CapyRanked({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="rk_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde8b0" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#fde8b0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rk_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="rk_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
        <linearGradient id="rk_trophy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fce89a" />
          <stop offset="50%"  stopColor="#dba54a" />
          <stop offset="100%" stopColor="#a87030" />
        </linearGradient>
        <radialGradient id="rk_shine" cx="30%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#fff8d0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fff8d0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#rk_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Trophée */}
      <g transform="translate(66, 84)">
        {/* Base */}
        <rect x="22" y="68" width="24" height="8"  rx="3"   fill="url(#rk_trophy)" />
        <rect x="18" y="74" width="32" height="8"  rx="4"   fill="url(#rk_trophy)" />
        {/* Pied */}
        <rect x="28" y="62" width="12" height="10" rx="2"   fill="url(#rk_trophy)" />
        {/* Corps de la coupe */}
        <path d="M12 8 Q6 14 8 30 Q10 50 34 62 Q58 50 60 30 Q62 14 56 8 Z"
          fill="url(#rk_trophy)" />
        {/* Brillance sur la coupe */}
        <path d="M12 8 Q6 14 8 30 Q10 50 34 62"
          fill="url(#rk_shine)" opacity="0.5" />
        {/* Anses */}
        <path d="M12 18 Q0 26 4 40 Q8 46 12 40"
          stroke="url(#rk_trophy)" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M56 18 Q68 26 64 40 Q60 46 56 40"
          stroke="url(#rk_trophy)" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Étoile dans la coupe */}
        <text x="22" y="46" fontSize="22" fill="#fff8d0" opacity="0.9">★</text>
      </g>

      {/* ── Personnage (pose triomphale) ── */}
      <g className="capi-illus-bob">
        <ellipse cx="100" cy="154" rx="40" ry="32" fill="url(#rk_body)" />
        <ellipse cx="86" cy="142" rx="16" ry="10" fill="#BA8D5C" opacity="0.28" />

        <ellipse cx="64"  cy="178" rx="16" ry="10" fill="url(#rk_limb)" />
        <ellipse cx="136" cy="178" rx="16" ry="10" fill="url(#rk_limb)" />

        {/* Bras levés en victoire */}
        <path d="M62 146 Q42 130 38 110"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M138 146 Q158 130 162 110"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />

        <ellipse cx="70"  cy="92" rx="14" ry="11" fill="url(#rk_body)" />
        <ellipse cx="130" cy="92" rx="14" ry="11" fill="url(#rk_body)" />
        <ellipse cx="70"  cy="92" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="92" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />

        <ellipse cx="100" cy="112" rx="34" ry="26" fill="url(#rk_body)" />
        <ellipse cx="88"  cy="102" rx="14" ry="9"  fill="#BA8D5C" opacity="0.26" />

        <rect x="80" y="116" width="40" height="22" rx="11" fill="#6B4820" />
        <rect x="82" y="118" width="16" height="10" rx="5" fill="#8C6840" opacity="0.35" />
        <circle cx="91"  cy="124" r="2.5" fill="#3E2010" opacity="0.5" />
        <circle cx="109" cy="124" r="2.5" fill="#3E2010" opacity="0.5" />

        <circle cx="86"  cy="107" r="7.5" fill="#FFF8EF" />
        <circle cx="114" cy="107" r="7.5" fill="#FFF8EF" />
        <circle cx="87"  cy="108" r="4.8" fill="#2A1A08" />
        <circle cx="115" cy="108" r="4.8" fill="#2A1A08" />
        <circle cx="89"  cy="106" r="1.8" fill="white" opacity="0.92" />
        <circle cx="117" cy="106" r="1.8" fill="white" opacity="0.92" />

        {/* Expression : grands yeux joyeux */}
        <path d="M88 128 Q100 138 112 128"
          stroke="#3E2010" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />

        {/* Couronne */}
        <g transform="translate(68, 74)">
          <polygon points="0,14 7,0 14,10 21,2 28,10 35,0 42,14" fill="#dba54a" />
          <rect x="0" y="13" width="42" height="9" rx="3" fill="#dba54a" />
          <circle cx="21" cy="4"  r="3.5" fill="#f5e08a" />
          <circle cx="7"  cy="6"  r="2.5" fill="#f5e08a" opacity="0.8" />
          <circle cx="35" cy="6"  r="2.5" fill="#f5e08a" opacity="0.8" />
        </g>
      </g>

      {/* Confettis */}
      {[
        { x: 22,  y: 76, c: "#dba54a", r: 20  },
        { x: 172, y: 80, c: "#3fa8d0", r: -15 },
        { x: 16,  y: 100,c: "#7aab72", r: 35  },
        { x: 178, y: 100,c: "#dba54a", r: -25 },
        { x: 28,  y: 116,c: "#3fa8d0", r: 10  },
        { x: 168, y: 118,c: "#7aab72", r: -10 },
      ].map((d, i) => (
        <rect key={i} x={d.x-4} y={d.y-4} width="8" height="8" rx="2"
          fill={d.c} opacity="0.55" transform={`rotate(${d.r} ${d.x} ${d.y})`} />
      ))}
      <circle cx="28"  cy="62" r="4" fill="#dba54a" opacity="0.35" />
      <circle cx="170" cy="66" r="4" fill="#3fa8d0" opacity="0.35" />
    </svg>
  );
}

// ── CapyExplore ───────────────────────────────────────────────────
export function CapyExplore({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="ex_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4f0d4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#d4f0d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ex_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="ex_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
        <linearGradient id="ex_map" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdf0cc" />
          <stop offset="100%" stopColor="#e8d098" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#ex_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Silhouette montagne */}
      <polygon points="18,160 50,98 80,140 95,118 125,160" fill="#b3d4ad" opacity="0.3" />
      <polygon points="50,160 78,108 106,160" fill="#7aab72" opacity="0.25" />

      {/* Carte dépliée */}
      <g transform="rotate(-5 76 130)">
        <rect x="30" y="108" width="90" height="64" rx="6" fill="url(#ex_map)" stroke="#d4c080" strokeWidth="1.5" />
        {/* Plis */}
        <line x1="75" y1="108" x2="75" y2="172" stroke="#d4c080" strokeWidth="1" opacity="0.6" />
        <line x1="30" y1="140" x2="120" y2="140" stroke="#d4c080" strokeWidth="1" opacity="0.6" />
        {/* Route */}
        <path d="M40 118 Q55 128 62 148 Q68 162 74 168"
          stroke="#3fa8d0" strokeWidth="2" fill="none" strokeDasharray="5 4" opacity="0.6" />
        {/* Marqueur */}
        <circle cx="74" cy="168" r="5" fill="#d85050" opacity="0.7" />
        <line x1="74" y1="160" x2="74" y2="168" stroke="#d85050" strokeWidth="2" opacity="0.7" />
        {/* Arbres */}
        <text x="84" y="126" fontSize="10" fill="#7aab72" opacity="0.7">🌲</text>
        <text x="96" y="150" fontSize="8"  fill="#7aab72" opacity="0.6">🌲</text>
      </g>

      {/* Boussole */}
      <g transform="translate(138, 88)">
        <circle cx="22" cy="22" r="20" fill="white" opacity="0.85" stroke="#d4c080" strokeWidth="1.5" />
        <circle cx="22" cy="22" r="16" fill="white" opacity="0.5" />
        {/* Aiguille nord */}
        <polygon points="22,6 19,22 22,24 25,22" fill="#3fa8d0" opacity="0.85" />
        {/* Aiguille sud */}
        <polygon points="22,38 19,22 22,20 25,22" fill="#888" opacity="0.45" />
        <circle cx="22" cy="22" r="4"   fill="#dba54a" />
        <circle cx="22" cy="22" r="1.5" fill="white" />
        <text x="19" y="8"  fontSize="5" fill="#444" opacity="0.5" fontWeight="700">N</text>
        <text x="19" y="41" fontSize="5" fill="#444" opacity="0.4">S</text>
        <text x="34" y="25" fontSize="5" fill="#444" opacity="0.4">E</text>
        <text x="7"  y="25" fontSize="5" fill="#444" opacity="0.4">O</text>
      </g>

      {/* ── Personnage ── */}
      <g className="capi-illus-bob">
        <ellipse cx="100" cy="154" rx="40" ry="32" fill="url(#ex_body)" />
        <ellipse cx="86" cy="142" rx="16" ry="10" fill="#BA8D5C" opacity="0.28" />

        <ellipse cx="64"  cy="178" rx="16" ry="10" fill="url(#ex_limb)" />
        <ellipse cx="136" cy="178" rx="16" ry="10" fill="url(#ex_limb)" />

        <path d="M62 150 Q46 148 48 136"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M138 150 Q154 148 152 136 Q150 128 140 126"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />

        <ellipse cx="70"  cy="92" rx="14" ry="11" fill="url(#ex_body)" />
        <ellipse cx="130" cy="92" rx="14" ry="11" fill="url(#ex_body)" />
        <ellipse cx="70"  cy="92" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="92" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />

        <ellipse cx="100" cy="112" rx="34" ry="26" fill="url(#ex_body)" />
        <ellipse cx="88"  cy="102" rx="14" ry="9"  fill="#BA8D5C" opacity="0.26" />

        <rect x="80" y="116" width="40" height="22" rx="11" fill="#6B4820" />
        <rect x="82" y="118" width="16" height="10" rx="5" fill="#8C6840" opacity="0.35" />
        <circle cx="91"  cy="124" r="2.5" fill="#3E2010" opacity="0.5" />
        <circle cx="109" cy="124" r="2.5" fill="#3E2010" opacity="0.5" />

        <circle cx="86"  cy="107" r="7.5" fill="#FFF8EF" />
        <circle cx="114" cy="107" r="7.5" fill="#FFF8EF" />
        <circle cx="87"  cy="108" r="4.8" fill="#2A1A08" />
        <circle cx="115" cy="108" r="4.8" fill="#2A1A08" />
        <circle cx="89"  cy="106" r="1.8" fill="white" opacity="0.92" />
        <circle cx="117" cy="106" r="1.8" fill="white" opacity="0.92" />

        <path d="M88 128 Q100 136 112 128"
          stroke="#3E2010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* Chapeau explorateur */}
        <ellipse cx="100" cy="88" rx="30" ry="6" fill="#8C6020" opacity="0.8" />
        <path d="M76 88 Q80 68 100 64 Q120 68 124 88Z" fill="#A07828" opacity="0.75" />
        <rect x="80" y="84" width="40" height="6" rx="2" fill="#c8942c" opacity="0.5" />
      </g>

      {/* Déco */}
      <circle cx="26"  cy="84" r="4" fill="#7aab72" opacity="0.45" />
      <circle cx="20"  cy="94" r="2.5" fill="#dba54a" opacity="0.4" />
      <circle cx="174" cy="160" r="3.5" fill="#3fa8d0" opacity="0.4" />
      <ellipse cx="16" cy="190" rx="9" ry="14" fill="#7aab72" opacity="0.4" transform="rotate(-20 16 190)" />
    </svg>
  );
}

// ── CapySocial ────────────────────────────────────────────────────
export function CapySocial({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="sc_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde0e0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fde0e0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sc_b1" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="sc_b2" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#DAAD82" />
          <stop offset="52%"  stopColor="#A87858" />
          <stop offset="100%" stopColor="#6A4828" />
        </radialGradient>
        <radialGradient id="sc_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#sc_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Guirlande lumineuse */}
      <path d="M20 60 Q50 50 80 62 Q110 50 140 62 Q170 50 190 60"
        stroke="#d4a040" strokeWidth="1.5" fill="none" opacity="0.45" strokeDasharray="3 5" />
      {[20, 50, 80, 110, 140, 170, 190].map((x, i) => (
        <circle key={i} cx={x} cy={i % 2 === 0 ? 60 : 56} r="3.5"
          fill={["#f5d060","#3fa8d0","#f4a0a0","#7aab72","#f5d060","#3fa8d0","#f4a0a0"][i]}
          opacity="0.7" />
      ))}

      {/* Cœurs flottants */}
      <path d="M96 36 C96 32 90 28 90 34 C90 38 96 44 96 44 C96 44 102 38 102 34 C102 28 96 32 96 36Z"
        fill="#e87878" opacity="0.7" />
      <path d="M56 56 C56 53 52 50 52 54 C52 57 56 61 56 61 C56 61 60 57 60 54 C60 50 56 53 56 56Z"
        fill="#e87878" opacity="0.5" transform="scale(0.8) translate(14 10)" />
      <path d="M136 54 C136 51 132 48 132 52 C132 55 136 59 136 59 C136 59 140 55 140 52 C140 48 136 51 136 54Z"
        fill="#dba54a" opacity="0.5" transform="scale(0.7) translate(62 22)" />

      {/* ── Capybara gauche ── */}
      <g className="capi-illus-bob">
        <ellipse cx="64"  cy="158" rx="34" ry="28" fill="url(#sc_b1)" />
        <ellipse cx="52"  cy="178" rx="14" ry="9"  fill="url(#sc_limb)" />
        <ellipse cx="76"  cy="178" rx="14" ry="9"  fill="url(#sc_limb)" />
        <path d="M32 154 Q22 152 24 140" stroke="#4E3015" strokeWidth="13" strokeLinecap="round" fill="none" />
        {/* Bras droite vers l'ami */}
        <path d="M94 154 Q108 150 112 148" stroke="#4E3015" strokeWidth="13" strokeLinecap="round" fill="none" />

        <ellipse cx="46"  cy="100" rx="12" ry="10" fill="url(#sc_b1)" />
        <ellipse cx="80"  cy="100" rx="12" ry="10" fill="url(#sc_b1)" />
        <ellipse cx="46"  cy="100" rx="7.5" ry="5.8" fill="#C4915E" opacity="0.6" />
        <ellipse cx="80"  cy="100" rx="7.5" ry="5.8" fill="#C4915E" opacity="0.6" />

        <ellipse cx="64"  cy="118" rx="28" ry="22" fill="url(#sc_b1)" />
        <rect x="50" y="122" width="28" height="16" rx="8" fill="#6B4820" />
        <circle cx="57"  cy="130" r="2" fill="#3E2010" opacity="0.5" />
        <circle cx="71"  cy="130" r="2" fill="#3E2010" opacity="0.5" />

        <circle cx="54"  cy="113" r="6.5" fill="#FFF8EF" />
        <circle cx="74"  cy="113" r="6.5" fill="#FFF8EF" />
        <circle cx="55"  cy="114" r="4.2" fill="#2A1A08" />
        <circle cx="75"  cy="114" r="4.2" fill="#2A1A08" />
        <circle cx="56.5" cy="112" r="1.5" fill="white" opacity="0.92" />
        <circle cx="76.5" cy="112" r="1.5" fill="white" opacity="0.92" />

        <path d="M54 135 Q64 142 74 135" stroke="#3E2010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* ── Capybara droite (couleur plus claire) ── */}
      <g className="capi-illus-bob" style={{ animationDelay: "0.4s" }}>
        <ellipse cx="136" cy="158" rx="34" ry="28" fill="url(#sc_b2)" />
        <ellipse cx="122" cy="178" rx="14" ry="9"  fill="url(#sc_limb)" opacity="0.8" />
        <ellipse cx="148" cy="178" rx="14" ry="9"  fill="url(#sc_limb)" opacity="0.8" />
        {/* Bras gauche vers l'ami */}
        <path d="M104 154 Q92 150 88 148" stroke="#5A3820" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d="M168 154 Q178 152 176 140" stroke="#5A3820" strokeWidth="13" strokeLinecap="round" fill="none" />

        <ellipse cx="120" cy="100" rx="12" ry="10" fill="url(#sc_b2)" />
        <ellipse cx="152" cy="100" rx="12" ry="10" fill="url(#sc_b2)" />
        <ellipse cx="120" cy="100" rx="7.5" ry="5.8" fill="#D4A870" opacity="0.6" />
        <ellipse cx="152" cy="100" rx="7.5" ry="5.8" fill="#D4A870" opacity="0.6" />

        <ellipse cx="136" cy="118" rx="28" ry="22" fill="url(#sc_b2)" />
        <rect x="122" y="122" width="28" height="16" rx="8" fill="#7A5430" />
        <circle cx="129" cy="130" r="2" fill="#4A2A10" opacity="0.5" />
        <circle cx="143" cy="130" r="2" fill="#4A2A10" opacity="0.5" />

        <circle cx="126" cy="113" r="6.5" fill="#FFF8EF" />
        <circle cx="146" cy="113" r="6.5" fill="#FFF8EF" />
        <circle cx="127" cy="114" r="4.2" fill="#2A1A08" />
        <circle cx="147" cy="114" r="4.2" fill="#2A1A08" />
        <circle cx="128.5" cy="112" r="1.5" fill="white" opacity="0.92" />
        <circle cx="148.5" cy="112" r="1.5" fill="white" opacity="0.92" />

        <path d="M126 135 Q136 142 146 135" stroke="#4A2A10" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Fleurs déco */}
      <circle cx="26"  cy="180" r="7"  fill="#f4b0b0" opacity="0.5" />
      <circle cx="26"  cy="180" r="3.5" fill="white"   opacity="0.6" />
      <circle cx="174" cy="182" r="6"  fill="#dba54a"  opacity="0.45" />
      <circle cx="174" cy="182" r="3"  fill="white"    opacity="0.6" />
    </svg>
  );
}

// ── CapyStats ─────────────────────────────────────────────────────
export function CapyStats({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="st_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c0e8f8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c0e8f8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="st_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="st_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#st_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Tableau de graphiques */}
      <rect x="22" y="82" width="100" height="74" rx="8" fill="white" opacity="0.82" stroke="#ddd0b8" strokeWidth="1.5" />
      {/* Grille */}
      {[96, 110, 124, 138].map((y, i) => (
        <line key={i} x1="34" y1={y} x2="112" y2={y} stroke="#e8e0d0" strokeWidth="0.8" />
      ))}
      {/* Barres */}
      <rect x="38"  y="120" width="13" height="30" rx="4" fill="#3fa8d0" opacity="0.75" />
      <rect x="56"  y="104" width="13" height="46" rx="4" fill="#dba54a" opacity="0.8"  />
      <rect x="74"  y="96"  width="13" height="54" rx="4" fill="#7aab72" opacity="0.75" />
      <rect x="92"  y="112" width="13" height="38" rx="4" fill="#3fa8d0" opacity="0.6"  />
      {/* Axe X */}
      <line x1="32" y1="150" x2="114" y2="150" stroke="#c8b898" strokeWidth="1.5" />
      {/* Ligne de tendance */}
      <path d="M44 126 Q62 110 80 100 Q94 94 98 104"
        stroke="#dba54a" strokeWidth="2" fill="none" strokeDasharray="5 3" opacity="0.7" />
      <circle cx="98" cy="104" r="4" fill="#dba54a" opacity="0.85" />

      {/* ── Personnage ── */}
      <g className="capi-illus-bob">
        <ellipse cx="140" cy="156" rx="38" ry="30" fill="url(#st_body)" />
        <ellipse cx="126" cy="144" rx="16" ry="10" fill="#BA8D5C" opacity="0.28" />

        <ellipse cx="106" cy="178" rx="15" ry="9"  fill="url(#st_limb)" />
        <ellipse cx="170" cy="178" rx="15" ry="9"  fill="url(#st_limb)" />

        {/* Bras (un pointe le graphique) */}
        <path d="M104 150 Q88 144 82 134 Q76 124 84 118"
          stroke="#4E3015" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M172 150 Q184 148 182 136"
          stroke="#4E3015" strokeWidth="14" strokeLinecap="round" fill="none" />

        <ellipse cx="116" cy="100" rx="13" ry="10" fill="url(#st_body)" />
        <ellipse cx="162" cy="100" rx="13" ry="10" fill="url(#st_body)" />
        <ellipse cx="116" cy="100" rx="8"  ry="6"  fill="#C4915E" opacity="0.6" />
        <ellipse cx="162" cy="100" rx="8"  ry="6"  fill="#C4915E" opacity="0.6" />

        <ellipse cx="140" cy="118" rx="32" ry="25" fill="url(#st_body)" />
        <ellipse cx="128" cy="108" rx="13" ry="9"  fill="#BA8D5C" opacity="0.26" />

        <rect x="122" y="122" width="36" height="20" rx="10" fill="#6B4820" />
        <rect x="124" y="124" width="14" height="9"  rx="4.5" fill="#8C6840" opacity="0.35" />
        <circle cx="131" cy="129" r="2.2" fill="#3E2010" opacity="0.5" />
        <circle cx="149" cy="129" r="2.2" fill="#3E2010" opacity="0.5" />

        <circle cx="128" cy="111" r="7"   fill="#FFF8EF" />
        <circle cx="152" cy="111" r="7"   fill="#FFF8EF" />
        <circle cx="129" cy="112" r="4.5" fill="#2A1A08" />
        <circle cx="153" cy="112" r="4.5" fill="#2A1A08" />
        <circle cx="130.5" cy="110" r="1.7" fill="white" opacity="0.92" />
        <circle cx="154.5" cy="110" r="1.7" fill="white" opacity="0.92" />

        {/* Lunettes */}
        <circle cx="128" cy="111" r="8.5" fill="none" stroke="#4E3015" strokeWidth="1.8" opacity="0.4" />
        <circle cx="152" cy="111" r="8.5" fill="none" stroke="#4E3015" strokeWidth="1.8" opacity="0.4" />
        <line x1="136.5" y1="111" x2="143.5" y2="111" stroke="#4E3015" strokeWidth="1.8" opacity="0.4" />
        <line x1="119.5" y1="108" x2="114"  y2="106" stroke="#4E3015" strokeWidth="1.8" opacity="0.4" />
        <line x1="160.5" y1="108" x2="166"  y2="106" stroke="#4E3015" strokeWidth="1.8" opacity="0.4" />

        <path d="M130 133 Q140 140 150 133"
          stroke="#3E2010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Déco */}
      <circle cx="18"  cy="112" r="3.5" fill="#3fa8d0" opacity="0.4" />
      <circle cx="14"  cy="122" r="2"   fill="#dba54a" opacity="0.35" />
      <circle cx="186" cy="106" r="3"   fill="#dba54a" opacity="0.4" />
    </svg>
  );
}

// ── CapyCheck ─────────────────────────────────────────────────────
export function CapyCheck({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="ck_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8f0d8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c8f0d8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ck_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="ck_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
        <linearGradient id="ck_shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7ed4f0" />
          <stop offset="100%" stopColor="#2888b0" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#ck_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Bouclier */}
      <path d="M100 72 L68 84 L68 116 Q68 144 100 158 Q132 144 132 116 L132 84 Z"
        fill="url(#ck_shield)" opacity="0.18" />
      <path d="M100 78 L74 88 L74 116 Q74 140 100 152 Q126 140 126 116 L126 88 Z"
        fill="url(#ck_shield)" opacity="0.28" />
      {/* Bord brillant */}
      <path d="M100 78 L74 88 L74 116 Q74 140 100 152"
        stroke="white" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Grande coche */}
      <path d="M82 114 L94 128 L120 100"
        stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      {/* Halo de la coche */}
      <path d="M82 114 L94 128 L120 100"
        stroke="#3fa8d0" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />

      {/* Particules de validation */}
      {[
        { x: 52, y: 88,  c: "#3fa8d0", s: 4   },
        { x: 46, y: 106, c: "#dba54a", s: 3   },
        { x: 56, y: 122, c: "#7aab72", s: 3.5 },
        { x: 148,y: 90,  c: "#3fa8d0", s: 4   },
        { x: 154,y: 108, c: "#dba54a", s: 3   },
        { x: 144,y: 124, c: "#7aab72", s: 3.5 },
      ].map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.c} opacity="0.55" />
      ))}

      {/* ── Personnage ── */}
      <g className="capi-illus-bob">
        <ellipse cx="100" cy="156" rx="40" ry="32" fill="url(#ck_body)" />
        <ellipse cx="86"  cy="144" rx="16" ry="10" fill="#BA8D5C" opacity="0.28" />

        <ellipse cx="64"  cy="180" rx="16" ry="10" fill="url(#ck_limb)" />
        <ellipse cx="136" cy="180" rx="16" ry="10" fill="url(#ck_limb)" />

        <path d="M62 150 Q46 148 48 138"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M138 150 Q154 148 152 138 Q150 130 140 128"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />

        <ellipse cx="70"  cy="94" rx="14" ry="11" fill="url(#ck_body)" />
        <ellipse cx="130" cy="94" rx="14" ry="11" fill="url(#ck_body)" />
        <ellipse cx="70"  cy="94" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="94" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />

        <ellipse cx="100" cy="114" rx="34" ry="26" fill="url(#ck_body)" />
        <ellipse cx="88"  cy="104" rx="14" ry="9"  fill="#BA8D5C" opacity="0.26" />

        <rect x="80" y="118" width="40" height="22" rx="11" fill="#6B4820" />
        <rect x="82" y="120" width="16" height="10" rx="5" fill="#8C6840" opacity="0.35" />
        <circle cx="91"  cy="126" r="2.5" fill="#3E2010" opacity="0.5" />
        <circle cx="109" cy="126" r="2.5" fill="#3E2010" opacity="0.5" />

        <circle cx="86"  cy="109" r="7.5" fill="#FFF8EF" />
        <circle cx="114" cy="109" r="7.5" fill="#FFF8EF" />
        <circle cx="87"  cy="110" r="4.8" fill="#2A1A08" />
        <circle cx="115" cy="110" r="4.8" fill="#2A1A08" />
        <circle cx="89"  cy="108" r="1.8" fill="white"  opacity="0.92" />
        <circle cx="117" cy="108" r="1.8" fill="white"  opacity="0.92" />

        <path d="M88 130 Q100 138 112 130"
          stroke="#3E2010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Plante déco */}
      <ellipse cx="18"  cy="190" rx="8"  ry="14" fill="#7aab72" opacity="0.4" transform="rotate(-18 18 190)" />
      <ellipse cx="182" cy="192" rx="8"  ry="14" fill="#7aab72" opacity="0.38" transform="rotate(18 182 192)" />
    </svg>
  );
}

// ── CapyNotif ─────────────────────────────────────────────────────
export function CapyNotif({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="nt_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde8b8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fde8b8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nt_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="nt_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
        <linearGradient id="nt_bell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fce89a" />
          <stop offset="100%" stopColor="#c88c30" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#nt_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Cloche */}
      <g transform="translate(62, 60)">
        {/* Corps de la cloche */}
        <path d="M38 16 Q16 20 14 46 L14 62 L62 62 L62 46 Q60 20 38 16Z"
          fill="url(#nt_bell)" />
        {/* Brillance */}
        <path d="M38 16 Q24 20 22 46 L22 62"
          fill="white" opacity="0.2" />
        {/* Barre horizontale en haut */}
        <rect x="8"  y="60" width="60" height="8"  rx="4" fill="url(#nt_bell)" />
        {/* Battant */}
        <ellipse cx="38" cy="74" rx="10" ry="7" fill="url(#nt_bell)" opacity="0.85" />
        {/* Tige */}
        <line x1="38" y1="10" x2="38" y2="18" stroke="#8C6020" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        {/* Ondes sonores */}
        <path d="M72 30 Q82 38 78 50" stroke="#dba54a" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M76 24 Q90 34 86 52" stroke="#dba54a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.35" />
        <path d="M4 30 Q-6 38 -2 50"  stroke="#dba54a" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M0 24 Q-14 34 -10 52" stroke="#dba54a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.35" />
      </g>

      {/* Badges notification */}
      <circle cx="148" cy="76" r="12" fill="#e85050" opacity="0.85" />
      <text x="144" y="81" fontSize="11" fontWeight="800" fill="white" opacity="0.95">3</text>
      <circle cx="32" cy="100" r="10" fill="#3fa8d0" opacity="0.6" />
      <text x="29"  y="105" fontSize="10" fontWeight="700" fill="white" opacity="0.9">!</text>

      {/* ── Personnage (regard vers le haut, excité) ── */}
      <g className="capi-illus-bob">
        <ellipse cx="100" cy="156" rx="40" ry="32" fill="url(#nt_body)" />
        <ellipse cx="86"  cy="144" rx="16" ry="10" fill="#BA8D5C" opacity="0.28" />

        <ellipse cx="64"  cy="180" rx="16" ry="10" fill="url(#nt_limb)" />
        <ellipse cx="136" cy="180" rx="16" ry="10" fill="url(#nt_limb)" />

        <path d="M62 148 Q48 146 50 134"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M138 148 Q154 146 152 134"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />

        {/* Oreilles légèrement dressées (excité) */}
        <ellipse cx="70"  cy="86" rx="14" ry="13" fill="url(#nt_body)" />
        <ellipse cx="130" cy="86" rx="14" ry="13" fill="url(#nt_body)" />
        <ellipse cx="70"  cy="86" rx="8.5" ry="7.5" fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="86" rx="8.5" ry="7.5" fill="#C4915E" opacity="0.6" />

        <ellipse cx="100" cy="112" rx="34" ry="26" fill="url(#nt_body)" />
        <ellipse cx="88"  cy="102" rx="14" ry="9"  fill="#BA8D5C" opacity="0.26" />

        <rect x="80" y="116" width="40" height="22" rx="11" fill="#6B4820" />
        <rect x="82" y="118" width="16" height="10" rx="5" fill="#8C6840" opacity="0.35" />
        <circle cx="91"  cy="124" r="2.5" fill="#3E2010" opacity="0.5" />
        <circle cx="109" cy="124" r="2.5" fill="#3E2010" opacity="0.5" />

        {/* Yeux grands ouverts (regard vers le haut) */}
        <circle cx="86"  cy="105" r="8.5" fill="#FFF8EF" />
        <circle cx="114" cy="105" r="8.5" fill="#FFF8EF" />
        {/* Pupilles vers le haut */}
        <circle cx="86"  cy="103" r="5.5" fill="#2A1A08" />
        <circle cx="114" cy="103" r="5.5" fill="#2A1A08" />
        <circle cx="87.5" cy="101" r="2" fill="white" opacity="0.92" />
        <circle cx="115.5" cy="101" r="2" fill="white" opacity="0.92" />

        <path d="M88 128 Q100 138 112 128"
          stroke="#3E2010" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
      </g>

      {/* Déco flottante */}
      <circle cx="26"  cy="76" r="4" fill="#dba54a" opacity="0.4"  />
      <circle cx="22"  cy="86" r="2.5" fill="#dba54a" opacity="0.3" />
      <circle cx="172" cy="170" r="3" fill="#3fa8d0" opacity="0.4" />
    </svg>
  );
}

// ── CapyDashboard ─────────────────────────────────────────────────
export function CapyDashboard({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 230" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="db_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5e8c8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#f5e8c8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="db_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="db_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
      </defs>

      {/* Grand fond lumineux */}
      <circle cx="100" cy="122" r="92" fill="url(#db_bg)" />
      <ellipse cx="100" cy="212" rx="55" ry="10" fill="#3E2510" opacity="0.09" />

      {/* Plantes gauche */}
      <ellipse cx="18"  cy="172" rx="11" ry="20" fill="#7aab72" opacity="0.5"  transform="rotate(-22 18 172)" />
      <ellipse cx="8"   cy="186" rx="9"  ry="16" fill="#b3d4ad" opacity="0.45" transform="rotate(12 8 186)" />
      <ellipse cx="28"  cy="192" rx="8"  ry="14" fill="#7aab72" opacity="0.4"  transform="rotate(-6 28 192)" />
      <rect x="16" y="194" width="5" height="14" rx="2.5" fill="#5a8a54" opacity="0.25" />

      {/* Plantes droite */}
      <ellipse cx="182" cy="168" rx="11" ry="20" fill="#7aab72" opacity="0.5"  transform="rotate(22 182 168)" />
      <ellipse cx="192" cy="182" rx="9"  ry="16" fill="#b3d4ad" opacity="0.45" transform="rotate(-12 192 182)" />
      <ellipse cx="172" cy="190" rx="8"  ry="14" fill="#7aab72" opacity="0.4"  transform="rotate(6 172 190)" />
      <rect x="179" y="194" width="5" height="14" rx="2.5" fill="#5a8a54" opacity="0.25" />

      {/* ── Personnage (bras grands ouverts, accueillant) ── */}
      <g className="capi-illus-bob">
        {/* Corps */}
        <ellipse cx="100" cy="158" rx="44" ry="36" fill="url(#db_body)" />
        <ellipse cx="84"  cy="144" rx="20" ry="13" fill="#BA8D5C" opacity="0.26" />

        {/* Pattes */}
        <ellipse cx="66"  cy="184" rx="18" ry="11" fill="url(#db_limb)" />
        <ellipse cx="134" cy="184" rx="18" ry="11" fill="url(#db_limb)" />

        {/* Bras largement ouverts (accueil) */}
        <path d="M60 150 Q40 140 28 126"
          stroke="#4E3015" strokeWidth="16" strokeLinecap="round" fill="none" />
        <path d="M140 150 Q160 140 172 126"
          stroke="#4E3015" strokeWidth="16" strokeLinecap="round" fill="none" />

        {/* Petites mains ouvertes */}
        <circle cx="26"  cy="122" r="8" fill="url(#db_limb)" />
        <circle cx="174" cy="122" r="8" fill="url(#db_limb)" />

        {/* Oreilles */}
        <ellipse cx="70"  cy="90" rx="15" ry="12" fill="url(#db_body)" />
        <ellipse cx="130" cy="90" rx="15" ry="12" fill="url(#db_body)" />
        <ellipse cx="70"  cy="90" rx="9"  ry="7"  fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="90" rx="9"  ry="7"  fill="#C4915E" opacity="0.6" />

        {/* Tête */}
        <ellipse cx="100" cy="110" rx="36" ry="28" fill="url(#db_body)" />
        <ellipse cx="86"  cy="98"  rx="16" ry="10" fill="#BA8D5C" opacity="0.24" />

        {/* Museau */}
        <rect x="78" y="114" width="44" height="24" rx="12" fill="#6B4820" />
        <rect x="80" y="116" width="18" height="11" rx="5.5" fill="#8C6840" opacity="0.35" />
        <circle cx="90"  cy="123" r="2.8" fill="#3E2010" opacity="0.5" />
        <circle cx="110" cy="123" r="2.8" fill="#3E2010" opacity="0.5" />

        {/* Yeux joyeux */}
        <circle cx="84"  cy="104" r="8.5" fill="#FFF8EF" />
        <circle cx="116" cy="104" r="8.5" fill="#FFF8EF" />
        <circle cx="85"  cy="105" r="5.5" fill="#2A1A08" />
        <circle cx="117" cy="105" r="5.5" fill="#2A1A08" />
        <circle cx="86.5" cy="103" r="2"  fill="white" opacity="0.92" />
        <circle cx="118.5" cy="103" r="2" fill="white" opacity="0.92" />

        {/* Grand sourire */}
        <path d="M86 130 Q100 142 114 130"
          stroke="#3E2010" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
      </g>

      {/* ── Étoiles et étincelles ── */}
      {/* Grande étoile or gauche */}
      <g opacity="0.8">
        <line x1="32" y1="64" x2="32" y2="52" stroke="#dba54a" strokeWidth="3" strokeLinecap="round" />
        <line x1="26" y1="58" x2="38" y2="58" stroke="#dba54a" strokeWidth="3" strokeLinecap="round" />
        <line x1="23" y1="50" x2="27" y2="54" stroke="#dba54a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="37" y1="50" x2="41" y2="54" stroke="#dba54a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="23" y1="66" x2="27" y2="62" stroke="#dba54a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="37" y1="66" x2="41" y2="62" stroke="#dba54a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <circle cx="32" cy="58" r="4.5" fill="#dba54a" />
      </g>
      {/* Grande étoile teal droite */}
      <g opacity="0.75">
        <line x1="168" y1="58" x2="168" y2="48" stroke="#3fa8d0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="163" y1="53" x2="173" y2="53" stroke="#3fa8d0" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="168" cy="53" r="4" fill="#3fa8d0" />
      </g>
      {/* Petites étoiles éparpillées */}
      <circle cx="56"  cy="54" r="3.5" fill="#dba54a" opacity="0.4"  />
      <circle cx="50"  cy="64" r="2"   fill="#dba54a" opacity="0.3"  />
      <circle cx="150" cy="50" r="4"   fill="#3fa8d0" opacity="0.4"  />
      <circle cx="158" cy="62" r="2.5" fill="#3fa8d0" opacity="0.35" />
      <circle cx="145" cy="70" r="2"   fill="#7aab72" opacity="0.4"  />
      <circle cx="52"  cy="72" r="2"   fill="#7aab72" opacity="0.35" />
    </svg>
  );
}

// ── CapySettings ──────────────────────────────────────────────────
export function CapySettings({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 200 220" fill="none" overflow="visible"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <defs>
        <radialGradient id="sg_bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8e0d0" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e8e0d0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sg_body" cx="36%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="#C89A62" />
          <stop offset="52%"  stopColor="#8C6840" />
          <stop offset="100%" stopColor="#4E3015" />
        </radialGradient>
        <radialGradient id="sg_limb" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#7A5430" />
          <stop offset="100%" stopColor="#3E2510" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="118" r="86" fill="url(#sg_bg)" />
      <ellipse cx="100" cy="204" rx="50" ry="9" fill="#3E2510" opacity="0.1" />

      {/* Grand engrenage */}
      <g transform="translate(110, 74)" opacity="0.75">
        <circle cx="30" cy="30" r="22" fill="#e8d8b8" stroke="#c4a860" strokeWidth="2" />
        <circle cx="30" cy="30" r="10" fill="white"   opacity="0.7" />
        {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a, i) => (
          <rect key={i} x="26" y="4" width="8" height="12" rx="3"
            fill="#c4a860" transform={`rotate(${a} 30 30)`} />
        ))}
        <circle cx="30" cy="30" r="5" fill="#dba54a" opacity="0.9" />
      </g>

      {/* Petite clé */}
      <g transform="rotate(-40 56 108)" opacity="0.7">
        <circle cx="46" cy="90" r="14" fill="none" stroke="#dba54a" strokeWidth="4" />
        <circle cx="46" cy="90" r="6"  fill="none" stroke="#dba54a" strokeWidth="3" />
        <line x1="56" y1="100" x2="78" y2="122" stroke="#dba54a" strokeWidth="4" strokeLinecap="round" />
        <line x1="68" y1="114" x2="72" y2="110" stroke="#dba54a" strokeWidth="3" strokeLinecap="round" />
        <line x1="72" y1="118" x2="76" y2="114" stroke="#dba54a" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* ── Personnage ── */}
      <g className="capi-illus-bob">
        <ellipse cx="100" cy="154" rx="40" ry="32" fill="url(#sg_body)" />
        <ellipse cx="86"  cy="142" rx="16" ry="10" fill="#BA8D5C" opacity="0.28" />

        <ellipse cx="64"  cy="178" rx="16" ry="10" fill="url(#sg_limb)" />
        <ellipse cx="136" cy="178" rx="16" ry="10" fill="url(#sg_limb)" />

        <path d="M62 146 Q46 144 48 132"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />
        <path d="M138 146 Q154 144 152 132 Q150 124 140 122"
          stroke="#4E3015" strokeWidth="15" strokeLinecap="round" fill="none" />

        <ellipse cx="70"  cy="92" rx="14" ry="11" fill="url(#sg_body)" />
        <ellipse cx="130" cy="92" rx="14" ry="11" fill="url(#sg_body)" />
        <ellipse cx="70"  cy="92" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />
        <ellipse cx="130" cy="92" rx="8.5" ry="6.5" fill="#C4915E" opacity="0.6" />

        <ellipse cx="100" cy="112" rx="34" ry="26" fill="url(#sg_body)" />
        <ellipse cx="88"  cy="102" rx="14" ry="9"  fill="#BA8D5C" opacity="0.26" />

        <rect x="80" y="116" width="40" height="22" rx="11" fill="#6B4820" />
        <rect x="82" y="118" width="16" height="10" rx="5" fill="#8C6840" opacity="0.35" />
        <circle cx="91"  cy="124" r="2.5" fill="#3E2010" opacity="0.5" />
        <circle cx="109" cy="124" r="2.5" fill="#3E2010" opacity="0.5" />

        <circle cx="86"  cy="107" r="7.5" fill="#FFF8EF" />
        <circle cx="114" cy="107" r="7.5" fill="#FFF8EF" />
        <circle cx="87"  cy="108" r="4.8" fill="#2A1A08" />
        <circle cx="115" cy="108" r="4.8" fill="#2A1A08" />
        <circle cx="89"  cy="106" r="1.8" fill="white"  opacity="0.92" />
        <circle cx="117" cy="106" r="1.8" fill="white"  opacity="0.92" />

        <path d="M88 128 Q100 136 112 128"
          stroke="#3E2010" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      </g>

      <circle cx="26"  cy="72" r="3.5" fill="#dba54a" opacity="0.45" />
      <circle cx="172" cy="160" r="3" fill="#3fa8d0" opacity="0.4"  />
    </svg>
  );
}

// ── LeafSprig (décoratif) ─────────────────────────────────────────
export function LeafSprig({ className, style }: IlluProps) {
  return (
    <svg viewBox="0 0 48 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <line x1="24" y1="70" x2="24" y2="16" stroke="#5a8a54" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
      <path d="M24 46 Q8 38 6 24 Q10 14 24 22Z"  fill="#7aab72" opacity="0.65" />
      <path d="M24 46 Q40 38 42 24 Q38 14 24 22Z" fill="#7aab72" opacity="0.6"  />
      <path d="M24 28 Q10 20 10 8 Q16 2 24 14Z"  fill="#b3d4ad" opacity="0.65" />
      <path d="M24 28 Q38 20 38 8 Q32 2 24 14Z"  fill="#b3d4ad" opacity="0.6"  />
    </svg>
  );
}

// ── StarBurst (décoratif) ─────────────────────────────────────────
export function StarBurst({ className, style, color = "#dba54a" }: IlluProps & { color?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <circle cx="16" cy="16" r="5" fill={color} opacity="0.85" />
      {[0, 45, 90, 135].map((a, i) => (
        <g key={i} transform={`rotate(${a} 16 16)`}>
          <line x1="16" y1="3"  x2="16" y2="9"  stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
          <line x1="16" y1="23" x2="16" y2="29" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        </g>
      ))}
      <circle cx="16" cy="16" r="2" fill="white" opacity="0.7" />
    </svg>
  );
}
