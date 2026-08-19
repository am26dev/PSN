/* Logótipo oficial do PSN. */
export function Logo({ branco = false }: { branco?: boolean }) {
  const src = branco ? "/brand/logotipo-branco-psn.png" : "/brand/logotipo-psn.png";
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={src} alt="Portal de Saúde Nacional" className="h-10 w-auto" />
  );
}
