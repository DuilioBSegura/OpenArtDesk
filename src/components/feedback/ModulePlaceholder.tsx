type ModulePlaceholderProps = {
  title?: string;
  items: string[];
};

export function ModulePlaceholder({
  title = "Base modular preparada",
  items,
}: ModulePlaceholderProps) {
  return (
    <section className="placeholder-panel" aria-label="Escopo deste modulo">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
