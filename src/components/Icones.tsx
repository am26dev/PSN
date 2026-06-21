// Conjunto de ícones de linha (stroke) elegantes, desenhados localmente em SVG.
// Sem dependências externas — herdam a cor do texto (currentColor).

type Props = { className?: string };

const base = (children: React.ReactNode, className?: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className ?? "h-6 w-6"}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconeRede = ({ className }: Props) =>
  base(
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M12 7v4m0 0-5.5 6m5.5-6 5.5 6" />
    </>,
    className,
  );

export const IconeCalendario = ({ className }: Props) =>
  base(
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3m8-3v3" />
      <path d="m9 14 2 2 4-4" />
    </>,
    className,
  );

export const IconeFamilia = ({ className }: Props) =>
  base(
    <>
      <circle cx="8" cy="8" r="2.5" />
      <circle cx="16.5" cy="9" r="2" />
      <path d="M3.5 19a4.5 4.5 0 0 1 9 0M14 19a4 4 0 0 1 6.5-3.1" />
    </>,
    className,
  );

export const IconeEscudo = ({ className }: Props) =>
  base(
    <>
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>,
    className,
  );

export const IconeSeguro = ({ className }: Props) =>
  base(
    <>
      <path d="M12 21s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.7-7 10-7 10Z" />
    </>,
    className,
  );

export const IconeUrgencia = ({ className }: Props) =>
  base(
    <>
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </>,
    className,
  );

export const IconeEstetoscopio = ({ className }: Props) =>
  base(
    <>
      <path d="M5 3v6a4 4 0 0 0 8 0V3" />
      <path d="M9 13v2a5 5 0 0 0 10 0v-2" />
      <circle cx="19" cy="9" r="2" />
    </>,
    className,
  );

export const IconeDocumento = ({ className }: Props) =>
  base(
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4M9 13h6M9 17h6" />
    </>,
    className,
  );

export const IconeUtilizadores = ({ className }: Props) =>
  base(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2-4.2" />
    </>,
    className,
  );

export const IconeUnidade = ({ className }: Props) =>
  base(
    <>
      <path d="M4 21V8l8-4 8 4v13" />
      <path d="M4 21h16M10 12h4m-2-2v4" />
      <path d="M9 21v-4h6v4" />
    </>,
    className,
  );

export const IconeTexto = ({ className }: Props) =>
  base(
    <>
      <path d="M5 5h14M5 5v3M12 5v14M9 19h6" />
    </>,
    className,
  );

export const IconeVerificacao = ({ className }: Props) =>
  base(
    <>
      <path d="M9 12.5 11 14.5 15.5 10" />
      <circle cx="12" cy="12" r="9" />
    </>,
    className,
  );

export const IconePesquisa = ({ className }: Props) =>
  base(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
    className,
  );
