type ThemeOptionProps<TValue extends string> = {
  active: boolean;
  description: string;
  label: string;
  onSelect: (value: TValue) => void;
  swatch?: string;
  value: TValue;
};

export function ThemeOption<TValue extends string>({
  active,
  description,
  label,
  onSelect,
  swatch,
  value,
}: ThemeOptionProps<TValue>) {
  return (
    <button
      aria-pressed={active}
      className="theme-option"
      data-active={active}
      onClick={() => onSelect(value)}
      type="button"
    >
      {swatch ? (
        <span
          className="theme-option-swatch"
          style={{ background: swatch }}
          aria-hidden="true"
        />
      ) : null}
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}
