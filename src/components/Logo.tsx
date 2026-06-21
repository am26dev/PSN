/** Marca PSN — pin de localização (vermelho/preto) com cruz médica e pontos de
 * conectividade, fiel ao logótipo oficial. */
export function MarcaPin({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="psnPin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="50%" stopColor="#CC092F" />
          <stop offset="50%" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>

      {/* Pontos de conectividade — arcos vermelhos (esq.) e preto (dir.) */}
      <path d="M52 86 C40 50 70 26 104 32" stroke="#CC092F" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M150 96 C168 134 140 168 112 182" stroke="#0A0A0A" strokeWidth="7" fill="none" strokeLinecap="round" />
      <Dot cx={108} cy={30} cor="#CC092F" />
      <Dot cx={48} cy={90} cor="#CC092F" />
      <Dot cx={154} cy={98} cor="#0A0A0A" />

      {/* Pin */}
      <path
        d="M100 26 C63 26 34 55 34 92 C34 132 100 192 100 192 C100 192 166 132 166 92 C166 55 137 26 100 26 Z"
        fill="url(#psnPin)"
      />
      {/* Cruz branca */}
      <rect x="87" y="50" width="26" height="74" rx="3" fill="#fff" />
      <rect x="63" y="74" width="74" height="26" rx="3" fill="#fff" />
    </svg>
  );
}

function Dot({ cx, cy, cor }: { cx: number; cy: number; cor: string }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="11" fill={cor} />
      <circle cx={cx} cy={cy} r="5" fill="#FFCB00" />
    </>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <MarcaPin size={34} />
      <span className="text-lg font-extrabold tracking-tight text-angola-black">
        PS<span className="text-angola-red">N</span>
      </span>
    </span>
  );
}
