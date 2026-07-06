type ToggleProps = {
  checked: boolean;
  description?: string;
  label: string;
  onChange: (checked: boolean) => void;
};

export function Toggle({ checked, description, label, onChange }: ToggleProps) {
  return (
    <label className="ui-toggle">
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="ui-toggle-track" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}
