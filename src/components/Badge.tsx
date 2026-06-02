export function Badge({
  texto,
  cor,
}: {
  texto: string;
  cor: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cor}`}
    >
      {texto}
    </span>
  );
}
